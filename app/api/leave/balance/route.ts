import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole, LeaveType } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const leaveBalanceSchema = z.object({
  employeeId: z.string(),
  leaveType: z.enum(['ANNUAL', 'SICK', 'STUDY', 'COMPASSIONATE', 'MATERNITY', 'PATERNITY', 'EMERGENCY', 'UNPAID', 'OTHER']),
  year: z.number(),
  allocated: z.number(),
  carried: z.number().optional().default(0),
});

// Helper function to check permissions
function canManageLeave(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER'].includes(userRole);
}

// GET /api/leave/balance - Get leave balances
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Determine which employee's balance to fetch
    let targetEmployeeId: string | undefined;
    
    if (employeeId && canManageLeave(session.user.role)) {
      targetEmployeeId = employeeId;
    } else {
      // Get user's employee profile
      const employeeProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!employeeProfile) {
        return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
      }

      targetEmployeeId = employeeProfile.id;
    }

    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: targetEmployeeId,
        year,
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
      orderBy: { leaveType: 'asc' },
    });

    // If no balances exist, create default ones
    if (balances.length === 0 && canManageLeave(session.user.role)) {
      const defaultLeaveTypes: LeaveType[] = ['ANNUAL', 'SICK', 'STUDY'];
      const defaultAllocations = { ANNUAL: 21, SICK: 15, STUDY: 10 };

      for (const leaveType of defaultLeaveTypes) {
        await prisma.leaveBalance.create({
          data: {
            employeeId: targetEmployeeId,
            leaveType,
            year,
            allocated: defaultAllocations[leaveType] || 0,
            used: 0,
            remaining: defaultAllocations[leaveType] || 0,
            carried: 0,
          },
        });
      }

      // Refetch balances
      const newBalances = await prisma.leaveBalance.findMany({
        where: {
          employeeId: targetEmployeeId,
          year,
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
        orderBy: { leaveType: 'asc' },
      });

      return NextResponse.json({ balances: newBalances });
    }

    return NextResponse.json({ balances });
  } catch (error) {
    console.error('Error fetching leave balances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leave/balance - Create or update leave balance
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageLeave(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = leaveBalanceSchema.parse(body);

    const remaining = validatedData.allocated + validatedData.carried;

    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveType_year: {
          employeeId: validatedData.employeeId,
          leaveType: validatedData.leaveType,
          year: validatedData.year,
        },
      },
      update: {
        allocated: validatedData.allocated,
        carried: validatedData.carried,
        remaining: { set: remaining },
      },
      create: {
        employeeId: validatedData.employeeId,
        leaveType: validatedData.leaveType,
        year: validatedData.year,
        allocated: validatedData.allocated,
        used: 0,
        remaining,
        carried: validatedData.carried,
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
        action: 'UPSERT',
        resource: 'leave_balance',
        resourceId: balance.id,
      },
    });

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error managing leave balance:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
