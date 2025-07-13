import { NextRequest, NextResponse } from "next/server";
import { checkTaskPermissions } from "@/lib/auth/rbac";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/tasks/[taskId] - Get a single task by ID
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
    
    // Fetch the task with its related data
    const task = await db.task.findUnique({
      where: {
        id: taskId,
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
        comments: {
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
        },
        attachments: true,
        timeEntries: {
          orderBy: {
            startTime: "desc",
          },
        },
      },
    });
    
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    
    // Transform the response to include the assignees in a more accessible format
    const transformedTask = {
      ...task,
      assignees: task.assignees.map(ta => ta.user)
    };
    
    return NextResponse.json(transformedTask);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ message: "Error fetching task" }, { status: 500 });
  }
}

// PUT /api/tasks/[taskId] - Update a task
export async function PUT(
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
    
    // Get user from database to check permissions
    const user = await db.user.findUnique({
      where: { email: session.user?.email! },
      select: { 
        id: true, 
        role: true, 
        status: true,
        email: true 
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ 
        message: "Your account is not active. Please contact an administrator." 
      }, { status: 403 });
    }

    // Check if the task exists and include related data for permission checks
    const existingTask = await db.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        assignees: true,
        project: {
          include: {
            team: true
          }
        },
        createdBy: true
      }
    });
    
    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Check task edit permissions using RBAC
    const { canEdit } = checkTaskPermissions(
      user.role, 
      user.status, 
      user.id, 
      existingTask.createdById || undefined,
      existingTask.assignees.map(a => a.userId),
      existingTask.project?.ownerId
    );
    
    if (!canEdit) {
      return NextResponse.json({ 
        message: "You do not have permission to edit this task" 
      }, { status: 403 });
    }

    console.log(`[PUT Task] User ${user.email} with role ${user.role} editing task ${taskId}`);
    
    // Prepare the update data
    const updateData: any = {};
    
    // Only include fields that are actually provided and are not empty strings
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    
    // Handle priority - ensure it's a valid enum value or keep existing
    if (data.priority !== undefined) {
      updateData.priority = data.priority === "" ? existingTask.priority : data.priority;
    }
    
    // Handle status - ensure it's a valid enum value or keep existing
    if (data.status !== undefined) {
      updateData.status = data.status === "" ? existingTask.status : data.status;
    }
    
    // Handle projectId - convert "none" to null
    if (data.projectId !== undefined) {
      console.log('ProjectID before conversion:', data.projectId, 'type:', typeof data.projectId);
      
      // If projectId is "none" or empty string, set to null
      if (data.projectId === "none" || data.projectId === "") {
        updateData.projectId = null;
      } 
      // If it's a valid UUID/ID, verify it exists in the database
      else {
        try {
          // Check if project exists before assigning
          const projectExists = await db.project.findUnique({
            where: { id: data.projectId },
            select: { id: true }
          });
          
          if (projectExists) {
            updateData.projectId = data.projectId;
          } else {
            // If project doesn't exist, default to null instead of failing
            console.log(`Project with ID ${data.projectId} does not exist, setting to null`);
            updateData.projectId = null;
          }
        } catch (err) {
          console.error('Error checking project existence:', err);
          // Default to null on error
          updateData.projectId = null;
        }
      }
      
      console.log('ProjectID after conversion:', updateData.projectId, 'type:', typeof updateData.projectId);
    }
    
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    
    // If the status is changing to COMPLETED and completedAt isn't explicitly set, set it to now
    if (data.status === 'COMPLETED' && existingTask.status !== 'COMPLETED' && data.completedAt === undefined) {
      updateData.completedAt = new Date();
    }
    
    // If the status is changing from COMPLETED, and completedAt isn't explicitly set, clear it
    if (data.status !== undefined && data.status !== 'COMPLETED' && existingTask.status === 'COMPLETED' && data.completedAt === undefined) {
      updateData.completedAt = null;
    }
    
    // Handle assignee updates if provided
    let assigneeUpdates = {};
    if (data.assigneeIds) {
      // Convert to array if it's not already
      const assigneeIds = Array.isArray(data.assigneeIds) ? data.assigneeIds : [data.assigneeIds];
      
      // Get current assignee IDs
      const currentAssigneeIds = existingTask.assignees.map(a => a.userId);
      
      // Find IDs to add and remove
      const idsToAdd = assigneeIds.filter((id: string) => !currentAssigneeIds.includes(id));
      const idsToRemove = currentAssigneeIds.filter((id: string) => !assigneeIds.includes(id));
      
      assigneeUpdates = {
        assignees: {
          // Add new assignees
          create: idsToAdd.map((id: string) => ({
            userId: id
          })),
          // Remove assignees that are no longer assigned
          deleteMany: idsToRemove.length > 0 ? {
            userId: {
              in: idsToRemove
            }
          } : undefined
        }
      };
    }
    
    // Update the task
    const updatedTask = await db.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...updateData,
        ...assigneeUpdates
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
    
    // Transform the response to include the assignees in a more accessible format
    const transformedTask = {
      ...updatedTask,
      assignees: updatedTask.assignees.map(ta => ta.user)
    };
    
    return NextResponse.json(transformedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[taskId] - Delete a task
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { taskId } = await context.params;
    
    // Get user from database to check permissions
    const user = await db.user.findUnique({
      where: { email: session.user?.email! },
      select: { 
        id: true, 
        role: true, 
        status: true,
        email: true 
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ 
        message: "Your account is not active. Please contact an administrator." 
      }, { status: 403 });
    }

    // Check if the task exists and include related data for permission checks
    const existingTask = await db.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        assignees: true,
        project: {
          include: {
            team: true
          }
        },
        createdBy: true
      }
    });
    
    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Check task delete permissions using RBAC
    const { canDelete } = checkTaskPermissions(
      user.role, 
      user.status, 
      user.id, 
      existingTask.createdById || undefined,
      existingTask.assignees.map(a => a.userId),
      existingTask.project?.ownerId
    );
    
    if (!canDelete) {
      return NextResponse.json({ 
        message: "You do not have permission to delete this task" 
      }, { status: 403 });
    }

    console.log(`[DELETE Task] User ${user.email} with role ${user.role} deleting task ${taskId}`);
    
    // Delete the task
    await db.task.delete({
      where: {
        id: taskId,
      },
    });
    
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ message: "Error deleting task" }, { status: 500 });
  }
}

