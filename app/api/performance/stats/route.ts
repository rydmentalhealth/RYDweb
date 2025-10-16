import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Helper function to check permissions
function canViewStats(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// GET /api/performance/stats - Get performance statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const department = searchParams.get('department');

    // Check permissions
    if (!canViewStats(session.user.role) && !employeeId) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // If specific employee requested
    if (employeeId) {
      const employeeProfile = await prisma.employeeProfile.findUnique({
        where: { id: employeeId },
        select: { userId: true },
      });

      // Users can view their own stats
      if (!canViewStats(session.user.role) && employeeProfile?.userId !== session.user.id) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      // Get employee's KPIs
      const kpis = await prisma.kPI.findMany({
        where: { employeeId },
      });

      const kpiStats = {
        total: kpis.length,
        completed: kpis.filter(k => k.status === 'COMPLETED').length,
        inProgress: kpis.filter(k => k.status === 'IN_PROGRESS').length,
        overdue: kpis.filter(k => k.status === 'OVERDUE').length,
        averageProgress: kpis.length > 0 
          ? kpis.reduce((sum, k) => sum + k.progress, 0) / kpis.length 
          : 0,
      };

      // Get employee's 360 reviews
      const reviews360 = await prisma.review360.findMany({
        where: { 
          employeeId,
          isCompleted: true,
        },
      });

      const reviewStats = {
        total: reviews360.length,
        averageRating: reviews360.length > 0 && reviews360.some(r => r.overallRating)
          ? reviews360
              .filter(r => r.overallRating !== null)
              .reduce((sum, r) => sum + (r.overallRating || 0), 0) / 
            reviews360.filter(r => r.overallRating !== null).length
          : 0,
        byType: {
          self: reviews360.filter(r => r.reviewType === 'SELF').length,
          peer: reviews360.filter(r => r.reviewType === 'PEER').length,
          supervisor: reviews360.filter(r => r.reviewType === 'SUPERVISOR').length,
          subordinate: reviews360.filter(r => r.reviewType === 'SUBORDINATE').length,
        },
      };

      // Get employee's rewards
      const rewards = await prisma.userReward.findMany({
        where: { 
          user: {
            employeeProfile: {
              id: employeeId,
            },
          },
        },
        include: {
          badge: true,
        },
      });

      const rewardStats = {
        total: rewards.length,
        totalPoints: rewards.reduce((sum, r) => sum + r.badge.points, 0),
        byCategory: rewards.reduce((acc, r) => {
          acc[r.badge.category] = (acc[r.badge.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return NextResponse.json({
        kpis: kpiStats,
        reviews: reviewStats,
        rewards: rewardStats,
      });
    }

    // Department or overall stats
    const where: any = {};
    if (department) {
      where.department = department;
    }

    const employees = await prisma.employeeProfile.findMany({
      where,
      select: { id: true },
    });

    const employeeIds = employees.map(e => e.id);

    // Get all KPIs for these employees
    const kpis = await prisma.kPI.findMany({
      where: { employeeId: { in: employeeIds } },
    });

    const kpiStats = {
      total: kpis.length,
      completed: kpis.filter(k => k.status === 'COMPLETED').length,
      inProgress: kpis.filter(k => k.status === 'IN_PROGRESS').length,
      overdue: kpis.filter(k => k.status === 'OVERDUE').length,
      averageProgress: kpis.length > 0 
        ? kpis.reduce((sum, k) => sum + k.progress, 0) / kpis.length 
        : 0,
      byCategory: kpis.reduce((acc, k) => {
        acc[k.category] = (acc[k.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Get all reviews
    const reviews360 = await prisma.review360.findMany({
      where: { 
        employeeId: { in: employeeIds },
        isCompleted: true,
      },
    });

    const reviewStats = {
      total: reviews360.length,
      averageRating: reviews360.length > 0 && reviews360.some(r => r.overallRating)
        ? reviews360
            .filter(r => r.overallRating !== null)
            .reduce((sum, r) => sum + (r.overallRating || 0), 0) / 
          reviews360.filter(r => r.overallRating !== null).length
        : 0,
      byType: {
        self: reviews360.filter(r => r.reviewType === 'SELF').length,
        peer: reviews360.filter(r => r.reviewType === 'PEER').length,
        supervisor: reviews360.filter(r => r.reviewType === 'SUPERVISOR').length,
        subordinate: reviews360.filter(r => r.reviewType === 'SUBORDINATE').length,
      },
    };

    // Get all rewards
    const rewards = await prisma.userReward.findMany({
      where: { 
        user: {
          employeeProfile: {
            id: { in: employeeIds },
          },
        },
      },
      include: {
        badge: true,
      },
    });

    const rewardStats = {
      total: rewards.length,
      totalPoints: rewards.reduce((sum, r) => sum + r.badge.points, 0),
      byCategory: rewards.reduce((acc, r) => {
        acc[r.badge.category] = (acc[r.badge.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      employees: employees.length,
      kpis: kpiStats,
      reviews: reviewStats,
      rewards: rewardStats,
    });
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
