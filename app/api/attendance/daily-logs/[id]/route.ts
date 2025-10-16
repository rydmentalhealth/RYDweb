import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const updateLogSchema = z.object({
  description: z.string().min(1).optional(),
  hoursSpent: z.number().optional(),
  category: z.string().optional(),
  attachments: z.string().optional(),
  isApproved: z.boolean().optional(),
});

// Helper function to check permissions
function canManageLogs(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// PATCH /api/attendance/daily-logs/[id] - Update daily log
export async function PATCH(
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
    });

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateLogSchema.parse(body);

    // Only the owner can edit content, managers can approve
    if (log.userId !== session.user.id && !canManageLogs(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updateData: any = {};

    // Owner can update content
    if (log.userId === session.user.id) {
      if (validatedData.description) updateData.description = validatedData.description;
      if (validatedData.hoursSpent !== undefined) updateData.hoursSpent = validatedData.hoursSpent;
      if (validatedData.category) updateData.category = validatedData.category;
      if (validatedData.attachments) updateData.attachments = validatedData.attachments;
    }

    // Managers can approve
    if (canManageLogs(session.user.role) && validatedData.isApproved !== undefined) {
      updateData.isApproved = validatedData.isApproved;
      updateData.approvedById = session.user.id;
      updateData.approvedAt = new Date();
    }

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

    const log = await prisma.dailyTaskLog.findUnique({
      where: { id: params.id },
    });

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    // Only the owner or managers can delete
    if (log.userId !== session.user.id && !canManageLogs(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
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

    return NextResponse.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
