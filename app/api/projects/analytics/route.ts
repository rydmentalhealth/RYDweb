import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/auth/rbac";
import { UserStatus, ProjectStatus, MilestoneStatus } from "@prisma/client";

// GET /api/projects/analytics - Get comprehensive project analytics
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

    // Check if user has permission to view project analytics
    if (!hasPermission(user.role, 'VIEW_PROJECTS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to view project analytics" 
      }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get("department");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filters
    const dateFilters: any = {};
    if (startDate) {
      dateFilters.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilters.lte = new Date(endDate);
    }

    // Build project filters
    const projectFilters: any = {};
    if (department) {
      projectFilters.department = department;
    }
    if (Object.keys(dateFilters).length > 0) {
      projectFilters.createdAt = dateFilters;
    }

    // Get all projects with filters
    const projects = await db.project.findMany({
      where: projectFilters,
      include: {
        team: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
        milestones: {
          select: {
            id: true,
            status: true,
            dueDate: true,
            progress: true,
          },
        },
        progressUpdates: {
          select: {
            id: true,
            progressPercentage: true,
            createdAt: true,
            isApproved: true,
          },
        },
      },
    });

    // Calculate analytics
    const analytics = {
      // Overall project statistics
      totalProjects: projects.length,
      projectsByStatus: {
        PLANNING: projects.filter(p => p.status === ProjectStatus.PLANNING).length,
        ACTIVE: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
        COMPLETED: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
        ON_HOLD: projects.filter(p => p.status === ProjectStatus.ON_HOLD).length,
        CANCELLED: projects.filter(p => p.status === ProjectStatus.CANCELLED).length,
      },
      
      // Department breakdown
      projectsByDepartment: projects.reduce((acc: any, project) => {
        const dept = project.department || 'UNASSIGNED';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}),
      
      // Completion rate
      completionRate: projects.length > 0 
        ? Math.round((projects.filter(p => p.status === ProjectStatus.COMPLETED).length / projects.length) * 100)
        : 0,
      
      // Average project duration (for completed projects)
      averageDuration: (() => {
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
      
      // Milestone statistics
      milestoneStats: (() => {
        const allMilestones = projects.flatMap(p => p.milestones);
        const now = new Date();
        
        return {
          total: allMilestones.length,
          completed: allMilestones.filter(m => m.status === MilestoneStatus.COMPLETED).length,
          overdue: allMilestones.filter(m => 
            m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) < now
          ).length,
          onTrack: allMilestones.filter(m => 
            m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) >= now
          ).length,
        };
      })(),
      
      // Team productivity
      teamProductivity: (() => {
        const teamStats: any = {};
        
        projects.forEach(project => {
          project.team.forEach(member => {
            const userId = member.user.id;
            const userName = `${member.user.firstName} ${member.user.lastName}`;
            
            if (!teamStats[userId]) {
              teamStats[userId] = {
                name: userName,
                department: member.user.department,
                projectsCount: 0,
                completedProjects: 0,
                activeProjects: 0,
              };
            }
            
            teamStats[userId].projectsCount++;
            if (project.status === ProjectStatus.COMPLETED) {
              teamStats[userId].completedProjects++;
            } else if (project.status === ProjectStatus.ACTIVE) {
              teamStats[userId].activeProjects++;
            }
          });
        });
        
        return Object.values(teamStats);
      })(),
      
      // Progress trends (last 30 days)
      progressTrends: (() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentUpdates = projects.flatMap(p => 
          p.progressUpdates.filter(update => 
            new Date(update.createdAt) >= thirtyDaysAgo
          )
        );
        
        // Group by week
        const weeklyProgress: any = {};
        recentUpdates.forEach(update => {
          const week = Math.floor((Date.now() - new Date(update.createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000));
          const weekKey = `Week ${4 - week}`;
          
          if (!weeklyProgress[weekKey]) {
            weeklyProgress[weekKey] = {
              totalUpdates: 0,
              averageProgress: 0,
              approvedUpdates: 0,
            };
          }
          
          weeklyProgress[weekKey].totalUpdates++;
          weeklyProgress[weekKey].averageProgress += update.progressPercentage;
          if (update.isApproved) {
            weeklyProgress[weekKey].approvedUpdates++;
          }
        });
        
        // Calculate averages
        Object.keys(weeklyProgress).forEach(week => {
          const data = weeklyProgress[week];
          data.averageProgress = Math.round(data.averageProgress / data.totalUpdates);
        });
        
        return weeklyProgress;
      })(),
      
      // Delayed projects
      delayedProjects: projects.filter(project => {
        if (!project.endDate || project.status === ProjectStatus.COMPLETED) return false;
        return new Date(project.endDate) < new Date();
      }).map(project => ({
        id: project.id,
        name: project.name,
        department: project.department,
        endDate: project.endDate,
        daysOverdue: Math.ceil((Date.now() - new Date(project.endDate!).getTime()) / (1000 * 60 * 60 * 24)),
      })),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching project analytics:", error);
    return NextResponse.json({ message: "Error fetching analytics" }, { status: 500 });
  }
}