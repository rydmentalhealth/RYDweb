import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/auth/rbac";
import { UserStatus, MilestoneStatus } from "@prisma/client";

// GET /api/projects/notifications - Get project notifications and alerts
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

    // Check if user has permission to view projects
    if (!hasPermission(user.role, 'VIEW_PROJECTS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to view notifications" 
      }, { status: 403 });
    }

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));

    // Get overdue milestones (past due by more than 48 hours)
    const overdueMilestones = await db.projectMilestone.findMany({
      where: {
        status: {
          not: MilestoneStatus.COMPLETED,
        },
        dueDate: {
          lt: twoDaysAgo,
        },
        project: {
          OR: [
            { ownerId: user.id },
            { projectLeadId: user.id },
            { 
              team: {
                some: {
                  userId: user.id
                }
              }
            }
          ]
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
        responsibleUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get projects with no recent progress updates (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const projectsWithoutUpdates = await db.project.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { ownerId: user.id },
          { projectLeadId: user.id },
          { 
            team: {
              some: {
                userId: user.id
              }
            }
          }
        ],
        progressUpdates: {
          none: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        department: true,
        startDate: true,
      },
    });

    // Get pending progress updates (for project leads and admins)
    const pendingUpdates = await db.projectProgressUpdate.findMany({
      where: {
        isApproved: false,
        project: {
          OR: [
            { ownerId: user.id },
            { projectLeadId: user.id },
          ]
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
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
      take: 20,
    });

    // Get upcoming milestone deadlines (next 7 days)
    const nextWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    const upcomingMilestones = await db.projectMilestone.findMany({
      where: {
        status: {
          not: MilestoneStatus.COMPLETED,
        },
        dueDate: {
          gte: now,
          lte: nextWeek,
        },
        project: {
          OR: [
            { ownerId: user.id },
            { projectLeadId: user.id },
            { 
              team: {
                some: {
                  userId: user.id
                }
              }
            }
          ]
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        responsibleUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Format notifications
    const notifications = {
      overdueMilestones: overdueMilestones.map(milestone => ({
        id: milestone.id,
        type: 'OVERDUE_MILESTONE',
        title: `Overdue Milestone: ${milestone.title}`,
        message: `Milestone "${milestone.title}" in project "${milestone.project.name}" is ${Math.ceil((now.getTime() - new Date(milestone.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue`,
        projectId: milestone.project.id,
        projectName: milestone.project.name,
        department: milestone.project.department,
        dueDate: milestone.dueDate,
        responsibleUser: milestone.responsibleUser,
        priority: 'HIGH',
        createdAt: milestone.dueDate,
      })),
      
      projectsWithoutUpdates: projectsWithoutUpdates.map(project => ({
        id: project.id,
        type: 'NO_RECENT_UPDATES',
        title: `No Recent Updates: ${project.name}`,
        message: `Project "${project.name}" has not received any progress updates in the last 7 days`,
        projectId: project.id,
        projectName: project.name,
        department: project.department,
        priority: 'MEDIUM',
        createdAt: sevenDaysAgo,
      })),
      
      pendingUpdates: pendingUpdates.map(update => ({
        id: update.id,
        type: 'PENDING_APPROVAL',
        title: `Progress Update Pending Approval`,
        message: `${update.user.firstName} ${update.user.lastName} submitted a progress update for "${update.project.name}" awaiting your approval`,
        projectId: update.project.id,
        projectName: update.project.name,
        userId: update.user.id,
        userName: `${update.user.firstName} ${update.user.lastName}`,
        priority: 'MEDIUM',
        createdAt: update.createdAt,
      })),
      
      upcomingMilestones: upcomingMilestones.map(milestone => ({
        id: milestone.id,
        type: 'UPCOMING_MILESTONE',
        title: `Upcoming Milestone: ${milestone.title}`,
        message: `Milestone "${milestone.title}" in project "${milestone.project.name}" is due in ${Math.ceil((new Date(milestone.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`,
        projectId: milestone.project.id,
        projectName: milestone.project.name,
        dueDate: milestone.dueDate,
        responsibleUser: milestone.responsibleUser,
        priority: 'LOW',
        createdAt: milestone.dueDate,
      })),
    };

    // Combine all notifications and sort by priority and date
    const allNotifications = [
      ...notifications.overdueMilestones,
      ...notifications.projectsWithoutUpdates,
      ...notifications.pendingUpdates,
      ...notifications.upcomingMilestones,
    ].sort((a, b) => {
      // Sort by priority first (HIGH > MEDIUM > LOW)
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by date (most recent first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      notifications: allNotifications,
      summary: {
        total: allNotifications.length,
        high: notifications.overdueMilestones.length,
        medium: notifications.projectsWithoutUpdates.length + notifications.pendingUpdates.length,
        low: notifications.upcomingMilestones.length,
      },
    });
  } catch (error) {
    console.error("Error fetching project notifications:", error);
    return NextResponse.json({ message: "Error fetching notifications" }, { status: 500 });
  }
}

// POST /api/projects/notifications - Send notification reminders
export async function POST(request: NextRequest) {
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

    // Only admins and project leads can send notifications
    if (!hasPermission(user.role, 'EDIT_PROJECTS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to send notifications" 
      }, { status: 403 });
    }

    const { type, projectId, recipientIds, message } = await request.json();

    // Validate required fields
    if (!type || !projectId) {
      return NextResponse.json({ 
        message: "Type and project ID are required" 
      }, { status: 400 });
    }

    // Here you would integrate with your email service
    // For now, we'll just log the notification
    console.log("Sending notification:", {
      type,
      projectId,
      recipientIds,
      message,
      sentBy: user.id,
    });

    // In a real implementation, you would:
    // 1. Send emails to recipients
    // 2. Create in-app notifications
    // 3. Log the notification activity

    return NextResponse.json({ 
      message: "Notifications sent successfully",
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return NextResponse.json({ message: "Error sending notifications" }, { status: 500 });
  }
}