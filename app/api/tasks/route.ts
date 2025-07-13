import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasPermission, checkTaskPermissions, checkProjectPermissions } from "@/lib/auth/rbac";
import { UserRole, UserStatus } from "@/lib/generated/prisma";
import { validateUserSession } from "@/lib/auth/user-status";

// GET /api/tasks - Get tasks with permission filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    console.log("[API Tasks] Session:", session?.user?.email, "Role:", session?.user?.role);
    
    // Validate session and user status
    const validation = validateUserSession(session);
    if (!validation.isValid) {
      console.log("[API Tasks] Invalid session:", validation.reason);
      return NextResponse.json({ 
        message: validation.reason || "Unauthorized access"
      }, { status: 401 });
    }

    // TypeScript: session is guaranteed to be valid after validation
    if (!session?.user) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
    });
    console.log("[API Tasks] User found:", user?.email, "Role:", user?.role, "Status:", user?.status);

    if (!user) {
      console.log("[API Tasks] User not found in database for email:", session.user?.email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Double-check user status from database
    if (user.status !== UserStatus.ACTIVE) {
      console.log("[API Tasks] User not active:", user.status);
      if (user.status === UserStatus.PENDING) {
        return NextResponse.json({ 
          message: "Your account is pending approval. You currently have no assigned tasks. Please wait for admin approval to access the full task management system.",
          isPending: true
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        message: "Account not active. Please contact an administrator." 
      }, { status: 403 });
    }

    // Check if user has permission to view tasks
    const hasViewPermission = hasPermission(user.role, 'VIEW_TASKS');
    
    if (!hasViewPermission) {
      console.log("[API Tasks] User lacks VIEW_TASKS permission");
      return NextResponse.json({ 
        message: "Insufficient permissions to view tasks" 
      }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const assigneeId = searchParams.get("assigneeId");
    const teamId = searchParams.get("teamId");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    
    // Build the query filters
    const filters: any = {};
    
    if (assigneeId) {
      filters.assignees = {
        some: {
          userId: assigneeId
        }
      };
    }
    
    if (teamId) {
      filters.teams = {
        some: {
          teamId: teamId
        }
      };
    }
    
    if (projectId) {
      filters.projectId = projectId;
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (priority) {
      filters.priority = priority;
    }

    // For volunteers and regular users, limit to tasks they're involved in
    // For admins and staff, show all tasks or apply additional filtering
    const canViewAllTasks = hasPermission(user.role, 'VIEW_ALL_TASKS');
    
    if (!canViewAllTasks) {
      // User can only see tasks they created, are assigned to, or are part of assigned teams
      const userTaskFilters = {
        OR: [
          { createdById: user.id },
          { 
            assignees: {
              some: {
                userId: user.id
              }
            }
          },
          {
            teams: {
              some: {
                team: {
                  members: {
                    some: {
                      userId: user.id
                    }
                  }
                }
              }
            }
          }
        ]
      };
      
      // Combine with existing filters
      if (Object.keys(filters).length > 0) {
        filters.AND = [userTaskFilters, { ...filters }];
        // Remove the filters we just moved to AND
        delete filters.assignees;
        delete filters.teams;
        delete filters.projectId;
        delete filters.status;
        delete filters.priority;
      } else {
        Object.assign(filters, userTaskFilters);
      }
    }
    
    // Fetch tasks with filters
    const tasks = await prisma.task.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc",
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
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
                members: {
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
            ownerId: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
        attachments: {
          select: {
            id: true,
          },
        },
      },
    });

    // Filter tasks based on individual permissions
    const filteredTasks = tasks.filter(task => {
      const taskAssigneeIds = task.assignees.map(a => a.user.id);
      const permissions = checkTaskPermissions(
        user.role,
        user.status,
        user.id,
        task.createdById || undefined,
        taskAssigneeIds,
        task.project?.ownerId
      );
      return permissions.canView;
    });
    
    // Transform the data to match existing structure with both assignees and teams
    const transformedTasks = filteredTasks.map(task => ({
      ...task,
      assignees: task.assignees.map(ta => ta.user),
      teams: task.teams.map(tt => tt.team)
    }));
    
    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: "Error fetching tasks" }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    console.log("[API Tasks POST] Starting task creation");
    
    const session = await auth();
    
    // Validate session and user status
    const validation = validateUserSession(session);
    if (!validation.isValid) {
      console.log("[API Tasks POST] Invalid session:", validation.reason);
      return NextResponse.json({ 
        message: validation.reason || "You must be signed in to create tasks"
      }, { status: 401 });
    }
    
    // TypeScript: session is guaranteed to be valid after validation
    if (!session?.user) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }
    
    const data = await request.json();
    console.log("[API Tasks POST] Request data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ message: "Task title is required" }, { status: 400 });
    }
    
    // Get the current user to set as creator
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
      select: {
        id: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ message: "User account not found" }, { status: 404 });
    }
    
    console.log("[API Tasks POST] User found:", user);

    // Double-check user status from database
    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.json({ 
        message: "Your account is not active. Please contact an administrator." 
      }, { status: 403 });
    }

    // Check if user has permission to create tasks
    if (!hasPermission(user.role, 'CREATE_TASKS')) {
      return NextResponse.json({ 
        message: "You do not have permission to create tasks" 
      }, { status: 403 });
    }

    // Prepare assignee connections
    const assigneeIds = Array.isArray(data.assigneeIds) ? data.assigneeIds : [];
    const teamIds = Array.isArray(data.teamIds) ? data.teamIds : [];
    console.log("[API Tasks POST] Assignee IDs:", assigneeIds);
    console.log("[API Tasks POST] Team IDs:", teamIds);
    
    // Validate that all assignee IDs exist and are active users
    if (assigneeIds.length > 0) {
      const validAssignees = await prisma.user.findMany({
        where: {
          id: { in: assigneeIds },
          status: UserStatus.ACTIVE
        },
        select: { 
          id: true, 
          firstName: true, 
          lastName: true,
          status: true 
        }
      });
      
      console.log("[API Tasks POST] Valid assignees found:", validAssignees.length, "out of", assigneeIds.length);
      
      if (validAssignees.length !== assigneeIds.length) {
        const invalidIds = assigneeIds.filter((id: string) => !validAssignees.find(a => a.id === id));
        console.log("[API Tasks POST] Invalid assignee IDs:", invalidIds);
        
        // Get details about invalid assignees for better error message
        const allRequestedUsers = await prisma.user.findMany({
          where: {
            id: { in: assigneeIds }
          },
          select: { 
            id: true, 
            firstName: true, 
            lastName: true,
            status: true 
          }
        });
        
        const inactiveUsers = allRequestedUsers.filter(user => user.status !== UserStatus.ACTIVE);
        
        if (inactiveUsers.length > 0) {
          const inactiveNames = inactiveUsers.map(u => `${u.firstName} ${u.lastName} (${u.status.toLowerCase()})`).join(', ');
          return NextResponse.json({ 
            message: `Cannot assign task to inactive users: ${inactiveNames}` 
          }, { status: 400 });
        } else {
          return NextResponse.json({ 
            message: "One or more selected assignees are invalid, inactive, or suspended" 
          }, { status: 400 });
        }
      }
    }

    // Validate that all team IDs exist and are active teams
    if (teamIds.length > 0) {
      const validTeams = await prisma.team.findMany({
        where: {
          id: { in: teamIds },
          isActive: true
        },
        select: { 
          id: true, 
          name: true,
          isActive: true 
        }
      });
      
      console.log("[API Tasks POST] Valid teams found:", validTeams.length, "out of", teamIds.length);
      
      if (validTeams.length !== teamIds.length) {
        const invalidIds = teamIds.filter((id: string) => !validTeams.find(t => t.id === id));
        console.log("[API Tasks POST] Invalid team IDs:", invalidIds);
        
        return NextResponse.json({ 
          message: "One or more selected teams are invalid or inactive" 
        }, { status: 400 });
      }
    }

    // If project is specified, validate it exists and user has access
    let projectData = null;
    if (data.projectId) {
      projectData = await prisma.project.findUnique({
        where: { id: data.projectId },
        include: {
          team: {
            select: {
              userId: true
            }
          }
        }
      });
      
      if (!projectData) {
        return NextResponse.json({ 
          message: "Selected project not found" 
        }, { status: 400 });
        }
      
      // Check if user has permission to create tasks in this project
      const projectMemberIds = projectData.team.map((t: any) => t.userId);
      const projectPermissions = checkProjectPermissions(
        user.role,
        user.status,
        user.id,
        projectData.ownerId,
        projectMemberIds
      );
      
      if (!projectPermissions.canEdit && !hasPermission(user.role, 'EDIT_ALL_PROJECTS')) {
        return NextResponse.json({ 
          message: "You do not have permission to create tasks in this project" 
        }, { status: 403 });
      }
    }
                      
    // Create the task
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || "MEDIUM",
        status: data.status || "NOT_STARTED",
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location,
        projectId: data.projectId || null,
        createdById: user.id,
        assignees: {
          create: assigneeIds.map((id: string) => ({
            userId: id
          }))
        },
        teams: {
          create: teamIds.map((id: string) => ({
            teamId: id
          }))
        }
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
                role: true,
              },
            },
          },
        },
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
                members: {
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
    
    console.log("[API Tasks POST] Task created successfully:", task.id);

    // Transform the data to match existing structure
    const transformedTask = {
      ...task,
      assignees: task.assignees.map((ta: any) => ta.user),
      teams: task.teams.map((tt: any) => tt.team)
    };
    
    return NextResponse.json(transformedTask);
  } catch (error) {
    console.error("[API Tasks POST] Error creating task:", error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json({ 
          message: "One or more selected assignees or project is invalid" 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      message: "An error occurred while creating the task. Please try again." 
    }, { status: 500 });
  }
} 