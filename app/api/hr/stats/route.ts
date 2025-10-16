import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Helper function to check HR permissions
function hasHRPermission(userRole: UserRole) {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR'].includes(userRole);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasHRPermission(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get HR-specific statistics
    const [
      // Employee directory stats (from EmployeeProfile)
      totalEmployees,
      activeEmployees,
      newHiresThisMonth,
      
      // System users stats
      totalSystemUsers,
      activeSystemUsers,
      pendingSystemUsers,
      
      // Pending approvals (active system users without employee profiles)
      pendingApprovals,
      
      // Additional HR stats
      upcomingReviews,
      openPositions,
      trainingCompleted,
      performanceReviews,
      
      // Leave requests
      pendingLeaveRequests,
      approvedLeaveRequests,
      
    ] = await Promise.all([
      // Employee directory stats
      prisma.employeeProfile.count(),
      prisma.employeeProfile.count({ where: { status: 'ACTIVE' } }),
      prisma.employeeProfile.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),
      
      // System users stats
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      
      // Pending approvals - active users without employee profiles
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          employeeProfile: null
        }
      }),
      
      // Additional HR stats (mock for now - can be implemented later)
      Promise.resolve(12), // upcomingReviews
      Promise.resolve(5),  // openPositions
      Promise.resolve(28), // trainingCompleted
      prisma.performanceReview.count(),
      
      // Leave requests
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.leaveRequest.count({ where: { status: 'APPROVED' } }),
    ]);

    // Calculate department breakdown
    const departmentBreakdown = await prisma.employeeProfile.groupBy({
      by: ['department'],
      _count: {
        id: true
      },
      where: {
        department: { not: null }
      }
    });

    // Calculate employment type breakdown
    const employmentTypeBreakdown = await prisma.employeeProfile.groupBy({
      by: ['employmentType'],
      _count: {
        id: true
      }
    });

    // Get recent activities (employees created this week)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    const recentEmployeeAdditions = await prisma.employeeProfile.count({
      where: {
        createdAt: { gte: startOfWeek }
      }
    });

    const stats = {
      // Core employee stats
      totalEmployees,
      activeEmployees,
      newHires: newHiresThisMonth,
      pendingApprovals, // This is the key fix - active users not yet employees
      
      // System user stats
      totalSystemUsers,
      activeSystemUsers,
      pendingSystemUsers,
      
      // HR workflow stats
      upcomingReviews,
      openPositions,
      trainingCompleted,
      performanceReviews,
      
      // Leave management
      pendingLeaveRequests,
      approvedLeaveRequests,
      
      // Breakdowns
      departmentBreakdown: departmentBreakdown.map(dept => ({
        department: dept.department || 'Unassigned',
        count: dept._count.id
      })),
      
      employmentTypeBreakdown: employmentTypeBreakdown.map(type => ({
        type: type.employmentType,
        count: type._count.id
      })),
      
      // Recent activity
      recentActivity: {
        newEmployees: recentEmployeeAdditions,
        newSystemUsers: await prisma.user.count({
          where: { createdAt: { gte: startOfWeek } }
        })
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching HR stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}