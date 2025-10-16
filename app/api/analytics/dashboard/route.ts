import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

// Enhanced dashboard analytics with real-time data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const department = searchParams.get('department')
    
    // Calculate date range
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Check permissions
    const canViewAnalytics = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.DIRECTOR].includes(session.user.role)
    if (!canViewAnalytics) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parallel data fetching for performance
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      completedTasks,
      totalTasks,
      recentCheckIns,
      departmentStats,
      userGrowthData,
      taskCompletionData,
      attendanceData,
      performanceData
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: {
          status: { not: 'REJECTED' },
          ...(department && { department })
        }
      }),
      
      // Active users (logged in within last 7 days)
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          sessions: {
            some: {
              expires: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
          },
          ...(department && { department })
        }
      }),
      
      // Total projects
      prisma.project.count({
        where: {
          ...(department && { department })
        }
      }),
      
      // Active projects
      prisma.project.count({
        where: {
          status: 'ACTIVE',
          ...(department && { department })
        }
      }),
      
      // Completed tasks in time range
      prisma.task.count({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: startDate },
          ...(department && { project: { department } })
        }
      }),
      
      // Total tasks in time range
      prisma.task.count({
        where: {
          createdAt: { gte: startDate },
          ...(department && { project: { department } })
        }
      }),
      
      // Recent check-ins
      prisma.checkIn.count({
        where: {
          checkInTime: { gte: startDate },
          ...(department && { user: { department } })
        }
      }),
      
      // Department statistics
      prisma.user.groupBy({
        by: ['department'],
        where: {
          department: { not: null },
          status: 'ACTIVE'
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),
      
      // User growth data (last 6 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as total_users,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_users
        FROM "User"
        WHERE "createdAt" >= ${new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `,
      
      // Task completion trends
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', "completedAt") as week,
          COUNT(*) as completed_tasks
        FROM "Task"
        WHERE "completedAt" >= ${startDate} AND "completedAt" IS NOT NULL
        GROUP BY DATE_TRUNC('week', "completedAt")
        ORDER BY week
      `,
      
      // Attendance data
      prisma.checkIn.groupBy({
        by: ['userId'],
        where: {
          checkInTime: { gte: startDate },
          ...(department && { user: { department } })
        },
        _count: {
          id: true
        },
        _avg: {
          workingHours: true
        }
      }),
      
      // Performance data (KPIs)
      prisma.kPI.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: {
          id: true
        }
      })
    ])

    // Calculate metrics
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const averageAttendance = attendanceData.length > 0 
      ? attendanceData.reduce((sum, item) => sum + (item._avg.workingHours || 0), 0) / attendanceData.length 
      : 0

    // Format user growth data
    const formattedUserGrowth = (userGrowthData as any[]).map(item => ({
      month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
      totalUsers: Number(item.total_users),
      activeUsers: Number(item.active_users)
    }))

    // Format task completion trends
    const formattedTaskTrends = (taskCompletionData as any[]).map(item => ({
      week: `Week ${Math.ceil((new Date(item.week).getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))}`,
      completed: Number(item.completed_tasks)
    }))

    // Department performance
    const departmentPerformance = departmentStats.map(dept => ({
      name: dept.department || 'Unassigned',
      userCount: dept._count.id,
      // Add more metrics as needed
    }))

    const dashboardData = {
      overview: {
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        completedTasks,
        totalTasks,
        taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
        recentCheckIns,
        averageAttendance: Math.round(averageAttendance * 100) / 100
      },
      trends: {
        userGrowth: formattedUserGrowth,
        taskCompletion: formattedTaskTrends,
        departmentPerformance
      },
      timeRange,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    )
  }
}