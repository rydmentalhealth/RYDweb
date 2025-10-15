import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/auth/rbac";
import { UserStatus } from "@prisma/client";

// GET /api/projects/[projectId]/milestones - Get project milestones
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId } = await context.params;
    
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
        message: "Insufficient permissions to view project milestones" 
      }, { status: 403 });
    }

    // Get project milestones
    const milestones = await db.projectMilestone.findMany({
      where: {
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
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Error fetching project milestones:", error);
    return NextResponse.json({ message: "Error fetching milestones" }, { status: 500 });
  }
}

// POST /api/projects/[projectId]/milestones - Create a new milestone
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId } = await context.params;
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
        message: "Insufficient permissions to create milestones" 
      }, { status: 403 });
    }

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    if (!data.dueDate) {
      return NextResponse.json({ message: "Due date is required" }, { status: 400 });
    }

    // Create the milestone
    const milestone = await db.projectMilestone.create({
      data: {
        projectId: projectId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        progress: data.progress || 0,
        status: data.status || "PLANNED",
        responsibleUserId: data.responsibleUserId,
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
        attachments: true,
      },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json({ message: "Error creating milestone" }, { status: 500 });
  }
}