import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const updateKPISchema = z.object({
  current: z.number().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

// Helper function to check permissions
function canManageKPIs(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// PATCH /api/performance/kpis/[id] - Update KPI progress
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kpi = await prisma.kPI.findUnique({
      where: { id: params.id },
      include: {
        employee: true,
      },
    });

    if (!kpi) {
      return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
    }

    // Check permissions: employee can update their own KPIs, managers can update any
    const employeeProfile = await prisma.employeeProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!canManageKPIs(session.user.role) && kpi.employeeId !== employeeProfile?.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateKPISchema.parse(body);

    const updateData: any = {};

    if (validatedData.current !== undefined) {
      updateData.current = validatedData.current;
      // Recalculate progress
      const progress = kpi.target > 0 ? Math.min((validatedData.current / kpi.target) * 100, 100) : 0;
      updateData.progress = progress;

      // Auto-update status based on progress
      if (progress >= 100) {
        updateData.status = 'COMPLETED';
      } else if (progress > 0) {
        updateData.status = 'IN_PROGRESS';
      }
    }

    if (validatedData.status) {
      updateData.status = validatedData.status;
    }

    if (validatedData.notes) {
      updateData.notes = validatedData.notes;
    }

    // Check if KPI is overdue
    if (new Date() > kpi.endDate && kpi.status !== 'COMPLETED') {
      updateData.status = 'OVERDUE';
    }

    const updatedKPI = await prisma.kPI.update({
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
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
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
        resource: 'kpi',
        resourceId: updatedKPI.id,
        details: {
          progress: updatedKPI.progress,
          status: updatedKPI.status,
        },
      },
    });

    return NextResponse.json(updatedKPI);
  } catch (error) {
    console.error('Error updating KPI:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/performance/kpis/[id] - Delete KPI
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageKPIs(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const kpi = await prisma.kPI.findUnique({
      where: { id: params.id },
    });

    if (!kpi) {
      return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
    }

    await prisma.kPI.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'kpi',
        resourceId: params.id,
      },
    });

    return NextResponse.json({ message: 'KPI deleted successfully' });
  } catch (error) {
    console.error('Error deleting KPI:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
