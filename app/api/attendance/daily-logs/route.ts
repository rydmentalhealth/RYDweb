import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const dailyLogSchema = z.object({
  date: z.string(),
  description: z.string().min(1),
  hoursSpent: z.number().optional(),
  category: z.string().optional(),
  attachments: z.string().optional(), // JSON string of URLs
  submitToHR: z.boolean().optional(), // Flag to submit to HR
});

// Helper function to check permissions
function canManageLogs(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// GET /api/attendance/daily-logs - Get daily task logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Users can view their own logs, managers can view team logs
    if (userId && canManageLogs(session.user.role)) {
      where.userId = userId;
    } else {
      where.userId = session.user.id;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.dailyTaskLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dailyTaskLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/attendance/daily-logs - Create daily task log
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = dailyLogSchema.parse(body);

    // Check if a log already exists for this date
    const existingLog = await prisma.dailyTaskLog.findFirst({
      where: {
        userId: session.user.id,
        date: new Date(validatedData.date),
      },
    });

    if (existingLog) {
      return NextResponse.json({ error: 'Daily log already exists for this date. Use PUT to update.' }, { status: 400 });
    }

    const log = await prisma.dailyTaskLog.create({
      data: {
        userId: session.user.id,
        date: new Date(validatedData.date),
        description: validatedData.description,
        hoursSpent: validatedData.hoursSpent,
        category: validatedData.category,
        attachments: validatedData.attachments,
        // If submitToHR is true, we mark it as needing approval but not yet approved
        // This allows HR to see it as submitted but still pending their approval
      },
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
    });

    // If submitting to HR, create a notification for HR officers
    if (validatedData.submitToHR) {
      // Find HR officers to notify
      const hrOfficers = await prisma.user.findMany({
        where: {
          role: { in: ['HR_OFFICER', 'ADMIN', 'SUPER_ADMIN'] },
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      if (hrOfficers.length > 0) {
        const notifications = hrOfficers.map(hr => ({
          userId: hr.id,
          type: 'SYSTEM' as const,
          title: 'New Daily Update for Review',
          content: `${session.user.name || session.user.email} has submitted a daily update for review.`,
          actionUrl: `/dashboard/hr?tab=daily-logs&userId=${session.user.id}`,
          data: JSON.stringify({
            logId: log.id,
            userId: session.user.id,
            type: 'DAILY_LOG_SUBMITTED',
          }),
        }));

        await prisma.notification.createMany({
          data: notifications,
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'daily_task_log',
        resourceId: log.id,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating daily log:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/attendance/daily-logs - Update daily task log
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    const validatedData = dailyLogSchema.parse(updateData);

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required for updates' }, { status: 400 });
    }

    // Find the existing log
    const existingLog = await prisma.dailyTaskLog.findUnique({
      where: { id },
      include: {
        approvedBy: true,
      },
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    // Check if user owns the log
    if (existingLog.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only edit your own logs' }, { status: 403 });
    }

    // Check if log has been approved (submitted to HR)
    if (existingLog.isApproved) {
      return NextResponse.json({ 
        error: 'This log has been approved by HR and cannot be edited' 
      }, { status: 403 });
    }

    const updatedLog = await prisma.dailyTaskLog.update({
      where: { id },
      data: {
        date: new Date(validatedData.date),
        description: validatedData.description,
        hoursSpent: validatedData.hoursSpent,
        category: validatedData.category,
        attachments: validatedData.attachments,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If submitting to HR, create a notification for HR officers
    if (validatedData.submitToHR && !existingLog.isApproved) {
      // Find HR officers to notify
      const hrOfficers = await prisma.user.findMany({
        where: {
          role: { in: ['HR_OFFICER', 'ADMIN', 'SUPER_ADMIN'] },
          status: 'ACTIVE',
        },
        select: { id: true },
      });

      if (hrOfficers.length > 0) {
        const notifications = hrOfficers.map(hr => ({
          userId: hr.id,
          type: 'SYSTEM' as const,
          title: 'Updated Daily Update for Review',
          content: `${session.user.name || session.user.email} has updated their daily update for review.`,
          actionUrl: `/dashboard/hr?tab=daily-logs&userId=${session.user.id}`,
          data: JSON.stringify({
            logId: updatedLog.id,
            userId: session.user.id,
            type: 'DAILY_LOG_UPDATED',
          }),
        }));

        await prisma.notification.createMany({
          data: notifications,
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'daily_task_log',
        resourceId: updatedLog.id,
      },
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Error updating daily log:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
