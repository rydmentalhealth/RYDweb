import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/attendance/daily-logs/[id]/submit - Submit daily log to HR
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Find the existing log
    const existingLog = await prisma.dailyTaskLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
          },
        },
      },
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    // Check if user owns the log
    if (existingLog.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only submit your own logs' }, { status: 403 });
    }

    // Check if log has already been submitted/approved
    if (existingLog.isApproved) {
      return NextResponse.json({ 
        error: 'This log has already been submitted to HR' 
      }, { status: 400 });
    }

    // Mark as submitted (we'll use a new field or repurpose existing logic)
    // For now, we'll create a notification to HR and mark it as pending approval
    const updatedLog = await prisma.dailyTaskLog.update({
      where: { id },
      data: {
        // We'll add a submittedAt field to track when it was submitted
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            department: true,
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

    // Find HR officers and team leads who should be notified
    const hrUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'HR_OFFICER' },
          { role: 'TEAM_LEAD' },
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' },
        ],
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    // Create notifications for HR
    if (hrUsers.length > 0) {
      const notifications = hrUsers.map(hrUser => ({
        userId: hrUser.id,
        type: 'SYSTEM' as const,
        title: 'Daily Update Submitted for Review',
        content: `${existingLog.user.name || existingLog.user.firstName + ' ' + existingLog.user.lastName} has submitted their daily update for ${new Date(existingLog.date).toLocaleDateString()}.`,
        actionUrl: `/dashboard/hr?tab=daily-logs&logId=${id}`,
        data: JSON.stringify({
          logId: id,
          userId: existingLog.userId,
          date: existingLog.date,
          type: 'DAILY_LOG_SUBMISSION',
        }),
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'SUBMIT',
        resource: 'daily_task_log',
        resourceId: updatedLog.id,
        details: {
          action: 'submitted_to_hr',
          date: existingLog.date,
        },
      },
    });

    return NextResponse.json({
      ...updatedLog,
      submittedToHR: true, // Add this flag for frontend
    });
  } catch (error) {
    console.error('Error submitting daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}