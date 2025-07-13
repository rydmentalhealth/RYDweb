import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { UserStatus } from "@/lib/generated/prisma";
import { validateUserSession } from "@/lib/auth/user-status";
import { z } from "zod";

const assignTeamSchema = z.object({
  teamId: z.string().min(1, "Team ID is required")
});

// POST /api/tasks/[taskId]/teams - Assign a team to a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
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

    // Check permissions
    if (!hasPermission(user.role, 'CREATE_TASKS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to assign teams to tasks" 
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { teamId } = assignTeamSchema.parse(body);

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Verify team exists and is active
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    if (!team.isActive) {
      return NextResponse.json({ message: "Team is not active" }, { status: 400 });
    }

    // Check if team is already assigned
    const existingAssignment = await prisma.taskTeam.findUnique({
      where: {
        taskId_teamId: {
          taskId,
          teamId
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json({ message: "Team is already assigned to this task" }, { status: 400 });
    }

    // Create the assignment
    const assignment = await prisma.taskTeam.create({
      data: {
        taskId,
        teamId
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error assigning team to task:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: "Invalid request data", 
        errors: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ message: "Error assigning team to task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[taskId]/teams?teamId=[teamId] - Remove a team from a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
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

    // Check permissions
    if (!hasPermission(user.role, 'CREATE_TASKS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to remove teams from tasks" 
      }, { status: 403 });
    }

    // Get teamId from URL query params
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ message: "Team ID is required" }, { status: 400 });
    }

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Check if assignment exists
    const existingAssignment = await prisma.taskTeam.findUnique({
      where: {
        taskId_teamId: {
          taskId,
          teamId
        }
      }
    });

    if (!existingAssignment) {
      return NextResponse.json({ message: "Team is not assigned to this task" }, { status: 404 });
    }

    // Remove the assignment
    await prisma.taskTeam.delete({
      where: {
        taskId_teamId: {
          taskId,
          teamId
        }
      }
    });

    return NextResponse.json({ message: "Team removed from task successfully" });
  } catch (error) {
    console.error("Error removing team from task:", error);
    return NextResponse.json({ message: "Error removing team from task" }, { status: 500 });
  }
} 