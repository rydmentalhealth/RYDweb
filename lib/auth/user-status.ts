import { UserStatus } from "@/lib/generated/prisma";

/**
 * Check if a user status allows dashboard access
 */
export function canAccessDashboard(status: UserStatus): boolean {
  return status === 'ACTIVE';
}

/**
 * Check if a user status is pending approval
 */
export function isPendingApproval(status: UserStatus): boolean {
  return status === 'PENDING';
}

/**
 * Check if a user status is suspended/blocked
 */
export function isSuspendedOrBlocked(status: UserStatus): boolean {
  return status === 'SUSPENDED' || status === 'INACTIVE' || status === 'REJECTED';
}

/**
 * Get the appropriate redirect URL based on user status
 */
export function getRedirectUrlForStatus(status: UserStatus): string {
  switch (status) {
    case 'PENDING':
      return '/pending-approval';
    case 'REJECTED':
      return '/auth/rejected';
    case 'SUSPENDED':
    case 'INACTIVE':
      return '/auth/suspended';
    case 'ACTIVE':
      return '/dashboard';
    default:
      return '/auth/signin';
  }
}

/**
 * Validate user session and return appropriate response
 */
export function validateUserSession(session: any): {
  isValid: boolean;
  redirectTo?: string;
  reason?: string;
} {
  if (!session?.user?.id) {
    return {
      isValid: false,
      redirectTo: '/auth/signin',
      reason: 'No valid session found'
    };
  }

  const status = session.user.status;

  if (status === 'REJECTED') {
    return {
      isValid: false,
      redirectTo: '/auth/rejected',
      reason: 'User account rejected'
    };
  }

  if (status === 'SUSPENDED' || status === 'INACTIVE') {
    return {
      isValid: false,
      redirectTo: '/auth/suspended',
      reason: 'User account suspended or inactive'
    };
  }

  if (status === 'PENDING') {
    return {
      isValid: false,
      redirectTo: '/pending-approval',
      reason: 'User pending approval'
    };
  }

  if (status === 'ACTIVE') {
    return {
      isValid: true,
      reason: 'Valid active user'
    };
  }

  return {
    isValid: false,
    redirectTo: '/auth/signin',
    reason: 'Invalid user status'
  };
}

/**
 * Type guard to check if session is valid and has required properties
 */
export function isValidSession(session: any): session is { user: { id: string; email: string; status: UserStatus; role: string } } {
  return session?.user?.id && session?.user?.email && session?.user?.status;
} 