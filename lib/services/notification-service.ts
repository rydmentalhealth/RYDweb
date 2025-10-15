/**
 * Notification Service
 * Handles sending notifications for project and task updates
 */

export interface NotificationData {
  type: 'project_created' | 'project_updated' | 'milestone_created' | 'milestone_overdue' | 'progress_update' | 'task_assigned' | 'task_completed'
  projectId?: string
  taskId?: string
  milestoneId?: string
  userId: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  metadata?: Record<string, any>
}

export interface EmailNotification {
  to: string[]
  subject: string
  html: string
  text?: string
}

export class NotificationService {
  /**
   * Send project creation notification
   */
  static async notifyProjectCreated(project: {
    id: string
    name: string
    ownerId: string
    members: Array<{ id: string; email: string; firstName: string; lastName: string }>
  }) {
    const notifications: NotificationData[] = []
    
    // Notify all team members
    for (const member of project.members) {
      notifications.push({
        type: 'project_created',
        projectId: project.id,
        userId: member.id,
        title: 'New Project Assignment',
        message: `You have been assigned to the project "${project.name}"`,
        priority: 'medium',
        metadata: {
          projectName: project.name,
          projectId: project.id
        }
      })
    }

    // Send email notifications
    await this.sendEmailNotification({
      to: project.members.map(m => m.email),
      subject: `New Project Assignment: ${project.name}`,
      html: this.generateProjectCreatedEmail(project),
      text: `You have been assigned to the new project "${project.name}". Please check your dashboard for more details.`
    })

    return notifications
  }

  /**
   * Send milestone overdue notification
   */
  static async notifyMilestoneOverdue(milestone: {
    id: string
    title: string
    projectId: string
    projectName: string
    dueDate: string
    responsibleUserId: string
    responsibleUserEmail: string
    daysOverdue: number
  }) {
    const notification: NotificationData = {
      type: 'milestone_overdue',
      projectId: milestone.projectId,
      milestoneId: milestone.id,
      userId: milestone.responsibleUserId,
      title: 'Milestone Overdue',
      message: `The milestone "${milestone.title}" in project "${milestone.projectName}" is ${milestone.daysOverdue} days overdue`,
      priority: 'high',
      metadata: {
        milestoneTitle: milestone.title,
        projectName: milestone.projectName,
        daysOverdue: milestone.daysOverdue
      }
    }

    // Send email notification
    await this.sendEmailNotification({
      to: [milestone.responsibleUserEmail],
      subject: `URGENT: Milestone Overdue - ${milestone.title}`,
      html: this.generateMilestoneOverdueEmail(milestone),
      text: `The milestone "${milestone.title}" in project "${milestone.projectName}" is ${milestone.daysOverdue} days overdue. Please update the status immediately.`
    })

    return notification
  }

  /**
   * Send progress update notification to project lead
   */
  static async notifyProgressUpdate(update: {
    id: string
    projectId: string
    projectName: string
    userId: string
    userName: string
    progressPercentage: number
    taskActivity: string
    projectLeadId: string
    projectLeadEmail: string
  }) {
    const notification: NotificationData = {
      type: 'progress_update',
      projectId: update.projectId,
      userId: update.projectLeadId,
      title: 'New Progress Update',
      message: `${update.userName} submitted a progress update for project "${update.projectName}"`,
      priority: 'medium',
      metadata: {
        projectName: update.projectName,
        userName: update.userName,
        progressPercentage: update.progressPercentage,
        taskActivity: update.taskActivity
      }
    }

    // Send email notification
    await this.sendEmailNotification({
      to: [update.projectLeadEmail],
      subject: `Progress Update: ${update.projectName}`,
      html: this.generateProgressUpdateEmail(update),
      text: `${update.userName} submitted a progress update for project "${update.projectName}". Progress: ${update.progressPercentage}%`
    })

    return notification
  }

  /**
   * Send daily reminder for progress updates
   */
  static async sendDailyProgressReminder(users: Array<{
    id: string
    email: string
    firstName: string
    lastName: string
    projects: Array<{
      id: string
      name: string
    }>
  }>) {
    const notifications: NotificationData[] = []
    
    for (const user of users) {
      if (user.projects.length > 0) {
        notifications.push({
          type: 'progress_update',
          userId: user.id,
          title: 'Daily Progress Update Reminder',
          message: `Please submit your daily progress update for ${user.projects.length} active project(s)`,
          priority: 'low',
          metadata: {
            projectCount: user.projects.length,
            projects: user.projects
          }
        })

        // Send email reminder
        await this.sendEmailNotification({
          to: [user.email],
          subject: 'Daily Progress Update Reminder',
          html: this.generateDailyReminderEmail(user),
          text: `Please submit your daily progress update for your active projects.`
        })
      }
    }

    return notifications
  }

