import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/projects/[projectId] - Get a single project
export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId } = await context.params;
    
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        team: {
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
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Error fetching project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId] - Update a project
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId } = await context.params;
    const body = await request.json();
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    
    if (!existingProject) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    
    // Process dates
    const updateData: any = {
      name: body.name,
      description: body.description,
      status: body.status,
    };
    
    if (body.startDate) {
      updateData.startDate = new Date(body.startDate);
    }
    
    if (body.endDate) {
      updateData.endDate = new Date(body.endDate);
    } else if (body.endDate === null) {
      updateData.endDate = null;
    }
    
    // First update the basic project data
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: updateData
    });
    
    // Handle team members if provided
    if (body.members !== undefined) {
      // Get current member IDs
      const currentMembers = await prisma.projectMember.findMany({
        where: { projectId },
        select: { userId: true }
      });
      
      const currentMemberIds = currentMembers.map(m => m.userId);
      
      // Find IDs to add and remove
      const idsToAdd = body.members.filter((id: string) => 
        !currentMemberIds.includes(id)
      );
      
      const idsToRemove = currentMemberIds.filter(id => 
        !body.members.includes(id)
      );
      
      // Remove members that are no longer assigned
      if (idsToRemove.length > 0) {
        await prisma.projectMember.deleteMany({
          where: {
            projectId,
            userId: {
              in: idsToRemove
            }
          }
        });
      }
      
      // Add new members
      if (idsToAdd.length > 0) {
        await prisma.projectMember.createMany({
          data: idsToAdd.map((id: string) => ({
            projectId,
            userId: id,
            role: "MEMBER"
          })),
          skipDuplicates: true
        });
      }
    }
    
    // Return the updated project with all relations
    const finalProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        team: {
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
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });
    
    return NextResponse.json(finalProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Error updating project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId] - Delete a project
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId } = await context.params;
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    
    if (!existingProject) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    
    // Delete project
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
    
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    
    // If error is due to foreign key constraint from tasks
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2003') {
      return NextResponse.json(
        { message: "Cannot delete project with associated tasks. Remove all tasks first." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Error deleting project" },
      { status: 500 }
    );
  }
} 