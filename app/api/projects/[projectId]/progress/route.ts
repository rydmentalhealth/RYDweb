import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/auth/rbac";
import { UserStatus } from "@prisma/client";

// GET /api/projects/[projectId]/progress - Get project progress updates
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
        message: "Insufficient permissions to view progress updates" 
      }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const isApproved = searchParams.get("isApproved");

    // Build filters
    const filters: any = {
      projectId: projectId,
    };

    if (userId) {
      filters.userId = userId;
    }

    if (isApproved !== null) {
      filters.isApproved = isApproved === "true";
    }

    // Get progress updates
    const progressUpdates = await db.projectProgressUpdate.findMany({
      where: filters,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(progressUpdates);
  } catch (error) {
    console.error("Error fetching progress updates:", error);
    return NextResponse.json({ message: "Error fetching progress updates" }, { status: 500 });
  }
}

// POST /api/projects/[projectId]/progress - Create a new progress update
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

    // Check if user has permission to create progress updates
    if (!hasPermission(user.role, 'CREATE_PROGRESS_UPDATES')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to create progress updates" 
      }, { status: 403 });
    }

    // Validate required fields
    if (!data.taskActivity) {
      return NextResponse.json({ message: "Task/Activity is required" }, { status: 400 });
    }

    if (data.progressPercentage === undefined || data.progressPercentage < 0 || data.progressPercentage > 100) {
      return NextResponse.json({ message: "Valid progress percentage is required" }, { status: 400 });
    }

    // Check if user already submitted an update today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingUpdate = await db.projectProgressUpdate.findFirst({
      where: {
        projectId: projectId,
        userId: user.id,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingUpdate) {
      return NextResponse.json({ 
        message: "You have already submitted a progress update for today" 
      }, { status: 400 });
    }

    // Create the progress update
    const progressUpdate = await db.projectProgressUpdate.create({
      data: {
        projectId: projectId,
        userId: user.id,
        taskActivity: data.taskActivity,
        progressPercentage: data.progressPercentage,
        challenges: data.challenges,
        nextPlan: data.nextPlan,
        attachment: data.attachment,
        isApproved: false, // Default to pending approval
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
      },
    });

    return NextResponse.json(progressUpdate);
  } catch (error) {
    console.error("Error creating progress update:", error);
    return NextResponse.json({ message: "Error creating progress update" }, { status: 500 });
  }
}