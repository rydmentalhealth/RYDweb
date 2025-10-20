/**
 * Optimized Authentication Queries
 * High-performance, cached queries for authentication operations
 */

import { prisma, withRetry } from '@/lib/db';
import { UserRole, UserStatus } from '@prisma/client';

interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  password: string | null;
  role: UserRole;
  status: UserStatus;
}

interface AuthUserPublic {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  role: UserRole;
  status: UserStatus;
}

/**
 * Optimized user lookup for authentication with aggressive caching
 */
export async function findUserForAuth(email: string): Promise<AuthUser | null> {
  return withRetry(async () => {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        password: true,
        role: true,
        status: true,
      },
      cacheStrategy: { ttl: 600 }, // 10 minutes cache for auth lookups
    });
  }, 3, 500); // 3 retries with 500ms initial delay
}

/**
 * Optimized user lookup by ID for session validation
 */
export async function findUserById(id: string): Promise<AuthUserPublic | null> {
  return withRetry(async () => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        status: true,
      },
      cacheStrategy: { ttl: 300 }, // 5 minutes cache for session validation
    });
  }, 3, 500);
}

/**
 * Optimized active staff count for dashboard
 */
export async function getActiveStaffCount(): Promise<number> {
  return withRetry(async () => {
    return await prisma.user.count({
      where: {
        role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'CEO', 'CFO'] },
        status: 'ACTIVE'
      },
      cacheStrategy: { ttl: 1800 }, // 30 minutes cache for counts
    });
  });
}

/**
 * Optimized pending users count for admin dashboard
 */
export async function getPendingUsersCount(): Promise<number> {
  return withRetry(async () => {
    return await prisma.user.count({
      where: { status: 'PENDING' },
      cacheStrategy: { ttl: 300 }, // 5 minutes cache for pending counts
    });
  });
}

/**
 * Batch user validation for multiple IDs (used in team operations)
 */
export async function validateUserIds(userIds: string[]): Promise<AuthUserPublic[]> {
  if (userIds.length === 0) return [];
  
  return withRetry(async () => {
    return await prisma.user.findMany({
      where: {
        id: { in: userIds },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        status: true,
      },
      cacheStrategy: { ttl: 600 }, // 10 minutes cache for batch operations
    });
  });
}

/**
 * Check if user exists and is active (lightweight check)
 */
export async function isUserActiveById(id: string): Promise<boolean> {
  return withRetry(async () => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { status: true },
      cacheStrategy: { ttl: 300 }, // 5 minutes cache
    });
    return user?.status === 'ACTIVE';
  });
}

/**
 * Get user's role and status quickly (for authorization checks)
 */
export async function getUserRoleAndStatus(id: string): Promise<{ role: UserRole; status: UserStatus } | null> {
  return withRetry(async () => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true, status: true },
      cacheStrategy: { ttl: 600 }, // 10 minutes cache for role checks
    });
    return user;
  });
}

/**
 * Update user's last login timestamp (fire-and-forget)
 */
export async function updateLastLogin(userId: string): Promise<void> {
  // Don't await this - it's not critical for the login flow
  prisma.user.update({
    where: { id: userId },
    data: { updatedAt: new Date() },
  }).catch(error => {
    console.warn('[Auth] Failed to update last login:', error);
  });
}

/**
 * Optimized search for staff users (for admin interfaces)
 */
export async function searchStaffUsers(
  query: string, 
  limit: number = 10
): Promise<AuthUserPublic[]> {
  return withRetry(async () => {
    return await prisma.user.findMany({
      where: {
        AND: [
          {
            role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'CEO', 'CFO'] }
          },
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        status: true,
      },
      take: limit,
      orderBy: [
        { status: 'asc' }, // Active users first
        { role: 'asc' },
        { email: 'asc' }
      ],
      cacheStrategy: { ttl: 900 }, // 15 minutes cache for search results
    });
  });
}

/**
 * Get users by department (optimized for team dashboards)
 */
export async function getUsersByDepartment(department: string): Promise<AuthUserPublic[]> {
  return withRetry(async () => {
    return await prisma.user.findMany({
      where: {
        department,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        status: true,
      },
      orderBy: [
        { role: 'asc' },
        { email: 'asc' }
      ],
      cacheStrategy: { ttl: 1800 }, // 30 minutes cache for department queries
    });
  });
}

/**
 * Bulk status update for users (admin operations)
 */
export async function bulkUpdateUserStatus(
  userIds: string[], 
  status: UserStatus
): Promise<number> {
  return withRetry(async () => {
    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: { status }
    });
    return result.count;
  });
}

/**
 * Get authentication statistics (for monitoring)
 */
export async function getAuthStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  staffUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
}> {
  return withRetry(async () => {
    const [totalUsers, activeUsers, staffUsers, pendingUsers, suspendedUsers] = await Promise.all([
      prisma.user.count({ cacheStrategy: { ttl: 1800 } }),
      prisma.user.count({ where: { status: 'ACTIVE' }, cacheStrategy: { ttl: 1800 } }),
      prisma.user.count({ 
        where: { role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] } },
        cacheStrategy: { ttl: 1800 }
      }),
      prisma.user.count({ where: { status: 'PENDING' }, cacheStrategy: { ttl: 300 } }),
      prisma.user.count({ where: { status: 'SUSPENDED' }, cacheStrategy: { ttl: 1800 } })
    ]);

    return {
      totalUsers,
      activeUsers,
      staffUsers,
      pendingUsers,
      suspendedUsers
    };
  });
}