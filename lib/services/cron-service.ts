/**
 * Cron Service
 * Handles scheduled tasks and automated notifications
 */

import { db } from "@/lib/db"
import { NotificationService } from "./notification-service"
import { format, subDays, startOfWeek, endOfWeek } from "date-fns"

export class CronService {
  /**
   * Check for overdue milestones and send notifications
   * Should run every hour
   */
  static async checkOverdueMilestones() {
    try {
      console.log('[Cron] Checking for overdue milestones...')
      
      const now = new Date()
      const overdueThreshold = new Date(now.getTime() - (48 * 60 * 60 * 1000)) // 48 hours ago
      
      // Find overdue milestones
      const overdueMilestones = await db.projectMilestone.findMany({
        where: {
          dueDate: {
            lt: overdueThreshold
          },
          status: {
            not: 'COMPLETED'
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          responsibleUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      console.log(`[Cron] Found ${overdueMilestones.length} overdue milestones`)

      // Send notifications for each overdue milestone
      for (const milestone of overdueMilestones) {
        if (milestone.responsibleUser) {
          const daysOverdue = Math.ceil((now.getTime() - milestone.dueDate.getTime()) / (1000 * 60 * 60 * 24))
          
          await NotificationService.notifyMilestoneOverdue({
            id: milestone.id,
            title: milestone.title,
            projectId: milestone.project.id,
            projectName: milestone.project.name,
            dueDate: milestone.dueDate.toISOString(),
            responsibleUserId: milestone.responsibleUser.id,
            responsibleUserEmail: milestone.responsibleUser.email,
            daysOverdue
          })
        }
      }

      return { success: true, processed: overdueMilestones.length }
    } catch (error) {
      console.error('[Cron] Error checking overdue milestones:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send daily progress update reminders
   * Should run at 5 PM daily
   */
  static async sendDailyProgressReminders() {
    try {
      console.log('[Cron] Sending daily progress update reminders...')
      
      // Find users with active projects who haven't submitted updates today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const usersWithActiveProjects = await db.user.findMany({
        where: {
          status: 'ACTIVE',
          projectMemberships: {
            some: {
              project: {
                status: 'ACTIVE'
              }
            }
          }
        },
        include: {
          projectMemberships: {
            where: {
              project: {
                status: 'ACTIVE'
              }
            },
            include: {
              project: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })

      // Filter users who haven't submitted updates today
      const usersNeedingReminders = []
      for (const user of usersWithActiveProjects) {
        const hasSubmittedToday = await db.projectProgressUpdate.findFirst({
          where: {
            userId: user.id,
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        })

        if (!hasSubmittedToday) {
          usersNeedingReminders.push({
            id: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            projects: user.projectMemberships.map(pm => ({
              id: pm.project.id,
              name: pm.project.name
            }))
          })
        }
      }

      console.log(`[Cron] Sending reminders to ${usersNeedingReminders.length} users`)

      // Send reminders
      await NotificationService.sendDailyProgressReminder(usersNeedingReminders)

      return { success: true, processed: usersNeedingReminders.length }
    } catch (error) {
      console.error('[Cron] Error sending daily reminders:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Generate and send weekly project summary
   * Should run every Monday at 9 AM
   */
  static async sendWeeklyProjectSummary() {
    try {
      console.log('[Cron] Generating weekly project summary...')
      
      // Find all directors and admins
      const directors = await db.user.findMany({
        where: {
          role: {
            in: ['DIRECTOR', 'ADMIN', 'SUPER_ADMIN']
          },
          status: 'ACTIVE'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      })

      // Get project statistics
      const totalProjects = await db.project.count()
      const completedProjects = await db.project.count({
        where: { status: 'COMPLETED' }
      })
      const activeProjects = await db.project.count({
        where: { status: 'ACTIVE' }
      })

      // Calculate delayed projects (past end date but not completed)
      const now = new Date()
      const delayedProjects = await db.project.count({
        where: {
          endDate: {
            lt: now
          },
          status: {
            not: 'COMPLETED'
          }
        }
      })

      // Get department statistics
      const departmentStats = await db.project.groupBy({
        by: ['department'],
        _count: {
          id: true
        },
        where: {
          department: {
            not: null
          }
        }
      })

      // Calculate average progress by department
      const avgProgressByDept = await Promise.all(
        departmentStats.map(async (dept) => {
          const projects = await db.project.findMany({
            where: {
              department: dept.department
            },
            include: {
              milestones: true
            }
          })

          const totalProgress = projects.reduce((sum, project) => {
            if (project.milestones.length > 0) {
              const avgProgress = project.milestones.reduce((milestoneSum, milestone) => 
                milestoneSum + milestone.progress, 0) / project.milestones.length
              return sum + avgProgress
            }
            return sum
          }, 0)

          const completedCount = projects.filter(p => p.status === 'COMPLETED').length

          return {
            department: dept.department || 'Other',
            total: dept._count.id,
            completed: completedCount,
            averageProgress: projects.length > 0 ? totalProgress / projects.length : 0
          }
        })
      )

      const summary = {
        totalProjects,
        completedProjects,
        activeProjects,
        delayedProjects,
        departmentStats: avgProgressByDept
      }

      console.log(`[Cron] Sending weekly summary to ${directors.length} directors`)

      // Send summary to all directors
      await NotificationService.sendWeeklyProjectSummary(directors, summary)

      return { success: true, processed: directors.length }
    } catch (error) {
      console.error('[Cron] Error generating weekly summary:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Clean up old notifications and logs
   * Should run daily at midnight
   */
  static async cleanupOldData() {
    try {
      console.log('[Cron] Cleaning up old data...')
      
      const thirtyDaysAgo = subDays(new Date(), 30)
      
      // Clean up old activity logs
      const deletedActivityLogs = await db.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      })

      // Clean up old project activity logs
      const deletedProjectLogs = await db.projectActivityLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      })

      console.log(`[Cron] Cleaned up ${deletedActivityLogs.count} activity logs and ${deletedProjectLogs.count} project logs`)

      return { 
        success: true, 
        deletedActivityLogs: deletedActivityLogs.count,
        deletedProjectLogs: deletedProjectLogs.count
      }
    } catch (error) {
      console.error('[Cron] Error cleaning up old data:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update project progress based on milestone completion
   * Should run every 6 hours
   */
  static async updateProjectProgress() {
    try {
      console.log('[Cron] Updating project progress...')
      
      const projects = await db.project.findMany({
        include: {
          milestones: true
        }
      })

      let updatedCount = 0

      for (const project of projects) {
        if (project.milestones.length > 0) {
          const totalProgress = project.milestones.reduce((sum, milestone) => 
            sum + milestone.progress, 0)
          const averageProgress = Math.round(totalProgress / project.milestones.length)

          // Update project status based on progress
          let newStatus = project.status
          if (averageProgress >= 100 && project.status !== 'COMPLETED') {
            newStatus = 'COMPLETED'
          } else if (averageProgress > 0 && project.status === 'PLANNING') {
            newStatus = 'ACTIVE'
          }

          // Only update if there's a change
          if (newStatus !== project.status) {
            await db.project.update({
              where: { id: project.id },
              data: { status: newStatus }
            })
            updatedCount++
          }
        }
      }

      console.log(`[Cron] Updated ${updatedCount} projects`)

      return { success: true, updated: updatedCount }
    } catch (error) {
      console.error('[Cron] Error updating project progress:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Run all scheduled tasks
   */
  static async runAllTasks() {
    console.log('[Cron] Running all scheduled tasks...')
    
    const results = {
      overdueMilestones: await this.checkOverdueMilestones(),
      dailyReminders: await this.sendDailyProgressReminders(),
      weeklySummary: await this.sendWeeklyProjectSummary(),
      cleanup: await this.cleanupOldData(),
      updateProgress: await this.updateProjectProgress()
    }

    console.log('[Cron] All tasks completed:', results)
    return results
  }
}