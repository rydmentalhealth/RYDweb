import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Helper function to check permissions
function hasEmployeePermission(userRole: UserRole) {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER'].includes(userRole);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.log('[Available Users API] No session or user ID');
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    console.log('[Available Users API] User role:', session.user.role);
    if (!hasEmployeePermission(session.user.role)) {
      return NextResponse.json({ 
        error: `Insufficient permissions - Role ${session.user.role} cannot manage employees` 
      }, { status: 403 });
    }

    // Get active system users who don't have employee profiles
    console.log('[Available Users API] Fetching users...');
    const availableUsers = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        employeeProfile: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        department: true,
        jobTitle: true,
        createdAt: true,
        approvedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`[Available Users API] Found ${availableUsers.length} available users`);

    // Format the response with computed full names
    const formattedUsers = availableUsers.map(user => ({
      ...user,
      fullName: user.name || 
        (user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email?.split('@')[0] || 'Unknown User')
    }));

    console.log(`[Available Users API] Returning ${formattedUsers.length} formatted users`);
    return NextResponse.json({ 
      users: formattedUsers,
      count: formattedUsers.length,
      message: formattedUsers.length === 0 ? 'No active users available to add as employees' : `Found ${formattedUsers.length} available users`
    });

  } catch (error) {
    console.error('[Available Users API] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}