import { prisma } from '@/lib/db'
import { ReportCategory } from '@prisma/client'

export interface ReportConfig {
  title: string
  description: string
  category: ReportCategory
  dateRange: {
    start: Date
    end: Date
  }
  departments?: string[]
  includeCharts: boolean
  format: 'json' | 'pdf' | 'csv'
}

export interface ReportData {
  summary: Record<string, any>
  sections: Array<{
    title: string
    data: any[]
    chartType?: 'line' | 'bar' | 'pie' | 'area'
  }>
  metadata: {
    generatedAt: Date
    parameters: ReportConfig
    recordCount: number
  }
}

export class ReportGenerator {
  async generateHRReport(config: ReportConfig): Promise<ReportData> {
    const { dateRange, departments } = config
    
    // Fetch HR-related data
    const [
      userStats,
      attendanceData,
      performanceData,
      leaveData,
      departmentBreakdown
    ] = await Promise.all([
      // User statistics
      prisma.user.groupBy({
        by: ['department', 'role', 'status'],
        where: {
          createdAt: { gte: dateRange.start, lte: dateRange.end },
          ...(departments?.length && { department: { in: departments } })
        },
        _count: { id: true }
      }),
      
      // Attendance metrics
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', c."checkInTime") as week,
          COUNT(DISTINCT c."userId") as unique_users,
          AVG(c."workingHours") as avg_hours,
          SUM(c."workingHours") as total_hours
        FROM "CheckIn" c
        JOIN "User" u ON c."userId" = u.id
        WHERE c."checkInTime" >= ${dateRange.start} 
          AND c."checkInTime" <= ${dateRange.end}
          ${departments?.length ? `AND u.department = ANY(${departments})` : ''}
        GROUP BY DATE_TRUNC('week', c."checkInTime")
        ORDER BY week
      `,
      
      // Performance reviews
      prisma.performanceReview.groupBy({
        by: ['rating'],
        where: {
          reviewDate: { gte: dateRange.start, lte: dateRange.end }
        },
        _count: { id: true },
        _avg: { rating: true }
      }),
      
      // Leave analysis
      prisma.leaveRequest.groupBy({
        by: ['type', 'status'],
        where: {
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _count: { id: true }
      }),
      
      // Department performance
      prisma.$queryRaw`
        SELECT 
          u.department,
          COUNT(DISTINCT u.id) as employee_count,
          COUNT(DISTINCT p.id) as project_count,
          COUNT(DISTINCT t.id) as task_count,
          COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed_tasks
        FROM "User" u
        LEFT JOIN "ProjectMember" pm ON u.id = pm."userId"
        LEFT JOIN "Project" p ON pm."projectId" = p.id
        LEFT JOIN "TaskAssignee" ta ON u.id = ta."userId"
        LEFT JOIN "Task" t ON ta."taskId" = t.id
        WHERE u.status = 'ACTIVE'
          ${departments?.length ? `AND u.department = ANY(${departments})` : ''}
        GROUP BY u.department
        ORDER BY employee_count DESC
      `
    ])

    const totalUsers = userStats.reduce((sum, stat) => sum + stat._count.id, 0)
    const activeUsers = userStats
      .filter(stat => stat.status === 'ACTIVE')
      .reduce((sum, stat) => sum + stat._count.id, 0)
    
    const totalLeaveRequests = leaveData.reduce((sum, leave) => sum + leave._count.id, 0)
    const approvedLeaves = leaveData
      .filter(leave => leave.status === 'APPROVED')
      .reduce((sum, leave) => sum + leave._count.id, 0)

    return {
      summary: {
        totalUsers,
        activeUsers,
        userGrowthRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
        averagePerformanceRating: performanceData.length > 0 
          ? performanceData.reduce((sum, p) => sum + (p._avg.rating || 0), 0) / performanceData.length 
          : 0,
        totalLeaveRequests,
        leaveApprovalRate: totalLeaveRequests > 0 ? ((approvedLeaves / totalLeaveRequests) * 100).toFixed(1) : 0,
        averageWorkingHours: (attendanceData as any[]).length > 0
          ? (attendanceData as any[]).reduce((sum: number, week: any) => sum + (Number(week.avg_hours) || 0), 0) / (attendanceData as any[]).length
          : 0
      },
      sections: [
        {
          title: 'User Distribution by Department',
          data: userStats.map(stat => ({
            department: stat.department || 'Unassigned',
            role: stat.role,
            status: stat.status,
            count: stat._count.id
          })),
          chartType: 'bar' as const
        },
        {
          title: 'Weekly Attendance Trends',
          data: (attendanceData as any[]).map((week: any) => ({
            week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            uniqueUsers: Number(week.unique_users),
            avgHours: Number(week.avg_hours) || 0,
            totalHours: Number(week.total_hours) || 0
          })),
          chartType: 'line' as const
        },
        {
          title: 'Performance Rating Distribution',
          data: performanceData.map(perf => ({
            rating: perf.rating,
            count: perf._count.id
          })),
          chartType: 'pie' as const
        },
        {
          title: 'Leave Request Analysis',
          data: leaveData.map(leave => ({
            type: leave.type,
            status: leave.status,
            count: leave._count.id
          })),
          chartType: 'bar' as const
        },
        {
          title: 'Department Performance Overview',
          data: (departmentBreakdown as any[]).map((dept: any) => ({
            department: dept.department || 'Unassigned',
            employeeCount: Number(dept.employee_count),
            projectCount: Number(dept.project_count),
            taskCount: Number(dept.task_count),
            completedTasks: Number(dept.completed_tasks),
            completionRate: Number(dept.task_count) > 0 
              ? ((Number(dept.completed_tasks) / Number(dept.task_count)) * 100).toFixed(1)
              : 0
          }))
        }
      ],
      metadata: {
        generatedAt: new Date(),
        parameters: config,
        recordCount: totalUsers
      }
    }
  }

  async generateProjectReport(config: ReportConfig): Promise<ReportData> {
    const { dateRange, departments } = config
    
    const [
      projectStats,
      taskMetrics,
      milestoneProgress,
      teamProductivity
    ] = await Promise.all([
      // Project statistics
      prisma.project.findMany({
        where: {
          createdAt: { gte: dateRange.start, lte: dateRange.end },
          ...(departments?.length && { department: { in: departments } })
        },
        include: {
          _count: {
            select: {
              tasks: true,
              team: true,
              milestones: true
            }
          }
        }
      }),
      
      // Task completion metrics
      prisma.$queryRaw`
        SELECT 
          p.department,
          p.status as project_status,
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN t.status = 'OVERDUE' THEN 1 END) as overdue_tasks,
          AVG(CASE WHEN t."completedAt" IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (t."completedAt" - t."createdAt"))/86400 
              END) as avg_completion_days
        FROM "Task" t
        JOIN "Project" p ON t."projectId" = p.id
        WHERE t."createdAt" >= ${dateRange.start} 
          AND t."createdAt" <= ${dateRange.end}
          ${departments?.length ? `AND p.department = ANY(${departments})` : ''}
        GROUP BY p.department, p.status
        ORDER BY p.department, p.status
      `,
      
      // Milestone progress
      prisma.projectMilestone.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: dateRange.start, lte: dateRange.end }
        },
        _count: { id: true },
        _avg: { progress: true }
      }),
      
      // Team productivity
      prisma.$queryRaw`
        SELECT 
          pm."userId",
          u."firstName",
          u."lastName",
          u.department,
          COUNT(DISTINCT pm."projectId") as project_count,
          COUNT(DISTINCT ta."taskId") as task_count,
          COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed_tasks
        FROM "ProjectMember" pm
        JOIN "User" u ON pm."userId" = u.id
        LEFT JOIN "TaskAssignee" ta ON u.id = ta."userId"
        LEFT JOIN "Task" t ON ta."taskId" = t.id
        WHERE pm."joinedAt" >= ${dateRange.start}
          ${departments?.length ? `AND u.department = ANY(${departments})` : ''}
        GROUP BY pm."userId", u."firstName", u."lastName", u.department
        ORDER BY completed_tasks DESC
        LIMIT 20
      `
    ])

    const totalProjects = projectStats.length
    const activeProjects = projectStats.filter(p => p.status === 'ACTIVE').length
    const completedProjects = projectStats.filter(p => p.status === 'COMPLETED').length
    
    const totalTasks = (taskMetrics as any[]).reduce((sum: number, metric: any) => sum + Number(metric.total_tasks), 0)
    const completedTasks = (taskMetrics as any[]).reduce((sum: number, metric: any) => sum + Number(metric.completed_tasks), 0)

    return {
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        projectCompletionRate: totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0,
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
        averageProjectTeamSize: totalProjects > 0 
          ? projectStats.reduce((sum, p) => sum + p._count.team, 0) / totalProjects 
          : 0
      },
      sections: [
        {
          title: 'Project Status Distribution',
          data: projectStats.reduce((acc: any[], project) => {
            const existing = acc.find(item => item.status === project.status)
            if (existing) {
              existing.count++
            } else {
              acc.push({ status: project.status, count: 1 })
            }
            return acc
          }, []),
          chartType: 'pie' as const
        },
        {
          title: 'Task Metrics by Department',
          data: (taskMetrics as any[]).map((metric: any) => ({
            department: metric.department || 'Unassigned',
            totalTasks: Number(metric.total_tasks),
            completedTasks: Number(metric.completed_tasks),
            overdueTasks: Number(metric.overdue_tasks),
            completionRate: Number(metric.total_tasks) > 0 
              ? ((Number(metric.completed_tasks) / Number(metric.total_tasks)) * 100).toFixed(1)
              : 0,
            avgCompletionDays: Number(metric.avg_completion_days) || 0
          })),
          chartType: 'bar' as const
        },
        {
          title: 'Milestone Progress',
          data: milestoneProgress.map(milestone => ({
            status: milestone.status,
            count: milestone._count.id,
            avgProgress: milestone._avg.progress || 0
          })),
          chartType: 'bar' as const
        },
        {
          title: 'Top Performers',
          data: (teamProductivity as any[]).map((member: any) => ({
            name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
            department: member.department,
            projectCount: Number(member.project_count),
            taskCount: Number(member.task_count),
            completedTasks: Number(member.completed_tasks),
            completionRate: Number(member.task_count) > 0 
              ? ((Number(member.completed_tasks) / Number(member.task_count)) * 100).toFixed(1)
              : 0
          }))
        }
      ],
      metadata: {
        generatedAt: new Date(),
        parameters: config,
        recordCount: totalProjects
      }
    }
  }

  async generateAttendanceReport(config: ReportConfig): Promise<ReportData> {
    const { dateRange, departments } = config
    
    const attendanceData = await prisma.$queryRaw`
      SELECT 
        u.id,
        u."firstName",
        u."lastName",
        u.department,
        COUNT(c.id) as check_in_count,
        AVG(c."workingHours") as avg_hours,
        SUM(c."workingHours") as total_hours,
        MIN(c."checkInTime") as first_check_in,
        MAX(c."checkInTime") as last_check_in
      FROM "User" u
      LEFT JOIN "CheckIn" c ON u.id = c."userId" 
        AND c."checkInTime" >= ${dateRange.start} 
        AND c."checkInTime" <= ${dateRange.end}
      WHERE u.status = 'ACTIVE'
        ${departments?.length ? `AND u.department = ANY(${departments})` : ''}
      GROUP BY u.id, u."firstName", u."lastName", u.department
      ORDER BY total_hours DESC NULLS LAST
    `

    const totalEmployees = (attendanceData as any[]).length
    const employeesWithAttendance = (attendanceData as any[]).filter((emp: any) => Number(emp.check_in_count) > 0).length
    const totalHours = (attendanceData as any[]).reduce((sum: number, emp: any) => sum + (Number(emp.total_hours) || 0), 0)
    const avgHoursPerEmployee = employeesWithAttendance > 0 ? totalHours / employeesWithAttendance : 0

    return {
      summary: {
        totalEmployees,
        employeesWithAttendance,
        attendanceRate: totalEmployees > 0 ? ((employeesWithAttendance / totalEmployees) * 100).toFixed(1) : 0,
        totalHoursWorked: totalHours,
        averageHoursPerEmployee: avgHoursPerEmployee.toFixed(1),
        reportPeriodDays: Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      },
      sections: [
        {
          title: 'Employee Attendance Details',
          data: (attendanceData as any[]).map((emp: any) => ({
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            department: emp.department || 'Unassigned',
            checkInCount: Number(emp.check_in_count) || 0,
            averageHours: Number(emp.avg_hours) || 0,
            totalHours: Number(emp.total_hours) || 0,
            firstCheckIn: emp.first_check_in ? new Date(emp.first_check_in).toLocaleDateString() : 'N/A',
            lastCheckIn: emp.last_check_in ? new Date(emp.last_check_in).toLocaleDateString() : 'N/A'
          }))
        }
      ],
      metadata: {
        generatedAt: new Date(),
        parameters: config,
        recordCount: totalEmployees
      }
    }
  }

  async generateReport(config: ReportConfig): Promise<ReportData> {
    switch (config.category) {
      case 'HR_ANALYTICS':
        return this.generateHRReport(config)
      case 'PROJECT_PERFORMANCE':
        return this.generateProjectReport(config)
      case 'ATTENDANCE':
        return this.generateAttendanceReport(config)
      default:
        throw new Error(`Unsupported report category: ${config.category}`)
    }
  }
}

export const reportGenerator = new ReportGenerator()