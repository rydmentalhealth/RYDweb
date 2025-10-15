import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createEmployeeSchema = z.object({
  userId: z.string(),
  fullName: z.string().min(1),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  supervisorId: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VOLUNTEER', 'INTERN']).default('FULL_TIME'),
  startDate: z.string().optional(),
  bio: z.string().optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial().omit({ userId: true });

// Helper function to check permissions
function hasEmployeePermission(userRole: UserRole, action: 'create' | 'read' | 'update' | 'delete') {
  switch (userRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return true;
    case 'HR_OFFICER':
      return ['create', 'read', 'update'].includes(action);
    case 'DIRECTOR':
      return action === 'read';
    case 'TEAM_LEAD':
      return action === 'read';
    case 'STAFF':
    case 'VOLUNTEER':
      return false;
    default:
      return false;
  }
}

// Generate employee ID in RYD-YYMM-XXXX format
function generateEmployeeId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  // Generate random 4-digit number
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `RYD-${year}${month}-${randomNum}`;
}

// GET /api/employees - List all employees with filtering and search
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasEmployeePermission(session.user.role, 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (department) {
      where.department = department;
    }
    
    if (status) {
      where.status = status;
    }

    // If user is TEAM_LEAD, only show their department
    if (session.user.role === 'TEAM_LEAD') {
      const userProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        select: { department: true }
      });
      if (userProfile?.department) {
        where.department = userProfile.department;
      }
    }

    const [employees, total] = await Promise.all([
      prisma.employeeProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            }
          },
          supervisor: {
            select: {
              id: true,
              fullName: true,
              employeeId: true,
            }
          },
          _count: {
            select: {
              documents: true,
              performanceReviews: true,
              leaveRequests: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.employeeProfile.count({ where })
    ]);

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasEmployeePermission(session.user.role, 'create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createEmployeeSchema.parse(body);

    // Check if user already has an employee profile
    const existingProfile = await prisma.employeeProfile.findUnique({
      where: { userId: validatedData.userId }
    });

    if (existingProfile) {
      return NextResponse.json({ error: 'User already has an employee profile' }, { status: 400 });
    }

    // Generate unique employee ID
    let employeeId: string;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      employeeId = generateEmployeeId();
      const existing = await prisma.employeeProfile.findUnique({
        where: { employeeId }
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique employee ID' }, { status: 500 });
    }

    // Create employee profile
    const employee = await prisma.employeeProfile.create({
      data: {
        ...validatedData,
        employeeId: employeeId!,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : new Date(),
        createdById: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          }
        },
        supervisor: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'employee',
        resourceId: employee.id,
        details: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
        }
      }
    });

    return NextResponse.json(employee, { status: 201 });

  } catch (error) {
    console.error('Error creating employee:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
