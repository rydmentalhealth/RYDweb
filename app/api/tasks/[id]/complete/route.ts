import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, checkTaskPermissions } from "@/lib/auth/rbac";
import { UserStatus } from "@prisma/client";
import { validateUserSession } from "@/lib/auth/user-status";

// POST /api/tasks/[id]/complete - Mark task as completed
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    // Validate session and user status
    const validation = validateUserSession(session);
    if (!validation.isValid) {
      return NextResponse.json({ 
        message: validation.reason || "Unauthorized access"
      }, { status: 401 });
    }

    if (!session?.user) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const { id: taskId } = await context.params;

    const user = await prisma.user.findUnique({
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

    // Find the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Check if user has permission to complete this task
    const taskAssigneeIds = task.assignees.map(a => a.user.id);
    const permissions = checkTaskPermissions(
      user.role,
      user.status,
      user.id,
      task.createdById || undefined,
      taskAssigneeIds,
      task.project?.ownerId
    );

    if (!permissions.canEdit) {
      return NextResponse.json({ 
        message: "You do not have permission to complete this task" 
      }, { status: 403 });
    }

    // Update the task status to completed
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log the completion activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        resource: 'task',
        resourceId: taskId,
        details: {
          action: 'completed',
          taskTitle: task.title,
        },
      },
    });

    // Create notifications for other assignees and task creator
    const notificationTargets = [
      ...taskAssigneeIds.filter(id => id !== user.id),
      ...(task.createdById && task.createdById !== user.id ? [task.createdById] : [])
    ];

    if (notificationTargets.length > 0) {
      const notifications = notificationTargets.map(userId => ({
        userId,
        type: 'TASK_ASSIGNED' as const,
        title: 'Task Completed',
        content: `${user.firstName} ${user.lastName} has completed the task "${task.title}"`,
        actionUrl: `/dashboard/tasks?task=${taskId}`,
        data: JSON.stringify({
          taskId,
          taskTitle: task.title,
          completedBy: user.id,
          type: 'TASK_COMPLETION',
        }),
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    }

    // Transform the data to match existing structure
    const transformedTask = {
      ...updatedTask,
      assignees: updatedTask.assignees.map((ta: any) => ta.user),
      teams: updatedTask.teams.map((tt: any) => tt.team)
    };

    return NextResponse.json({ 
      task: transformedTask,
      message: "Task completed successfully!" 
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json({ 
      message: "An error occurred while completing the task" 
    }, { status: 500 });
  }
}