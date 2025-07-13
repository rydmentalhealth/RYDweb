import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

// GET /api/tasks/[taskId]/comments - Get comments for a task
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { taskId } = await context.params;
    
    // Check if the task exists
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    
    // Fetch the comments for the task
    const comments = await prisma.taskComment.findMany({
      where: {
        taskId: taskId,
      },
      include: {
        author: {
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
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ message: "Error fetching comments" }, { status: 500 });
  }
}

// POST /api/tasks/[taskId]/comments - Add a comment to a task
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { taskId } = await context.params;
    const data = await request.json();
    
    // Validate required fields
    if (!data.content) {
      return NextResponse.json({ message: "Comment content is required" }, { status: 400 });
    }
    
    // Check if the task exists
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    
    // Use the current user's ID directly
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }
    
    // Create the comment
    const comment = await prisma.taskComment.create({
      data: {
        content: data.content,
        taskId: taskId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ message: "Error adding comment" }, { status: 500 });
  }
} 