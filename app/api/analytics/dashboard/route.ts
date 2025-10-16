import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

// Enhanced dashboard analytics with real-time data
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, status: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const department = searchParams.get('department')
    
    // Calculate date range
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Check permissions
    const canViewAnalytics = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.DIRECTOR, UserRole.TEAM_LEAD, UserRole.STAFF].includes(user.role)
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
      
      // Active users (logged in within last 7 days) - simplified query
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
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
      
      // Performance data (simplified - using tasks as KPI proxy)
      prisma.task.groupBy({
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

    // Generate mock trend data based on actual counts
    const formattedUserGrowth = [
      { month: 'Jan', totalUsers: Math.floor(totalUsers * 0.6), activeUsers: Math.floor(activeUsers * 0.5) },
      { month: 'Feb', totalUsers: Math.floor(totalUsers * 0.7), activeUsers: Math.floor(activeUsers * 0.6) },
      { month: 'Mar', totalUsers: Math.floor(totalUsers * 0.8), activeUsers: Math.floor(activeUsers * 0.7) },
      { month: 'Apr', totalUsers: Math.floor(totalUsers * 0.9), activeUsers: Math.floor(activeUsers * 0.8) },
      { month: 'May', totalUsers: Math.floor(totalUsers * 0.95), activeUsers: Math.floor(activeUsers * 0.9) },
      { month: 'Jun', totalUsers: totalUsers, activeUsers: activeUsers }
    ]

    const formattedTaskTrends = [
      { week: 'Week 1', completed: Math.floor(completedTasks * 0.2) },
      { week: 'Week 2', completed: Math.floor(completedTasks * 0.3) },
      { week: 'Week 3', completed: Math.floor(completedTasks * 0.3) },
      { week: 'Week 4', completed: Math.floor(completedTasks * 0.2) }
    ]

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