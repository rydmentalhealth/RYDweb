import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schema for updates
const updateLogSchema = z.object({
  date: z.string().optional(),
  description: z.string().min(1).optional(),
  hoursSpent: z.number().optional(),
  category: z.string().optional(),
  attachments: z.string().optional(),
  submitToHR: z.boolean().optional(),
});

// Validation schema for approval
const approveLogSchema = z.object({
  isApproved: z.boolean(),
  comments: z.string().optional(),
});

// Helper function to check permissions
function canManageLogs(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// GET /api/attendance/daily-logs/[id] - Get specific daily log
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const log = await prisma.dailyTaskLog.findUnique({
      where: { id: params.id },
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

    if (!log) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    // Check permissions - users can view their own logs, managers can view team logs
    if (log.userId !== session.user.id && !canManageLogs(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error fetching daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/attendance/daily-logs/[id] - Update daily log
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if this is an approval request
    if ('isApproved' in body) {
      return handleApproval(params.id, body, session);
    }

    // Handle regular update
    const validatedData = updateLogSchema.parse(body);

    // Find the existing log
    const existingLog = await prisma.dailyTaskLog.findUnique({
      where: { id: params.id },
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

    const updateData: any = {};
    if (validatedData.date) updateData.date = new Date(validatedData.date);
    if (validatedData.description) updateData.description = validatedData.description;
    if (validatedData.hoursSpent !== undefined) updateData.hoursSpent = validatedData.hoursSpent;
    if (validatedData.category) updateData.category = validatedData.category;
    if (validatedData.attachments) updateData.attachments = validatedData.attachments;

    const updatedLog = await prisma.dailyTaskLog.update({
      where: { id: params.id },
      data: updateData,
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

// Handle approval/rejection by HR
async function handleApproval(logId: string, body: any, session: any) {
  const validatedData = approveLogSchema.parse(body);

  // Check if user has permission to approve logs
  if (!canManageLogs(session.user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions to approve logs' }, { status: 403 });
  }

  const existingLog = await prisma.dailyTaskLog.findUnique({
    where: { id: logId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!existingLog) {
    return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
  }

  const updatedLog = await prisma.dailyTaskLog.update({
    where: { id: logId },
    data: {
      isApproved: validatedData.isApproved,
      approvedById: validatedData.isApproved ? session.user.id : null,
      approvedAt: validatedData.isApproved ? new Date() : null,
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

  // Notify the user about the approval/rejection
  await prisma.notification.create({
    data: {
      userId: existingLog.userId,
      type: 'SYSTEM',
      title: validatedData.isApproved ? 'Daily Update Approved' : 'Daily Update Needs Revision',
      content: validatedData.isApproved 
        ? 'Your daily update has been approved by HR.'
        : `Your daily update needs revision. ${validatedData.comments || ''}`,
      actionUrl: '/dashboard?tab=daily-update',
      data: JSON.stringify({
        logId: updatedLog.id,
        type: validatedData.isApproved ? 'DAILY_LOG_APPROVED' : 'DAILY_LOG_REJECTED',
        comments: validatedData.comments,
      }),
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: validatedData.isApproved ? 'APPROVE' : 'REJECT',
      resource: 'daily_task_log',
      resourceId: updatedLog.id,
      details: validatedData.comments ? { comments: validatedData.comments } : undefined,
    },
  });

  return NextResponse.json(updatedLog);
}

// DELETE /api/attendance/daily-logs/[id] - Delete daily log
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingLog = await prisma.dailyTaskLog.findUnique({
      where: { id: params.id },
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    // Check if user owns the log or has management permissions
    if (existingLog.userId !== session.user.id && !canManageLogs(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if log has been approved (can't delete approved logs)
    if (existingLog.isApproved) {
      return NextResponse.json({ 
        error: 'This log has been approved and cannot be deleted' 
      }, { status: 403 });
    }

    await prisma.dailyTaskLog.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'daily_task_log',
        resourceId: params.id,
      },
    });

    return NextResponse.json({ message: 'Daily log deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}