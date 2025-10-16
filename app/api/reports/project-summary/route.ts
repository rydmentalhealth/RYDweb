import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/auth/rbac";
import { UserStatus, ProjectStatus, MilestoneStatus } from "@prisma/client";

// GET /api/reports/project-summary - Generate comprehensive project reports
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const user = await db.user.findUnique({
      where: { email: session.user?.email || "" },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.json({ 
        message: "Account not active. Please contact an administrator." 
      }, { status: 403 });
    }

    // Check if user has permission to view reports
    if (!hasPermission(user.role, 'VIEW_REPORTS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to view reports" 
      }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get("department");
    const projectId = searchParams.get("projectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("type") || "summary";

    // Build filters
    const projectFilters: any = {};
    if (department) projectFilters.department = department;
    if (projectId) projectFilters.id = projectId;
    
    const dateFilters: any = {};
    if (startDate) dateFilters.gte = new Date(startDate);
    if (endDate) dateFilters.lte = new Date(endDate);
    if (Object.keys(dateFilters).length > 0) {
      projectFilters.createdAt = dateFilters;
    }

    // Fetch projects with comprehensive data
    const projects = await db.project.findMany({
      where: projectFilters,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        projectLead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                department: true,
                role: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            completedAt: true,
          },
        },
        milestones: {
          include: {
            responsibleUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            subTasks: true,
          },
        },
        progressUpdates: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            approvedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        resources: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Generate report based on type
    let report: any = {};

    if (reportType === "summary" || reportType === "all") {
      report.summary = {
        reportGenerated: new Date().toISOString(),
        reportPeriod: {
          startDate: startDate || "All time",
          endDate: endDate || "Present",
        },
        filters: {
          department,
          projectId,
        },
        totalProjects: projects.length,
        
        // Project status breakdown
        statusBreakdown: {
          planning: projects.filter(p => p.status === ProjectStatus.PLANNING).length,
          active: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
          completed: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
          onHold: projects.filter(p => p.status === ProjectStatus.ON_HOLD).length,
          cancelled: projects.filter(p => p.status === ProjectStatus.CANCELLED).length,
        },
        
        // Department breakdown
        departmentBreakdown: projects.reduce((acc: any, project) => {
          const dept = project.department || 'UNASSIGNED';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {}),
        
        // Performance metrics
        performanceMetrics: {
          completionRate: projects.length > 0 
            ? Math.round((projects.filter(p => p.status === ProjectStatus.COMPLETED).length / projects.length) * 100)
            : 0,
          
          averageProjectDuration: (() => {
            const completedProjects = projects.filter(p => 
              p.status === ProjectStatus.COMPLETED && p.startDate && p.endDate
            );
            if (completedProjects.length === 0) return 0;
            
            const totalDays = completedProjects.reduce((sum, project) => {
              const start = new Date(project.startDate!);
              const end = new Date(project.endDate!);
              return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            }, 0);
            
            return Math.round(totalDays / completedProjects.length);
          })(),
          
          onTimeDeliveryRate: (() => {
            const completedProjects = projects.filter(p => 
              p.status === ProjectStatus.COMPLETED && p.endDate
            );
            if (completedProjects.length === 0) return 0;
            
            const onTimeProjects = completedProjects.filter(project => {
              if (!project.endDate) return false;
              const endDate = new Date(project.endDate);
              const updatedAt = new Date(project.updatedAt);
              return updatedAt <= endDate;
            });
            
            return Math.round((onTimeProjects.length / completedProjects.length) * 100);
          })(),
        },
      };
    }

    if (reportType === "detailed" || reportType === "all") {
      report.detailedProjects = projects.map(project => {
        const milestoneStats = {
          total: project.milestones.length,
          completed: project.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length,
          overdue: project.milestones.filter(m => 
            m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) < new Date()
          ).length,
        };

        const taskStats = {
          total: project.tasks.length,
          completed: project.tasks.filter(t => t.status === 'COMPLETED').length,
          inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
          notStarted: project.tasks.filter(t => t.status === 'NOT_STARTED').length,
        };

        const progressStats = {
          totalUpdates: project.progressUpdates.length,
          approvedUpdates: project.progressUpdates.filter(u => u.isApproved).length,
          pendingApproval: project.progressUpdates.filter(u => !u.isApproved).length,
          lastUpdate: project.progressUpdates.length > 0 
            ? project.progressUpdates[0].createdAt 
            : null,
        };

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          department: project.department,
          startDate: project.startDate,
          endDate: project.endDate,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          
          owner: project.owner,
          projectLead: project.projectLead,
          teamSize: project.team.length,
          
          milestoneStats,
          taskStats,
          progressStats,
          
          // Calculate overall progress
          overallProgress: (() => {
            if (project.tasks.length === 0) return 0;
            return Math.round((taskStats.completed / taskStats.total) * 100);
          })(),
          
          // Days since last update
          daysSinceLastUpdate: project.progressUpdates.length > 0
            ? Math.ceil((Date.now() - new Date(project.progressUpdates[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : null,
          
          // Project health score (0-100)
          healthScore: (() => {
            let score = 100;
            
            // Deduct points for overdue milestones
            if (milestoneStats.overdue > 0) {
              score -= (milestoneStats.overdue * 20);
            }
            
            // Deduct points for no recent updates (if active)
            if (project.status === ProjectStatus.ACTIVE) {
              const daysSinceUpdate = project.progressUpdates.length > 0
                ? Math.ceil((Date.now() - new Date(project.progressUpdates[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
                : 999;
              
              if (daysSinceUpdate > 7) score -= 30;
              else if (daysSinceUpdate > 3) score -= 15;
            }
            
            // Deduct points for low task completion
            const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 100;
            if (completionRate < 50) score -= 20;
            else if (completionRate < 75) score -= 10;
            
            return Math.max(0, score);
          })(),
        };
      });
    }

    if (reportType === "milestones" || reportType === "all") {
      const allMilestones = projects.flatMap(project => 
        project.milestones.map(milestone => ({
          ...milestone,
          projectName: project.name,
          projectDepartment: project.department,
          projectStatus: project.status,
        }))
      );

      report.milestoneReport = {
        totalMilestones: allMilestones.length,
        completedMilestones: allMilestones.filter(m => m.status === MilestoneStatus.COMPLETED).length,
        overdueMilestones: allMilestones.filter(m => 
          m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) < new Date()
        ).length,
        upcomingMilestones: allMilestones.filter(m => {
          const dueDate = new Date(m.dueDate);
          const now = new Date();
          const nextWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
          return m.status !== MilestoneStatus.COMPLETED && dueDate >= now && dueDate <= nextWeek;
        }).length,
        
        milestonesByStatus: {
          planned: allMilestones.filter(m => m.status === MilestoneStatus.PLANNED).length,
          inProgress: allMilestones.filter(m => m.status === MilestoneStatus.IN_PROGRESS).length,
          completed: allMilestones.filter(m => m.status === MilestoneStatus.COMPLETED).length,
          delayed: allMilestones.filter(m => m.status === MilestoneStatus.DELAYED).length,
          overdue: allMilestones.filter(m => m.status === MilestoneStatus.OVERDUE).length,
        },
        
        milestones: allMilestones.map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          progress: milestone.progress,
          dueDate: milestone.dueDate,
          projectName: milestone.projectName,
          projectDepartment: milestone.projectDepartment,
          responsibleUser: milestone.responsibleUser,
          subTasksCount: milestone.subTasks.length,
          completedSubTasks: milestone.subTasks.filter(st => st.isCompleted).length,
        })),
      };
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating project report:", error);
    return NextResponse.json({ message: "Error generating report" }, { status: 500 });
  }
}