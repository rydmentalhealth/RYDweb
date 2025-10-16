import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole, LeaveType } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const leaveRequestSchema = z.object({
  employeeId: z.string(),
  type: z.enum(['ANNUAL', 'SICK', 'STUDY', 'COMPASSIONATE', 'MATERNITY', 'PATERNITY', 'EMERGENCY', 'UNPAID', 'OTHER']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
  attachments: z.string().optional(),
  handoverNotes: z.string().optional(),
});

// Helper function to check permissions
function canManageLeave(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// Helper function to calculate working days between two dates
function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // Exclude weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

// GET /api/leave/requests - Get leave requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Users can view their own requests, managers can view team requests
    if (employeeId && canManageLeave(session.user.role)) {
      where.employeeId = employeeId;
    } else {
      // Get user's employee profile
      const employeeProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!employeeProfile) {
        return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
      }

      where.employeeId = employeeProfile.id;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          leaveType: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leave/requests - Create leave request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = leaveRequestSchema.parse(body);

    // Check if user can create leave for this employee
    const employeeProfile = await prisma.employeeProfile.findUnique({
      where: { id: validatedData.employeeId },
      include: { user: true },
    });

    if (!employeeProfile) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Users can only create leave for themselves unless they're managers
    if (employeeProfile.userId !== session.user.id && !canManageLeave(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);
    
    if (startDate > endDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    const days = calculateWorkingDays(startDate, endDate);

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const leaveBalance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveType_year: {
          employeeId: validatedData.employeeId,
          leaveType: validatedData.type,
          year: currentYear,
        },
      },
    });

    if (leaveBalance && leaveBalance.remaining < days) {
      return NextResponse.json({ 
        error: `Insufficient leave balance. You have ${leaveBalance.remaining} days remaining.` 
      }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: validatedData.employeeId,
        type: validatedData.type,
        startDate,
        endDate,
        days,
        reason: validatedData.reason,
        attachments: validatedData.attachments,
        handoverNotes: validatedData.handoverNotes,
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'leave_request',
        resourceId: leaveRequest.id,
        details: {
          type: validatedData.type,
          days,
        },
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
