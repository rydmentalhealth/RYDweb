import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/auth/rbac";
import { UserStatus } from "@prisma/client";

// GET /api/projects/[projectId]/progress/[updateId] - Get a specific progress update
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; updateId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId, updateId } = await context.params;
    
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
        message: "Insufficient permissions to view progress updates" 
      }, { status: 403 });
    }

    // Get the progress update
    const progressUpdate = await db.projectProgressUpdate.findFirst({
      where: {
        id: updateId,
        projectId: projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!progressUpdate) {
      return NextResponse.json({ message: "Progress update not found" }, { status: 404 });
    }

    return NextResponse.json(progressUpdate);
  } catch (error) {
    console.error("Error fetching progress update:", error);
    return NextResponse.json({ message: "Error fetching progress update" }, { status: 500 });
  }
}

// PUT /api/projects/[projectId]/progress/[updateId] - Update a progress update
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; updateId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId, updateId } = await context.params;
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

    // Check if progress update exists
    const existingUpdate = await db.projectProgressUpdate.findFirst({
      where: {
        id: updateId,
        projectId: projectId,
      },
    });

    if (!existingUpdate) {
      return NextResponse.json({ message: "Progress update not found" }, { status: 404 });
    }

    // Check permissions - user can only edit their own updates unless they're admin/project lead
    const canEdit = user.id === existingUpdate.userId || 
                   hasPermission(user.role, 'EDIT_ALL_PROGRESS_UPDATES') ||
                   hasPermission(user.role, 'APPROVE_PROGRESS_UPDATES');

    if (!canEdit) {
      return NextResponse.json({ 
        message: "Insufficient permissions to update this progress update" 
      }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.taskActivity !== undefined) updateData.taskActivity = data.taskActivity;
    if (data.progressPercentage !== undefined) updateData.progressPercentage = data.progressPercentage;
    if (data.challenges !== undefined) updateData.challenges = data.challenges;
    if (data.nextPlan !== undefined) updateData.nextPlan = data.nextPlan;
    if (data.attachment !== undefined) updateData.attachment = data.attachment;
    if (data.comments !== undefined) updateData.comments = data.comments;
    
    // Handle approval
    if (data.isApproved !== undefined) {
      updateData.isApproved = data.isApproved;
      if (data.isApproved) {
        updateData.approvedById = user.id;
        updateData.approvedAt = new Date();
      } else {
        updateData.approvedById = null;
        updateData.approvedAt = null;
      }
    }

    // Update the progress update
    const progressUpdate = await db.projectProgressUpdate.update({
      where: {
        id: updateId,
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(progressUpdate);
  } catch (error) {
    console.error("Error updating progress update:", error);
    return NextResponse.json({ message: "Error updating progress update" }, { status: 500 });
  }
}

// DELETE /api/projects/[projectId]/progress/[updateId] - Delete a progress update
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; updateId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId, updateId } = await context.params;
    
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

    // Check if progress update exists
    const existingUpdate = await db.projectProgressUpdate.findFirst({
      where: {
        id: updateId,
        projectId: projectId,
      },
    });

    if (!existingUpdate) {
      return NextResponse.json({ message: "Progress update not found" }, { status: 404 });
    }

    // Check permissions - user can only delete their own updates unless they're admin
    const canDelete = user.id === existingUpdate.userId || 
                     hasPermission(user.role, 'DELETE_ALL_PROGRESS_UPDATES');

    if (!canDelete) {
      return NextResponse.json({ 
        message: "Insufficient permissions to delete this progress update" 
      }, { status: 403 });
    }

    // Delete the progress update
    await db.projectProgressUpdate.delete({
      where: {
        id: updateId,
      },
    });

    return NextResponse.json({ message: "Progress update deleted successfully" });
  } catch (error) {
    console.error("Error deleting progress update:", error);
    return NextResponse.json({ message: "Error deleting progress update" }, { status: 500 });
  }
}