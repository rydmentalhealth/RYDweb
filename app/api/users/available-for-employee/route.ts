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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasEmployeePermission(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get active system users who don't have employee profiles
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

    // Format the response with computed full names
    const formattedUsers = availableUsers.map(user => ({
      ...user,
      fullName: user.name || 
        (user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email?.split('@')[0] || 'Unknown User')
    }));

    return NextResponse.json({ users: formattedUsers });

  } catch (error) {
    console.error('Error fetching available users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}