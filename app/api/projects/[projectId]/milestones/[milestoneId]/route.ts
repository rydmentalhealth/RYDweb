import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/auth/rbac";
import { UserStatus } from "@prisma/client";

// GET /api/projects/[projectId]/milestones/[milestoneId] - Get a specific milestone
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; milestoneId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId, milestoneId } = await context.params;
    
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
        message: "Insufficient permissions to view milestones" 
      }, { status: 403 });
    }

    // Get the milestone
    const milestone = await db.projectMilestone.findFirst({
      where: {
        id: milestoneId,
        projectId: projectId,
      },
      include: {
        responsibleUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        subTasks: true,
        attachments: {
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
    });

    if (!milestone) {
      return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Error fetching milestone:", error);
    return NextResponse.json({ message: "Error fetching milestone" }, { status: 500 });
  }
}

// PUT /api/projects/[projectId]/milestones/[milestoneId] - Update a milestone
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; milestoneId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId, milestoneId } = await context.params;
    const data = await request.json();
    
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

    // Check if user has permission to edit projects
    if (!hasPermission(user.role, 'EDIT_PROJECTS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to update milestones" 
      }, { status: 403 });
    }

    // Check if milestone exists
    const existingMilestone = await db.projectMilestone.findFirst({
      where: {
        id: milestoneId,
        projectId: projectId,
      },
    });

    if (!existingMilestone) {
      return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.responsibleUserId !== undefined) updateData.responsibleUserId = data.responsibleUserId;

    // Update the milestone
    const milestone = await db.projectMilestone.update({
      where: {
        id: milestoneId,
      },
      data: updateData,
      include: {
        responsibleUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        subTasks: true,
        attachments: {
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
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json({ message: "Error updating milestone" }, { status: 500 });
  }
}

// DELETE /api/projects/[projectId]/milestones/[milestoneId] - Delete a milestone
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; milestoneId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId, milestoneId } = await context.params;
    
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

    // Check if user has permission to delete projects
    if (!hasPermission(user.role, 'DELETE_PROJECTS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to delete milestones" 
      }, { status: 403 });
    }

    // Check if milestone exists
    const existingMilestone = await db.projectMilestone.findFirst({
      where: {
        id: milestoneId,
        projectId: projectId,
      },
    });

    if (!existingMilestone) {
      return NextResponse.json({ message: "Milestone not found" }, { status: 404 });
    }

    // Delete the milestone
    await db.projectMilestone.delete({
      where: {
        id: milestoneId,
      },
    });

    return NextResponse.json({ message: "Milestone deleted successfully" });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json({ message: "Error deleting milestone" }, { status: 500 });
  }
}