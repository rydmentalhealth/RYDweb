/**
 * Report Service
 * Handles generation of project reports and analytics
 */

import { db } from "@/lib/db"
import { format, subDays, startOfWeek, endOfWeek, subWeeks } from "date-fns"

export interface ProjectReport {
  projectId: string
  projectName: string
  generatedAt: string
  period: {
    start: string
    end: string
  }
  summary: {
    totalMilestones: number
    completedMilestones: number
    delayedMilestones: number
    averageProgress: number
    teamSize: number
    totalProgressUpdates: number
  }
  milestones: Array<{
    id: string
    title: string
    dueDate: string
    progress: number
    status: string
    responsibleUser?: string
    isOverdue: boolean
  }>
  progressUpdates: Array<{
    id: string
    date: string
    user: string
    progressPercentage: number
    taskActivity: string
    isApproved: boolean
  }>
  teamMembers: Array<{
    id: string
    name: string
    role: string
    progressUpdatesCount: number
    lastUpdateDate?: string
  }>
  recommendations: string[]
}

export interface DepartmentReport {
  department: string
  generatedAt: string
  period: {
    start: string
    end: string
  }
  summary: {
    totalProjects: number
    completedProjects: number
    activeProjects: number
    delayedProjects: number
    averageProgress: number
    totalTeamMembers: number
  }
  projects: Array<{
    id: string
    name: string
    status: string
    progress: number
    teamSize: number
    startDate: string
    endDate: string
    isOverdue: boolean
  }>
  performance: {
    completionRate: number
    averageDelayDays: number
    productivityScore: number
  }
}

