import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const updateLeaveSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  comments: z.string().optional(),
});

// Helper function to check permissions
function canManageLeave(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// PATCH /api/leave/requests/[id] - Update leave request (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: params.id },
      include: {
        employee: true,
      },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateLeaveSchema.parse(body);

    // Only the employee can cancel, managers can approve/reject
    if (validatedData.status === 'CANCELLED') {
      if (leaveRequest.employee.userId !== session.user.id) {
        return NextResponse.json({ error: 'Only the employee can cancel this request' }, { status: 403 });
      }
    } else if (validatedData.status && ['APPROVED', 'REJECTED'].includes(validatedData.status)) {
      if (!canManageLeave(session.user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    const updateData: any = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;
      
      if (validatedData.status === 'APPROVED') {
        updateData.approvedById = session.user.id;
        updateData.approvedAt = new Date();
        
        // Update leave balance
        const currentYear = new Date().getFullYear();
        await prisma.leaveBalance.upsert({
          where: {
            employeeId_leaveType_year: {
              employeeId: leaveRequest.employeeId,
              leaveType: leaveRequest.type,
              year: currentYear,
            },
          },
          update: {
            used: { increment: leaveRequest.days },
            remaining: { decrement: leaveRequest.days },
          },
          create: {
            employeeId: leaveRequest.employeeId,
            leaveType: leaveRequest.type,
            year: currentYear,
            allocated: 0,
            used: leaveRequest.days,
            remaining: -leaveRequest.days,
          },
        });
      }
    }

    if (validatedData.comments) {
      updateData.comments = validatedData.comments;
    }

    const updatedLeaveRequest = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: updateData,
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
        resource: 'leave_request',
        resourceId: updatedLeaveRequest.id,
        details: {
          status: validatedData.status,
        },
      },
    });

    // Create absence alert if approved and more than 2 days
    if (validatedData.status === 'APPROVED' && leaveRequest.days > 2) {
      await prisma.absenceAlert.create({
        data: {
          employeeId: leaveRequest.employeeId,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          type: 'EXTENDED_LEAVE',
          reason: leaveRequest.reason,
        },
      });
    }

    return NextResponse.json(updatedLeaveRequest);
  } catch (error) {
    console.error('Error updating leave request:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/leave/requests/[id] - Delete leave request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: params.id },
      include: { employee: true },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    // Only the owner or managers can delete
    if (leaveRequest.employee.userId !== session.user.id && !canManageLeave(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await prisma.leaveRequest.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'leave_request',
        resourceId: params.id,
      },
    });

    return NextResponse.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
