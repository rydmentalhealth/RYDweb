import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@/lib/generated/prisma'
import { startOfMonth, startOfWeek } from 'date-fns'
import { isAdmin } from '@/lib/auth/rbac'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = new PrismaClient()

    try {
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { email: session.user.email || "" },
        select: {
          id: true,
          role: true,
          status: true,
        }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const now = new Date()
      const startOfThisWeek = startOfWeek(now)
      const startOfThisMonth = startOfMonth(now)

      // Check if user is admin to determine stats scope
      const isUserAdmin = isAdmin(user.role)

      let stats

      if (isUserAdmin) {
        // System-wide stats for admins
        const [
          totalTasks,
          completedTasks,
          overdueTasks,
          tasksInProgress,
          
          // Team statistics  
          totalTeamMembers,
          activeTeamMembers,
          pendingApprovals,
          
          // Project statistics
          totalProjects,
          activeProjects,
          completedProjects,
          
          // Recent activity
          recentTasksCompleted,
          recentRegistrations,
        ] = await Promise.all([
          // Tasks
          prisma.task.count(),
          prisma.task.count({ where: { status: 'COMPLETED' } }),
          prisma.task.count({ 
            where: { 
              status: { not: 'COMPLETED' },
              OR: [
                { endDate: { lt: now } },
                { startDate: { lt: now } }
              ]
            } 
          }),
          prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
          
          // Team members
          prisma.user.count(),
          prisma.user.count({ where: { status: 'ACTIVE' } }),
          prisma.user.count({ where: { status: 'PENDING' } }),
          
          // Projects
          prisma.project.count(),
          prisma.project.count({ where: { status: 'ACTIVE' } }),
          prisma.project.count({ where: { status: 'COMPLETED' } }),
          
          // Recent activity (this week)
          prisma.task.count({ 
            where: { 
              status: 'COMPLETED',
              completedAt: { gte: startOfThisWeek }
            } 
          }),
          prisma.user.count({ 
            where: { 
              createdAt: { gte: startOfThisWeek }
            } 
          }),
        ])

        stats = {
          totalTasks,
          completedTasks,
          overdueTasks,
          tasksInProgress,
          
          totalTeamMembers,
          activeTeamMembers,
          pendingApprovals,
          
          totalProjects,
          activeProjects,
          completedProjects,
          
          recentActivity: {
            tasksCompleted: recentTasksCompleted,
            newRegistrations: recentRegistrations,
            totalHours: Math.floor(Math.random() * 160) + 40, // Placeholder
          }
        }
      } else {
        // User-specific stats for non-admin users
        
        // Get user's team memberships
        const userTeams = await prisma.userTeam.findMany({
          where: { userId: user.id },
          select: { teamId: true }
        })
        const userTeamIds = userTeams.map(ut => ut.teamId)

        const [
          // Tasks assigned to user individually
          myAssignedTasks,
          myCompletedTasks,
          myOverdueTasks,
          myTasksInProgress,
          
          // Tasks assigned to user's teams
          teamTasks,
          teamCompletedTasks,
          teamOverdueTasks,
          teamTasksInProgress,
          
          // Projects user is involved in
          myProjects,
          myActiveProjects,
          myCompletedProjects,
          
          // User's team information
          myTeams,
          myActiveTeams,
          
          // Recent activity for user
          myRecentTasksCompleted,
        ] = await Promise.all([
          // Individual tasks
          prisma.taskAssignee.count({ 
            where: { userId: user.id },
          }),
          prisma.taskAssignee.count({ 
            where: { 
              userId: user.id,
              task: { status: 'COMPLETED' }
            },
          }),
          prisma.taskAssignee.count({ 
            where: { 
              userId: user.id,
              task: { 
                status: { not: 'COMPLETED' },
                OR: [
                  { endDate: { lt: now } },
                  { startDate: { lt: now } }
                ]
              }
            },
          }),
          prisma.taskAssignee.count({ 
            where: { 
              userId: user.id,
              task: { status: 'IN_PROGRESS' }
            },
          }),
          
          // Team tasks
          prisma.taskTeam.count({
            where: { teamId: { in: userTeamIds } },
          }),
          prisma.taskTeam.count({
            where: { 
              teamId: { in: userTeamIds },
              task: { status: 'COMPLETED' }
            },
          }),
          prisma.taskTeam.count({
            where: { 
              teamId: { in: userTeamIds },
              task: { 
                status: { not: 'COMPLETED' },
                OR: [
                  { endDate: { lt: now } },
                  { startDate: { lt: now } }
                ]
              }
            },
          }),
          prisma.taskTeam.count({
            where: { 
              teamId: { in: userTeamIds },
              task: { status: 'IN_PROGRESS' }
            },
          }),
          
          // Projects
          prisma.projectMember.count({
            where: { userId: user.id },
          }),
          prisma.projectMember.count({
            where: { 
              userId: user.id,
              project: { status: 'ACTIVE' }
            },
          }),
          prisma.projectMember.count({
            where: { 
              userId: user.id,
              project: { status: 'COMPLETED' }
            },
          }),
          
          // Teams
          prisma.userTeam.count({ where: { userId: user.id } }),
          prisma.userTeam.count({ 
            where: { 
              userId: user.id,
              team: { isActive: true }
            }
          }),
          
          // Recent activity (individual + team tasks completed this week)
          prisma.task.count({
            where: {
              status: 'COMPLETED',
              completedAt: { gte: startOfThisWeek },
              OR: [
                { assignees: { some: { userId: user.id } } },
                { teams: { some: { teamId: { in: userTeamIds } } } }
              ]
            }
          }),
        ])

        // Combine individual and team task counts
        const totalTasks = myAssignedTasks + teamTasks
        const completedTasks = myCompletedTasks + teamCompletedTasks
        const overdueTasks = myOverdueTasks + teamOverdueTasks
        const tasksInProgress = myTasksInProgress + teamTasksInProgress

        stats = {
          totalTasks,
          completedTasks,
          overdueTasks,
          tasksInProgress,
          
          totalTeamMembers: 0, // Hide system stats from regular users
          activeTeamMembers: 0,
          pendingApprovals: 0, // Only admins should see pending approvals
          
          totalProjects: myProjects,
          activeProjects: myActiveProjects,
          completedProjects: myCompletedProjects,
          
          // User-specific team info
          myTeams,
          myActiveTeams,
          
          recentActivity: {
            tasksCompleted: myRecentTasksCompleted,
            newRegistrations: 0, // Hide from regular users
            totalHours: 0, // Could be calculated from user's time entries
          }
        }
      }

      return NextResponse.json(stats)
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('[Dashboard Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 