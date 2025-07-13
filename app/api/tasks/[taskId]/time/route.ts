import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

// GET /api/tasks/[taskId]/time - Get time entries for a task
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
    
    // Fetch the time entries for the task
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        taskId: taskId,
      },
      orderBy: {
        startTime: "desc",
      },
    });
    
    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json({ message: "Error fetching time entries" }, { status: 500 });
  }
}

// POST /api/tasks/[taskId]/time - Add a time entry to a task
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
    if (!data.startTime) {
      return NextResponse.json({ message: "Start time is required" }, { status: 400 });
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
    
    // Prepare the data for creating the time entry
    const createData: any = {
      taskId: taskId,
      startTime: new Date(data.startTime),
      description: data.description,
    };
    
    // Add end time and calculate duration if provided
    if (data.endTime) {
      createData.endTime = new Date(data.endTime);
      
      // Calculate duration in minutes if not explicitly provided
      if (!data.duration) {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        createData.duration = durationMinutes;
      } else {
        createData.duration = data.duration;
      }
    }
    
    // Create the time entry
    const timeEntry = await prisma.timeEntry.create({
      data: createData,
    });
    
    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error("Error adding time entry:", error);
    return NextResponse.json({ message: "Error adding time entry" }, { status: 500 });
  }
} 