// PATCH /api/tasks/[taskId] - Partial update a task
export async function PATCH(
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
    
    // Get user from database to check permissions
    const user = await db.user.findUnique({
      where: { email: session.user?.email! },
      select: { 
        id: true, 
        role: true, 
        status: true,
        email: true 
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ 
        message: "Your account is not active. Please contact an administrator." 
      }, { status: 403 });
    }

    // Check if the task exists and include related data for permission checks
    const existingTask = await db.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        assignees: true,
        project: {
          include: {
            team: true
          }
        },
        createdBy: true
      }
    });
    
    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Check task edit permissions using RBAC
    const { canEdit } = checkTaskPermissions(
      user.role, 
      user.status, 
      user.id, 
      existingTask.createdById || undefined,
      existingTask.assignees.map(a => a.userId),
      existingTask.project?.ownerId
    );
    
    if (!canEdit) {
      return NextResponse.json({ 
        message: "You do not have permission to edit this task" 
      }, { status: 403 });
    }

    console.log(`[PATCH Task] User ${user.email} with role ${user.role} partially updating task ${taskId}`);
    
    // Prepare the update data
    const updateData: any = {};
    
    // Only include fields that are actually provided and are not empty strings
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    
    // Handle priority - ensure it's a valid enum value or keep existing
    if (data.priority !== undefined) {
      updateData.priority = data.priority === "" ? existingTask.priority : data.priority;
    }
    
    // Handle status - ensure it's a valid enum value or keep existing
    if (data.status !== undefined) {
      updateData.status = data.status === "" ? existingTask.status : data.status;
    }
    
    // Handle projectId - convert "none" to null
    if (data.projectId !== undefined) {
      console.log('ProjectID before conversion:', data.projectId, 'type:', typeof data.projectId);
      
      // If projectId is "none" or empty string, set to null
      if (data.projectId === "none" || data.projectId === "") {
        updateData.projectId = null;
      } 
      // If it's a valid UUID/ID, verify it exists in the database
      else {
        try {
          // Check if project exists before assigning
          const projectExists = await db.project.findUnique({
            where: { id: data.projectId },
            select: { id: true }
          });
          
          if (projectExists) {
            updateData.projectId = data.projectId;
          } else {
            // If project doesn't exist, default to null instead of failing
            console.log(`Project with ID ${data.projectId} does not exist, setting to null`);
            updateData.projectId = null;
          }
        } catch (err) {
          console.error('Error checking project existence:', err);
          // Default to null on error
          updateData.projectId = null;
        }
      }
      
      console.log('ProjectID after conversion:', updateData.projectId, 'type:', typeof updateData.projectId);
    }
    
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    
    // If the status is changing to COMPLETED and completedAt isn't explicitly set, set it to now
    if (data.status === 'COMPLETED' && existingTask.status !== 'COMPLETED' && data.completedAt === undefined) {
      updateData.completedAt = new Date();
    }
    
    // If the status is changing from COMPLETED, and completedAt isn't explicitly set, clear it
    if (data.status !== undefined && data.status !== 'COMPLETED' && existingTask.status === 'COMPLETED' && data.completedAt === undefined) {
      updateData.completedAt = null;
    }
    
    // Handle assignee updates if provided
    let assigneeUpdates = {};
    if (data.assigneeIds) {
      // Convert to array if it's not already
      const assigneeIds = Array.isArray(data.assigneeIds) ? data.assigneeIds : [data.assigneeIds];
      
      // Get current assignee IDs
      const currentAssigneeIds = existingTask.assignees.map(a => a.userId);
      
      // Find IDs to add and remove
      const idsToAdd = assigneeIds.filter((id: string) => !currentAssigneeIds.includes(id));
      const idsToRemove = currentAssigneeIds.filter((id: string) => !assigneeIds.includes(id));
      
      assigneeUpdates = {
        assignees: {
          // Add new assignees
          create: idsToAdd.map((id: string) => ({
            userId: id
          })),
          // Remove assignees that are no longer assigned
          deleteMany: idsToRemove.length > 0 ? {
            userId: {
              in: idsToRemove
            }
          } : undefined
        }
      };
    }
    
    // Update the task
    const updatedTask = await db.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...updateData,
        ...assigneeUpdates
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
    
    // Transform the response to include the assignees in a more accessible format
    const transformedTask = {
      ...updatedTask,
      assignees: updatedTask.assignees.map(ta => ta.user)
    };
    
    return NextResponse.json(transformedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
} 