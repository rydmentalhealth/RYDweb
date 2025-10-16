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
});

// Helper function to check permissions
function canManageLogs(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// GET /api/attendance/daily-logs/[id] - Get a specific daily task log
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const log = await prisma.dailyTaskLog.findUnique({
      where: { id },
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

    // Check permissions - user can view their own logs, managers can view team logs
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const canView = log.userId === session.user.id || canManageLogs(user.role);
    
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error fetching daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/attendance/daily-logs/[id] - Update daily task log
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const validatedData = dailyLogSchema.parse(body);

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

// DELETE /api/attendance/daily-logs/[id] - Delete daily task log
export async function DELETE(
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
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    // Check if user owns the log
    if (existingLog.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own logs' }, { status: 403 });
    }

    // Check if log has been approved (submitted to HR)
    if (existingLog.isApproved) {
      return NextResponse.json({ 
        error: 'This log has been approved by HR and cannot be deleted' 
      }, { status: 403 });
    }

    await prisma.dailyTaskLog.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'daily_task_log',
        resourceId: id,
      },
    });

    return NextResponse.json({ message: 'Daily log deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/attendance/daily-logs/[id]/approve - Approve daily task log (HR/Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { action } = body;

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject"' }, { status: 400 });
    }

    // Check if user has permission to approve logs
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !canManageLogs(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to approve logs' }, { status: 403 });
    }

    // Find the existing log
    const existingLog = await prisma.dailyTaskLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }

    const updatedLog = await prisma.dailyTaskLog.update({
      where: { id },
      data: {
        isApproved: action === 'approve',
        approvedById: session.user.id,
        approvedAt: new Date(),
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

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: action.toUpperCase(),
        resource: 'daily_task_log',
        resourceId: updatedLog.id,
      },
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Error approving daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}