export class ReportService {
  /**
   * Generate project report
   */
  static async generateProjectReport(
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProjectReport> {
    const now = new Date()
    const periodStart = startDate || subDays(now, 30)
    const periodEnd = endDate || now

    // Get project data
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: {
          include: {
            responsibleUser: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        progressUpdates: {
          where: {
            createdAt: {
              gte: periodStart,
              lte: periodEnd
            }
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        team: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // Calculate summary statistics
    const totalMilestones = project.milestones.length
    const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length
    const delayedMilestones = project.milestones.filter(m => {
      const isOverdue = m.dueDate < now && m.status !== 'COMPLETED'
      return isOverdue
    }).length

    const averageProgress = totalMilestones > 0 
      ? Math.round(project.milestones.reduce((sum, m) => sum + m.progress, 0) / totalMilestones)
      : 0

    const teamSize = project.team.length
    const totalProgressUpdates = project.progressUpdates.length

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      totalMilestones,
      completedMilestones,
      delayedMilestones,
      averageProgress,
      teamSize,
      totalProgressUpdates
    })

    return {
      projectId: project.id,
      projectName: project.name,
      generatedAt: now.toISOString(),
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString()
      },
      summary: {
        totalMilestones,
        completedMilestones,
        delayedMilestones,
        averageProgress,
        teamSize,
        totalProgressUpdates
      },
      milestones: project.milestones.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        dueDate: milestone.dueDate.toISOString(),
        progress: milestone.progress,
        status: milestone.status,
        responsibleUser: milestone.responsibleUser 
          ? `${milestone.responsibleUser.firstName} ${milestone.responsibleUser.lastName}`
          : undefined,
        isOverdue: milestone.dueDate < now && milestone.status !== 'COMPLETED'
      })),
      progressUpdates: project.progressUpdates.map(update => ({
        id: update.id,
        date: update.createdAt.toISOString(),
        user: `${update.user.firstName} ${update.user.lastName}`,
        progressPercentage: update.progressPercentage,
        taskActivity: update.taskActivity,
        isApproved: update.isApproved
      })),
      teamMembers: project.team.map(member => {
        const memberUpdates = project.progressUpdates.filter(u => u.userId === member.user.id)
        const lastUpdate = memberUpdates.length > 0 
          ? memberUpdates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
          : null

        return {
          id: member.user.id,
          name: `${member.user.firstName} ${member.user.lastName}`,
          role: member.role,
          progressUpdatesCount: memberUpdates.length,
          lastUpdateDate: lastUpdate?.createdAt.toISOString()
        }
      }),
      recommendations
    }
  }

  /**
   * Generate department report
   */
  static async generateDepartmentReport(
    department: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DepartmentReport> {
    const now = new Date()
    const periodStart = startDate || subDays(now, 30)
    const periodEnd = endDate || now

    // Get projects for department
    const projects = await db.project.findMany({
      where: {
        department: department,
        createdAt: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      include: {
        milestones: true,
        team: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    // Calculate summary statistics
    const totalProjects = projects.length
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
    const delayedProjects = projects.filter(p => {
      const isOverdue = p.endDate && p.endDate < now && p.status !== 'COMPLETED'
      return isOverdue
    }).length

    const averageProgress = projects.length > 0
      ? Math.round(projects.reduce((sum, project) => {
          if (project.milestones.length > 0) {
            const projectProgress = project.milestones.reduce((milestoneSum, milestone) => 
              milestoneSum + milestone.progress, 0) / project.milestones.length
            return sum + projectProgress
          }
          return sum
        }, 0) / projects.length)
      : 0

    const totalTeamMembers = new Set(
      projects.flatMap(p => p.team.map(t => t.user.id))
    ).size

    // Calculate performance metrics
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
    
    const averageDelayDays = delayedProjects > 0
      ? Math.round(projects
          .filter(p => p.endDate && p.endDate < now && p.status !== 'COMPLETED')
          .reduce((sum, p) => {
            const delayDays = Math.ceil((now.getTime() - p.endDate!.getTime()) / (1000 * 60 * 60 * 24))
            return sum + delayDays
          }, 0) / delayedProjects)
      : 0

    const productivityScore = Math.round(
      (completionRate * 0.4) + 
      (averageProgress * 0.3) + 
      ((100 - averageDelayDays) * 0.3)
    )

    return {
      department,
      generatedAt: now.toISOString(),
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString()
      },
      summary: {
        totalProjects,
        completedProjects,
        activeProjects,
        delayedProjects,
        averageProgress,
        totalTeamMembers
      },
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.milestones.length > 0
          ? Math.round(project.milestones.reduce((sum, m) => sum + m.progress, 0) / project.milestones.length)
          : 0,
        teamSize: project.team.length,
        startDate: project.startDate?.toISOString() || '',
        endDate: project.endDate?.toISOString() || '',
        isOverdue: project.endDate ? project.endDate < now && project.status !== 'COMPLETED' : false
      })),
      performance: {
        completionRate,
        averageDelayDays,
        productivityScore
      }
    }
  }

  /**
   * Generate weekly summary report
   */
  static async generateWeeklySummary(): Promise<{
    totalProjects: number
    completedThisWeek: number
    activeProjects: number
    delayedProjects: number
    departmentStats: Array<{
      department: string
      total: number
      completed: number
      averageProgress: number
    }>
    topPerformers: Array<{
      userId: string
      name: string
      progressUpdatesCount: number
      averageProgress: number
    }>
    recommendations: string[]
  }> {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    // Get all projects
    const allProjects = await db.project.findMany({
      include: {
        milestones: true,
        team: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    // Get progress updates for the week
    const weeklyUpdates = await db.projectProgressUpdate.findMany({
      where: {
        createdAt: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Calculate statistics
    const totalProjects = allProjects.length
    const completedThisWeek = allProjects.filter(p => 
      p.status === 'COMPLETED' && 
      p.updatedAt >= weekStart && 
      p.updatedAt <= weekEnd
    ).length
    const activeProjects = allProjects.filter(p => p.status === 'ACTIVE').length
    const delayedProjects = allProjects.filter(p => 
      p.endDate && p.endDate < now && p.status !== 'COMPLETED'
    ).length

    // Department statistics
    const departmentStats = await this.getDepartmentStats(allProjects)

    // Top performers
    const topPerformers = this.getTopPerformers(weeklyUpdates)

    // Generate recommendations
    const recommendations = this.generateWeeklyRecommendations({
      totalProjects,
      completedThisWeek,
      activeProjects,
      delayedProjects,
      departmentStats
    })

    return {
      totalProjects,
      completedThisWeek,
      activeProjects,
      delayedProjects,
      departmentStats,
      topPerformers,
      recommendations
    }
  }

  /**
   * Generate recommendations based on project data
   */
  private static generateRecommendations(data: {
    totalMilestones: number
    completedMilestones: number
    delayedMilestones: number
    averageProgress: number
    teamSize: number
    totalProgressUpdates: number
  }): string[] {
    const recommendations: string[] = []

    if (data.delayedMilestones > 0) {
      recommendations.push(`Address ${data.delayedMilestones} delayed milestone(s) to get back on track`)
    }

    if (data.averageProgress < 50) {
      recommendations.push('Project progress is below 50%. Consider reviewing resource allocation and timeline')
    }

    if (data.totalProgressUpdates < data.teamSize * 2) {
      recommendations.push('Encourage more frequent progress updates from team members')
    }

    if (data.completedMilestones / data.totalMilestones < 0.3) {
      recommendations.push('Low milestone completion rate. Consider breaking down larger milestones into smaller tasks')
    }

    if (data.teamSize > 10) {
      recommendations.push('Large team size detected. Consider creating sub-teams or breaking the project into smaller components')
    }

    return recommendations
  }

  /**
   * Generate weekly recommendations
   */
  private static generateWeeklyRecommendations(data: {
    totalProjects: number
    completedThisWeek: number
    activeProjects: number
    delayedProjects: number
    departmentStats: Array<{ department: string; total: number; completed: number; averageProgress: number }>
  }): string[] {
    const recommendations: string[] = []

    if (data.completedThisWeek === 0) {
      recommendations.push('No projects completed this week. Review project timelines and resource allocation')
    }

    if (data.delayedProjects > data.totalProjects * 0.3) {
      recommendations.push('High number of delayed projects. Consider reviewing project management processes')
    }

    const lowPerformingDepts = data.departmentStats.filter(dept => dept.averageProgress < 50)
    if (lowPerformingDepts.length > 0) {
      recommendations.push(`Departments with low performance: ${lowPerformingDepts.map(d => d.department).join(', ')}`)
    }

    return recommendations
  }

  /**
   * Get department statistics
   */
  private static async getDepartmentStats(projects: any[]): Promise<Array<{
    department: string
    total: number
    completed: number
    averageProgress: number
  }>> {
    const deptMap = new Map<string, { total: number; completed: number; progressSum: number; progressCount: number }>()

    projects.forEach(project => {
      const dept = project.department || 'Other'
      const isCompleted = project.status === 'COMPLETED'
      const progress = project.milestones.length > 0
        ? project.milestones.reduce((sum: number, m: any) => sum + m.progress, 0) / project.milestones.length
        : 0

      if (!deptMap.has(dept)) {
        deptMap.set(dept, { total: 0, completed: 0, progressSum: 0, progressCount: 0 })
      }

      const deptData = deptMap.get(dept)!
      deptData.total++
      if (isCompleted) deptData.completed++
      deptData.progressSum += progress
      deptData.progressCount++
    })

    return Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      total: data.total,
      completed: data.completed,
      averageProgress: data.progressCount > 0 ? Math.round(data.progressSum / data.progressCount) : 0
    }))
  }

  /**
   * Get top performers
   */
  private static getTopPerformers(updates: any[]): Array<{
    userId: string
    name: string
    progressUpdatesCount: number
    averageProgress: number
  }> {
    const userMap = new Map<string, { name: string; updates: any[]; progressSum: number }>()

    updates.forEach(update => {
      const userId = update.user.id
      const name = `${update.user.firstName} ${update.user.lastName}`

      if (!userMap.has(userId)) {
        userMap.set(userId, { name, updates: [], progressSum: 0 })
      }

      const userData = userMap.get(userId)!
      userData.updates.push(update)
      userData.progressSum += update.progressPercentage
    })

    return Array.from(userMap.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        progressUpdatesCount: data.updates.length,
        averageProgress: Math.round(data.progressSum / data.updates.length)
      }))
      .sort((a, b) => b.progressUpdatesCount - a.progressUpdatesCount)
      .slice(0, 5)
  }
}