import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole, KPICategory } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const kpiSchema = z.object({
  employeeId: z.string().optional(),
  teamId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  target: z.number(),
  current: z.number().optional().default(0),
  unit: z.string().optional(),
  category: z.enum(['TASK_COMPLETION', 'PROJECT_DELIVERY', 'ENGAGEMENT', 'QUALITY', 'INNOVATION', 'TEAMWORK', 'CUSTOM']),
  startDate: z.string(),
  endDate: z.string(),
});

// Helper function to check permissions
function canManageKPIs(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// GET /api/performance/kpis - Get KPIs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const teamId = searchParams.get('teamId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (employeeId) {
      if (!canManageKPIs(session.user.role)) {
        // Get user's employee profile
        const employeeProfile = await prisma.employeeProfile.findUnique({
          where: { userId: session.user.id },
          select: { id: true },
        });

        if (employeeProfile && employeeProfile.id === employeeId) {
          where.employeeId = employeeId;
        } else {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }
      } else {
        where.employeeId = employeeId;
      }
    } else if (!canManageKPIs(session.user.role)) {
      // Regular users can only see their own KPIs
      const employeeProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (employeeProfile) {
        where.employeeId = employeeProfile.id;
      }
    }

    if (teamId) {
      where.teamId = teamId;
    }

    if (status) {
      where.status = status;
    }

    const [kpis, total] = await Promise.all([
      prisma.kPI.findMany({
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
          team: {
            select: {
              id: true,
              name: true,
              color: true,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.kPI.count({ where }),
    ]);

    return NextResponse.json({
      kpis,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/performance/kpis - Create KPI
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageKPIs(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = kpiSchema.parse(body);

    if (!validatedData.employeeId && !validatedData.teamId) {
      return NextResponse.json({ error: 'Either employeeId or teamId must be provided' }, { status: 400 });
    }

    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (startDate > endDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    const progress = validatedData.current > 0 && validatedData.target > 0
      ? Math.min((validatedData.current / validatedData.target) * 100, 100)
      : 0;

    const kpi = await prisma.kPI.create({
      data: {
        employeeId: validatedData.employeeId,
        teamId: validatedData.teamId,
        title: validatedData.title,
        description: validatedData.description,
        target: validatedData.target,
        current: validatedData.current,
        unit: validatedData.unit,
        category: validatedData.category,
        startDate,
        endDate,
        progress,
        createdById: session.user.id,
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
        action: 'CREATE',
        resource: 'kpi',
        resourceId: kpi.id,
      },
    });

    return NextResponse.json(kpi, { status: 201 });
  } catch (error) {
    console.error('Error creating KPI:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
