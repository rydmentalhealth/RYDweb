import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, ReportCategory } from '@prisma/client'

// Generate comprehensive reports
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const canGenerateReports = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_OFFICER, UserRole.DIRECTOR].includes(session.user.role)
    if (!canGenerateReports) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      reportType, 
      dateRange, 
      departments = [], 
      includeCharts = true,
      format = 'json' // 'json', 'pdf', 'csv'
    } = body

    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)

    let reportData: any = {}
    let title = ''
    let description = ''

    switch (reportType) {
      case 'HR_ANALYTICS':
        title = 'HR Analytics Report'
        description = `Comprehensive HR metrics from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        
        const [hrUsers, hrAttendance, hrPerformance, hrLeave] = await Promise.all([
          // User statistics
          prisma.user.groupBy({
            by: ['department', 'role', 'status'],
            where: {
              createdAt: { gte: startDate, lte: endDate },
              ...(departments.length > 0 && { department: { in: departments } })
            },
            _count: { id: true }
          }),
          
          // Attendance data
          prisma.checkIn.groupBy({
            by: ['userId'],
            where: {
              checkInTime: { gte: startDate, lte: endDate },
              ...(departments.length > 0 && { user: { department: { in: departments } } })
            },
            _count: { id: true },
            _avg: { workingHours: true }
          }),
          
          // Performance reviews
          prisma.performanceReview.groupBy({
            by: ['rating'],
            where: {
              reviewDate: { gte: startDate, lte: endDate }
            },
            _count: { id: true }
          }),
          
          // Leave requests
          prisma.leaveRequest.groupBy({
            by: ['type', 'status'],
            where: {
              createdAt: { gte: startDate, lte: endDate }
            },
            _count: { id: true }
          })
        ])

        reportData = {
          summary: {
            totalUsers: hrUsers.reduce((sum, item) => sum + item._count.id, 0),
            averageAttendance: hrAttendance.length > 0 
              ? hrAttendance.reduce((sum, item) => sum + (item._avg.workingHours || 0), 0) / hrAttendance.length 
              : 0,
            totalPerformanceReviews: hrPerformance.reduce((sum, item) => sum + item._count.id, 0),
            totalLeaveRequests: hrLeave.reduce((sum, item) => sum + item._count.id, 0)
          },
          usersByDepartment: hrUsers,
          attendanceMetrics: hrAttendance,
          performanceDistribution: hrPerformance,
          leaveAnalysis: hrLeave
        }
        break

      case 'PROJECT_PERFORMANCE':
        title = 'Project Performance Report'
        description = `Project analytics and performance metrics from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        
        const [projects, tasks, milestones] = await Promise.all([
          prisma.project.findMany({
            where: {
              createdAt: { gte: startDate, lte: endDate },
              ...(departments.length > 0 && { department: { in: departments } })
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
          
          prisma.task.groupBy({
            by: ['status', 'priority'],
            where: {
              createdAt: { gte: startDate, lte: endDate }
            },
            _count: { id: true }
          }),
          
          prisma.projectMilestone.groupBy({
            by: ['status'],
            where: {
              createdAt: { gte: startDate, lte: endDate }
            },
            _count: { id: true }
          })
        ])

        reportData = {
          summary: {
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
            completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
            totalTasks: tasks.reduce((sum, item) => sum + item._count.id, 0),
            completedTasks: tasks.filter(t => t.status === 'COMPLETED').reduce((sum, item) => sum + item._count.id, 0)
          },
          projectDetails: projects.map(p => ({
            id: p.id,
            name: p.name,
            status: p.status,
            department: p.department,
            taskCount: p._count.tasks,
            teamSize: p._count.team,
            milestoneCount: p._count.milestones,
            progress: p.status === 'COMPLETED' ? 100 : p.status === 'ACTIVE' ? 50 : 0
          })),
          taskDistribution: tasks,
          milestoneProgress: milestones
        }
        break

      case 'ATTENDANCE':
        title = 'Attendance Report'
        description = `Attendance and work tracking report from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        
        const attendanceData = await prisma.$queryRaw`
          SELECT 
            u.id,
            u."firstName",
            u."lastName",
            u.department,
            COUNT(c.id) as check_in_count,
            AVG(c."workingHours") as avg_hours,
            SUM(c."workingHours") as total_hours
          FROM "User" u
          LEFT JOIN "CheckIn" c ON u.id = c."userId" 
            AND c."checkInTime" >= ${startDate} 
            AND c."checkInTime" <= ${endDate}
          WHERE u.status = 'ACTIVE'
            ${departments.length > 0 ? `AND u.department = ANY(${departments})` : ''}
          GROUP BY u.id, u."firstName", u."lastName", u.department
          ORDER BY total_hours DESC NULLS LAST
        `

        reportData = {
          summary: {
            totalEmployees: (attendanceData as any[]).length,
            averageHoursPerEmployee: (attendanceData as any[]).reduce((sum: number, item: any) => sum + (Number(item.avg_hours) || 0), 0) / (attendanceData as any[]).length,
            totalHoursWorked: (attendanceData as any[]).reduce((sum: number, item: any) => sum + (Number(item.total_hours) || 0), 0)
          },
          employeeAttendance: (attendanceData as any[]).map((item: any) => ({
            userId: item.id,
            name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
            department: item.department,
            checkInCount: Number(item.check_in_count),
            averageHours: Number(item.avg_hours) || 0,
            totalHours: Number(item.total_hours) || 0
          }))
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Save report to database
    const savedReport = await prisma.generatedReport.create({
      data: {
        title,
        description,
        reportData: reportData as any,
        parameters: {
          reportType,
          dateRange,
          departments,
          includeCharts,
          format
        },
        generatedById: session.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })

    // Log the report generation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'EXPORT',
        resource: 'reports',
        resourceId: savedReport.id,
        newValues: {
          reportType,
          dateRange,
          departments
        },
        riskLevel: 'MEDIUM'
      }
    })

    return NextResponse.json({
      reportId: savedReport.id,
      title,
      description,
      data: reportData,
      generatedAt: savedReport.generatedAt,
      expiresAt: savedReport.expiresAt
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

// Get existing reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')

    const reports = await prisma.generatedReport.findMany({
      where: {
        ...(category && { 
          template: {
            category: category as ReportCategory
          }
        }),
        expiresAt: { gt: new Date() } // Only non-expired reports
      },
      include: {
        generatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        template: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: { generatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.generatedReport.count({
      where: {
        expiresAt: { gt: new Date() }
      }
    })

    return NextResponse.json({
      reports: reports.map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        category: report.template?.category,
        generatedBy: report.generatedBy,
        generatedAt: report.generatedAt,
        downloadCount: report.downloadCount,
        isPublic: report.isPublic
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}