  /**
   * Send weekly project summary to directors
   */
  static async sendWeeklyProjectSummary(directors: Array<{
    id: string
    email: string
    firstName: string
    lastName: string
  }>, summary: {
    totalProjects: number
    completedProjects: number
    activeProjects: number
    delayedProjects: number
    departmentStats: Array<{
      department: string
      total: number
      completed: number
      averageProgress: number
    }>
  }) {
    const notifications: NotificationData[] = []
    
    for (const director of directors) {
      notifications.push({
        type: 'project_updated',
        userId: director.id,
        title: 'Weekly Project Summary',
        message: `Weekly project summary: ${summary.completedProjects}/${summary.totalProjects} projects completed`,
        priority: 'medium',
        metadata: summary
      })

      // Send email summary
      await this.sendEmailNotification({
        to: [director.email],
        subject: 'Weekly Project Summary Report',
        html: this.generateWeeklySummaryEmail(summary),
        text: `Weekly project summary: ${summary.completedProjects}/${summary.totalProjects} projects completed`
      })
    }

    return notifications
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(email: EmailNotification) {
    try {
      // TODO: Implement actual email sending (using SendGrid, AWS SES, etc.)
      console.log('Sending email notification:', email.subject)
      console.log('To:', email.to)
      console.log('HTML:', email.html)
      
      // For now, just log the email
      return { success: true, messageId: 'mock-message-id' }
    } catch (error) {
      console.error('Failed to send email notification:', error)
      throw error
    }
  }

  /**
   * Generate project created email HTML
   */
  private static generateProjectCreatedEmail(project: {
    name: string
    id: string
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Project Assignment</h2>
        <p>You have been assigned to a new project:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #1e293b;">${project.name}</h3>
          <p style="margin: 10px 0 0 0; color: #64748b;">Project ID: ${project.id}</p>
        </div>
        <p>Please check your dashboard for more details and start contributing to the project.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/projects" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          View Project Dashboard
        </a>
      </div>
    `
  }

  /**
   * Generate milestone overdue email HTML
   */
  private static generateMilestoneOverdueEmail(milestone: {
    title: string
    projectName: string
    daysOverdue: number
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Milestone Overdue</h2>
        <p>The following milestone is overdue and requires immediate attention:</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #dc2626;">${milestone.title}</h3>
          <p style="margin: 10px 0 0 0; color: #7f1d1d;">Project: ${milestone.projectName}</p>
          <p style="margin: 10px 0 0 0; color: #dc2626; font-weight: bold;">${milestone.daysOverdue} days overdue</p>
        </div>
        <p>Please update the milestone status or provide an explanation for the delay.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/projects" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Update Milestone Status
        </a>
      </div>
    `
  }

  /**
   * Generate progress update email HTML
   */
  private static generateProgressUpdateEmail(update: {
    projectName: string
    userName: string
    progressPercentage: number
    taskActivity: string
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Progress Update</h2>
        <p><strong>${update.userName}</strong> has submitted a progress update for project <strong>${update.projectName}</strong>:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #1e293b;">Progress: ${update.progressPercentage}%</h3>
          <p style="margin: 10px 0 0 0; color: #64748b;">${update.taskActivity}</p>
        </div>
        <p>Please review and approve the progress update.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/projects" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Review Progress Update
        </a>
      </div>
    `
  }

  /**
   * Generate daily reminder email HTML
   */
  private static generateDailyReminderEmail(user: {
    firstName: string
    lastName: string
    projects: Array<{ name: string }>
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Daily Progress Update Reminder</h2>
        <p>Hi ${user.firstName},</p>
        <p>This is a reminder to submit your daily progress update for your active projects:</p>
        <ul style="list-style: none; padding: 0;">
          ${user.projects.map(project => `
            <li style="background-color: #f8fafc; padding: 10px; margin: 5px 0; border-radius: 4px;">
              📋 ${project.name}
            </li>
          `).join('')}
        </ul>
        <p>Please take a few minutes to update your progress and keep your team informed.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/projects" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Submit Progress Update
        </a>
      </div>
    `
  }

  /**
   * Generate weekly summary email HTML
   */
  private static generateWeeklySummaryEmail(summary: {
    totalProjects: number
    completedProjects: number
    activeProjects: number
    delayedProjects: number
    departmentStats: Array<{
      department: string
      total: number
      completed: number
      averageProgress: number
    }>
  }): string {
    const completionRate = summary.totalProjects > 0 ? Math.round((summary.completedProjects / summary.totalProjects) * 100) : 0
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Weekly Project Summary Report</h2>
        <p>Here's a summary of project performance for this week:</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #0369a1; font-size: 2em;">${summary.totalProjects}</h3>
            <p style="margin: 5px 0 0 0; color: #0369a1;">Total Projects</p>
          </div>
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #16a34a; font-size: 2em;">${summary.completedProjects}</h3>
            <p style="margin: 5px 0 0 0; color: #16a34a;">Completed</p>
          </div>
          <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #ca8a04; font-size: 2em;">${summary.activeProjects}</h3>
            <p style="margin: 5px 0 0 0; color: #ca8a04;">Active</p>
          </div>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #dc2626; font-size: 2em;">${summary.delayedProjects}</h3>
            <p style="margin: 5px 0 0 0; color: #dc2626;">Delayed</p>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e293b;">Overall Completion Rate: ${completionRate}%</h3>
          <div style="background-color: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background-color: #2563eb; height: 100%; width: ${completionRate}%; transition: width 0.3s ease;"></div>
          </div>
        </div>
        
        <h3 style="color: #1e293b; margin: 30px 0 15px 0;">Department Performance</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0;">Department</th>
              <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">Total</th>
              <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">Completed</th>
              <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">Avg Progress</th>
            </tr>
          </thead>
          <tbody>
            ${summary.departmentStats.map(dept => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${dept.department}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${dept.total}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${dept.completed}</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${Math.round(dept.averageProgress)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <a href="${process.env.NEXTAUTH_URL}/dashboard/projects" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          View Detailed Analytics
        </a>
      </div>
    `
  }
}