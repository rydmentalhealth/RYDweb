import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Helper function to check permissions
function canViewAvailability(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// GET /api/leave/availability - Get team availability overview
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canViewAvailability(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Build where clause for users
    const userWhere: any = {
      status: 'ACTIVE',
    };

    if (department) {
      userWhere.department = department;
    }

    // Fetch all active users
    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        department: true,
        jobTitle: true,
        employeeProfile: {
          select: {
            id: true,
            leaveRequests: {
              where: {
                status: 'APPROVED',
                OR: [
                  {
                    AND: [
                      { startDate: { lte: end } },
                      { endDate: { gte: start } },
                    ],
                  },
                ],
              },
              orderBy: { startDate: 'asc' },
            },
          },
        },
      },
    });

    // Build availability calendar
    const availability = users.map(user => {
      const leaveRequests = user.employeeProfile?.leaveRequests || [];
      
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          department: user.department,
          jobTitle: user.jobTitle,
        },
        leaveRequests: leaveRequests.map(lr => ({
          id: lr.id,
          type: lr.type,
          startDate: lr.startDate,
          endDate: lr.endDate,
          days: lr.days,
          reason: lr.reason,
        })),
        status: leaveRequests.length > 0 ? 'ON_LEAVE' : 'AVAILABLE',
      };
    });

    // Calculate statistics
    const stats = {
      total: users.length,
      available: availability.filter(a => a.status === 'AVAILABLE').length,
      onLeave: availability.filter(a => a.status === 'ON_LEAVE').length,
    };

    return NextResponse.json({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      stats,
      availability,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
