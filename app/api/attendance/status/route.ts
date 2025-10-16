import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Helper function to check permissions
function canViewAllStatus(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// GET /api/attendance/status - Get real-time attendance status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!canViewAllStatus(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

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
      },
    });

    // Fetch check-ins for the date
    const checkIns = await prisma.checkIn.findMany({
      where: {
        checkInTime: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            department: true,
            jobTitle: true,
          },
        },
      },
    });

    // Check for leave requests
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        startDate: {
          lte: targetDate,
        },
        endDate: {
          gte: targetDate,
        },
      },
      include: {
        employee: {
          select: {
            userId: true,
          },
        },
      },
    });

    const usersOnLeave = new Set(leaveRequests.map(lr => lr.employee.userId));
    const checkedInUserIds = new Set(checkIns.map(ci => ci.userId));

    // Build status for each user
    const statusList = users.map(user => {
      const checkIn = checkIns.find(ci => ci.userId === user.id);
      let status: 'ACTIVE' | 'ON_LEAVE' | 'OFFLINE' | 'LATE';
      
      if (usersOnLeave.has(user.id)) {
        status = 'ON_LEAVE';
      } else if (checkIn) {
        const checkInHour = checkIn.checkInTime.getHours();
        status = checkInHour >= 10 ? 'LATE' : 'ACTIVE';
      } else {
        status = 'OFFLINE';
      }

      return {
        ...user,
        status,
        checkIn: checkIn ? {
          id: checkIn.id,
          checkInTime: checkIn.checkInTime,
          checkOutTime: checkIn.checkOutTime,
          workingHours: checkIn.workingHours,
          location: checkIn.location,
        } : null,
      };
    });

    // Calculate statistics
    const stats = {
      total: users.length,
      active: statusList.filter(s => s.status === 'ACTIVE').length,
      onLeave: statusList.filter(s => s.status === 'ON_LEAVE').length,
      offline: statusList.filter(s => s.status === 'OFFLINE').length,
      late: statusList.filter(s => s.status === 'LATE').length,
      attendanceRate: users.length > 0 
        ? Math.round((checkedInUserIds.size / users.length) * 100) 
        : 0,
    };

    return NextResponse.json({
      date: targetDate.toISOString(),
      stats,
      users: statusList,
    });
  } catch (error) {
    console.error('Error fetching attendance status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
