import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { UserRole, UserStatus } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ 
        error: "No session found",
        session: null
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: "User not found in database",
        sessionEmail: session.user?.email,
        user: null
      }, { status: 404 });
    }

    // Test key permissions
    const permissions = {
      VIEW_PROJECTS: hasPermission(user.role, 'VIEW_PROJECTS'),
      CREATE_PROJECTS: hasPermission(user.role, 'CREATE_PROJECTS'),
      EDIT_ALL_PROJECTS: hasPermission(user.role, 'EDIT_ALL_PROJECTS'),
      VIEW_TASKS: hasPermission(user.role, 'VIEW_TASKS'),
      VIEW_ALL_TASKS: hasPermission(user.role, 'VIEW_ALL_TASKS'),
      CREATE_TASKS: hasPermission(user.role, 'CREATE_TASKS'),
      MANAGE_USERS: hasPermission(user.role, 'MANAGE_USERS'),
      VIEW_TEAM: hasPermission(user.role, 'VIEW_TEAM'),
    };

    const debug = {
      session: {
        email: session.user?.email,
        name: session.user?.name,
        role: session.user?.role,
      },
      user: user,
      permissions: permissions,
      checks: {
        hasSession: !!session,
        userExists: !!user,
        isActive: user.status === UserStatus.ACTIVE,
        canViewProjects: permissions.VIEW_PROJECTS,
        canViewTasks: permissions.VIEW_TASKS,
      }
    };

    return NextResponse.json(debug);
  } catch (error) {
    console.error("Debug permission error:", error);
    return NextResponse.json({ 
      error: "Debug error", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 