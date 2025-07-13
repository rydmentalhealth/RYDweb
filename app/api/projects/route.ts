import { NextRequest, NextResponse } from "next/server";
import { checkProjectPermissions, hasPermission } from "@/lib/auth/rbac";
import { auth } from "@/lib/auth";
import { UserRole, UserStatus, ProjectStatus, ProjectPriority } from "@/lib/generated/prisma";
import { db } from "@/lib/db";

// GET /api/projects - Get projects with permission filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    console.log("[API Projects] Session:", session?.user?.email, "Role:", session?.user?.role);
    
    if (!session) {
      console.log("[API Projects] No session found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const user = await db.user.findUnique({
      where: { email: session.user?.email || "" },
    });
    console.log("[API Projects] User found:", user?.email, "Role:", user?.role, "Status:", user?.status);

    if (!user) {
      console.log("[API Projects] User not found in database for email:", session.user?.email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user has permission to view projects
    const hasViewPermission = hasPermission(user.role, 'VIEW_PROJECTS');
    console.log("[API Projects] Has VIEW_PROJECTS permission:", hasViewPermission, "for role:", user.role);
    
    if (!hasViewPermission) {
      console.log("[API Projects] User lacks VIEW_PROJECTS permission");
      return NextResponse.json({ 
        message: "Insufficient permissions to view projects" 
      }, { status: 403 });
    }

    // Check if user's status allows access
    const isActive = user.status === UserStatus.ACTIVE;
    console.log("[API Projects] User status check:", user.status, "Is active:", isActive);
    
    if (!isActive) {
      console.log("[API Projects] User status not active:", user.status);
      return NextResponse.json({ 
        message: "Account not active. Please contact an administrator." 
      }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const memberId = searchParams.get("memberId");
    
    // Build the query filters
    const filters: any = {};
    
    if (status) {
      filters.status = status;
    }
    
    // For volunteers and regular staff, limit to projects they're involved in
    // For admins, show all projects
    const canViewAllProjects = hasPermission(user.role, 'EDIT_ALL_PROJECTS');
    console.log("[API Projects] Can view all projects:", canViewAllProjects, "for role:", user.role);
    
    if (!canViewAllProjects) {
      // User can only see projects they own or are members of
      filters.OR = [
        { ownerId: user.id },
        { 
          team: {
            some: {
              userId: user.id
            }
          }
        }
      ];
      console.log("[API Projects] Limited access - applying user filters:", JSON.stringify(filters, null, 2));
    } else {
      console.log("[API Projects] Full access - no user filters applied");
    }
    
    // If specific member filter is requested, add it
    if (memberId && canViewAllProjects) {
      filters.team = {
        some: {
          userId: memberId
        }
      };
      console.log("[API Projects] Member filter applied:", memberId);
    }

    console.log("[API Projects] Final query filters:", JSON.stringify(filters, null, 2));

    // Fetch projects with filters
    const projects = await db.project.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc",
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
                role: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
    
    console.log("[API Projects] Found", projects.length, "projects from database");

    // Filter projects based on individual permissions
    const filteredProjects = projects.filter(project => {
      const projectMemberIds = project.team.map((m: any) => m.user.id);
      const permissions = checkProjectPermissions(
        user.role,
        user.status,
        user.id,
        project.ownerId,
        projectMemberIds
      );
      console.log("[API Projects] Project", project.name, "- Can view:", permissions.canView, "Owner:", project.ownerId, "User:", user.id);
      return permissions.canView;
    });

    console.log("[API Projects] After permission filtering:", filteredProjects.length, "projects");

    // Transform the data to match existing structure with members field
    const transformedProjects = filteredProjects.map(project => ({
      ...project,
      members: project.team.map((pm: any) => pm.user)
    }));

    console.log("[API Projects] Returning", transformedProjects.length, "projects");
    return NextResponse.json(transformedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ message: "Error fetching projects" }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ message: "Project name is required" }, { status: 400 });
    }
    
    // Get the current user to set as creator
    const user = await db.user.findUnique({
      where: { email: session.user?.email || "" },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user has permission to create projects
    if (!hasPermission(user.role, 'CREATE_PROJECTS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to create projects" 
      }, { status: 403 });
    }

    // Check if user's status allows access
    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.json({ 
        message: "Account not active. Please contact an administrator." 
      }, { status: 403 });
    }

    // Prepare member connections
    const memberIds = Array.isArray(data.members) ? data.members : [];
    
    // Validate that all member IDs exist and are active users
    if (memberIds.length > 0) {
      const validMembers = await db.user.findMany({
        where: {
          id: { in: memberIds },
          status: UserStatus.ACTIVE
        },
        select: { id: true }
      });
      
      if (validMembers.length !== memberIds.length) {
        return NextResponse.json({ 
          message: "One or more selected team members are invalid or inactive" 
        }, { status: 400 });
      }
    }
                      
    // Create the project
    const project = await db.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || "PLANNING",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        ownerId: user.id,
        team: {
          create: memberIds.map((id: string) => ({
            userId: id
          }))
        }
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
                role: true,
              },
            },
          },
        },
        owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
        tasks: {
          select: {
            id: true,
            status: true,
            },
          },
        },
      });
      
    // Transform the data to match existing structure with members field
    const transformedProject = {
      ...project,
      members: project.team.map((pm: any) => pm.user)
    };
    
    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ message: "Error creating project" }, { status: 500 });
  }
} 