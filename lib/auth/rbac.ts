import { UserRole, UserStatus } from '../generated/prisma';

export interface UserPermissions {
  role: UserRole;
  status: UserStatus;
}

// Define permission levels
export const PERMISSION_LEVELS = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  STAFF: 2,
  VOLUNTEER: 1,
} as const;

// Check if user has minimum required role
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = PERMISSION_LEVELS[userRole];
  const requiredLevel = PERMISSION_LEVELS[requiredRole];
  return userLevel >= requiredLevel;
}

// Check if user is admin (ADMIN or SUPER_ADMIN)
export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
}

// Check if user is super admin
export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.SUPER_ADMIN;
}

// Check if user is staff or above
export function isStaffOrAbove(userRole: UserRole): boolean {
  return hasMinimumRole(userRole, UserRole.STAFF);
}

// Check if user status allows access
export function hasActiveStatus(userStatus: UserStatus): boolean {
  return userStatus === UserStatus.ACTIVE;
}

// Check if user is pending approval
export function isPendingApproval(userStatus: UserStatus): boolean {
  return userStatus === UserStatus.PENDING;
}

// Check if user is blocked (suspended, rejected, or inactive)
export function isUserBlocked(userStatus: UserStatus): boolean {
  return userStatus === UserStatus.SUSPENDED || 
         userStatus === UserStatus.REJECTED || 
         userStatus === UserStatus.INACTIVE;
}

// Comprehensive permission check
export function canAccessResource(
  userPermissions: UserPermissions,
  requiredRole: UserRole,
  requireActiveStatus: boolean = true
): boolean {
  const { role, status } = userPermissions;
  
  // Check role permission
  if (!hasMinimumRole(role, requiredRole)) {
    return false;
  }
  
  // Check status if required
  if (requireActiveStatus && !hasActiveStatus(status)) {
    return false;
  }
  
  return true;
}

// Check if user can manage a resource they own or have admin privileges
export function canManageOwnedResource(
  userRole: UserRole,
  userStatus: UserStatus,
  isOwner: boolean,
  requiredRoleForOthers: UserRole = UserRole.ADMIN
): boolean {
  // Must have active status
  if (!hasActiveStatus(userStatus)) {
    return false;
  }
  
  // If user is owner and has minimum staff role, they can manage
  if (isOwner && isStaffOrAbove(userRole)) {
    return true;
  }
  
  // If user has required role for managing others' resources
  return hasMinimumRole(userRole, requiredRoleForOthers);
}

// Define specific permissions for different actions
export const PERMISSIONS = {
  // User management
  MANAGE_USERS: (userRole: UserRole) => isAdmin(userRole),
  APPROVE_USERS: (userRole: UserRole) => isAdmin(userRole),
  VIEW_ALL_USERS: (userRole: UserRole) => isStaffOrAbove(userRole),
  DELETE_USERS: (userRole: UserRole) => isAdmin(userRole),
  
  // Project management
  VIEW_PROJECTS: (userRole: UserRole) => hasMinimumRole(userRole, UserRole.VOLUNTEER),
  CREATE_PROJECTS: (userRole: UserRole) => isStaffOrAbove(userRole),
  EDIT_OWN_PROJECTS: (userRole: UserRole) => isStaffOrAbove(userRole),
  EDIT_ALL_PROJECTS: (userRole: UserRole) => isAdmin(userRole),
  DELETE_OWN_PROJECTS: (userRole: UserRole) => isStaffOrAbove(userRole),
  DELETE_ALL_PROJECTS: (userRole: UserRole) => isAdmin(userRole),
  MANAGE_PROJECT_MEMBERS: (userRole: UserRole) => isStaffOrAbove(userRole),
  VIEW_PROJECT_ANALYTICS: (userRole: UserRole) => isStaffOrAbove(userRole),
  
  // Task management
  VIEW_TASKS: (userRole: UserRole) => hasMinimumRole(userRole, UserRole.VOLUNTEER),
  VIEW_ALL_TASKS: (userRole: UserRole) => isStaffOrAbove(userRole),
  CREATE_TASKS: (userRole: UserRole) => isStaffOrAbove(userRole),
  EDIT_OWN_TASKS: (userRole: UserRole) => hasMinimumRole(userRole, UserRole.VOLUNTEER),
  EDIT_ALL_TASKS: (userRole: UserRole) => isStaffOrAbove(userRole),
  DELETE_OWN_TASKS: (userRole: UserRole) => isStaffOrAbove(userRole),
  DELETE_ALL_TASKS: (userRole: UserRole) => isStaffOrAbove(userRole),
  ASSIGN_TASKS: (userRole: UserRole) => isStaffOrAbove(userRole),
  UNASSIGN_TASKS: (userRole: UserRole) => isStaffOrAbove(userRole),
  COMPLETE_ASSIGNED_TASKS: (userRole: UserRole) => hasMinimumRole(userRole, UserRole.VOLUNTEER),
  
  // Team management
  VIEW_TEAM: (userRole: UserRole) => isStaffOrAbove(userRole),
  MANAGE_TEAM: (userRole: UserRole) => isAdmin(userRole),
  EDIT_TEAM_MEMBERS: (userRole: UserRole) => isAdmin(userRole),
  DELETE_TEAM_MEMBERS: (userRole: UserRole) => isAdmin(userRole),
  
  // Financial management
  MANAGE_FINANCES: (userRole: UserRole) => isAdmin(userRole),
  VIEW_FINANCES: (userRole: UserRole) => isStaffOrAbove(userRole),
  CREATE_TRANSACTIONS: (userRole: UserRole) => isAdmin(userRole),
  EDIT_TRANSACTIONS: (userRole: UserRole) => isAdmin(userRole),
  DELETE_TRANSACTIONS: (userRole: UserRole) => isAdmin(userRole),
  
  // Document management
  UPLOAD_DOCUMENTS: (userRole: UserRole) => hasMinimumRole(userRole, UserRole.VOLUNTEER),
  VIEW_DOCUMENTS: (userRole: UserRole) => hasMinimumRole(userRole, UserRole.VOLUNTEER),
  EDIT_OWN_DOCUMENTS: (userRole: UserRole) => hasMinimumRole(userRole, UserRole.VOLUNTEER),
  EDIT_ALL_DOCUMENTS: (userRole: UserRole) => isStaffOrAbove(userRole),
  DELETE_OWN_DOCUMENTS: (userRole: UserRole) => hasMinimumRole(userRole, UserRole.VOLUNTEER),
  DELETE_ALL_DOCUMENTS: (userRole: UserRole) => isStaffOrAbove(userRole),
  MANAGE_DOCUMENT_CATEGORIES: (userRole: UserRole) => isStaffOrAbove(userRole),
  
  // Reports and analytics
  VIEW_REPORTS: (userRole: UserRole) => isStaffOrAbove(userRole),
  VIEW_ANALYTICS: (userRole: UserRole) => isStaffOrAbove(userRole),
  VIEW_ADMIN_ANALYTICS: (userRole: UserRole) => isAdmin(userRole),
  EXPORT_DATA: (userRole: UserRole) => isStaffOrAbove(userRole),
  
  // Communication
  SEND_ANNOUNCEMENTS: (userRole: UserRole) => isStaffOrAbove(userRole),
  MANAGE_ANNOUNCEMENTS: (userRole: UserRole) => isStaffOrAbove(userRole),
  VIEW_ALL_MESSAGES: (userRole: UserRole) => isAdmin(userRole),
  
  // System settings
  MANAGE_SETTINGS: (userRole: UserRole) => isSuperAdmin(userRole),
  MANAGE_ROLES: (userRole: UserRole) => isSuperAdmin(userRole),
  MANAGE_PERMISSIONS: (userRole: UserRole) => isSuperAdmin(userRole),
  VIEW_AUDIT_LOGS: (userRole: UserRole) => isAdmin(userRole),
  MANAGE_SYSTEM: (userRole: UserRole) => isSuperAdmin(userRole),
} as const;

// Helper function to check specific permissions
export function hasPermission(
  userRole: UserRole,
  permission: keyof typeof PERMISSIONS
): boolean {
  return PERMISSIONS[permission](userRole);
}

// Route-based permissions - defines minimum role required for each route
export const ROUTE_PERMISSIONS = {
  // Admin routes
  '/admin': UserRole.ADMIN,
  '/admin/users': UserRole.ADMIN,
  '/admin/users/approve': UserRole.ADMIN,
  '/admin/users/manage': UserRole.ADMIN,
  '/admin/settings': UserRole.SUPER_ADMIN,
  '/admin/reports': UserRole.ADMIN,
  '/admin/finance': UserRole.ADMIN,
  '/admin/analytics': UserRole.ADMIN,
  
  // Dashboard routes
  '/dashboard/projects': UserRole.VOLUNTEER, // View projects
  '/dashboard/projects/create': UserRole.STAFF, // Create projects
  '/dashboard/tasks': UserRole.VOLUNTEER, // View tasks
  '/dashboard/tasks/create': UserRole.STAFF, // Create tasks
  '/dashboard/team': UserRole.STAFF, // View team
  '/dashboard/team/manage': UserRole.ADMIN, // Manage team
  '/dashboard/reports': UserRole.STAFF,
  '/dashboard/analytics': UserRole.STAFF,
  '/dashboard/finance': UserRole.STAFF,
  '/dashboard/documents': UserRole.VOLUNTEER,
  '/dashboard/settings': UserRole.VOLUNTEER,
  
  // Profile and basic access
  '/dashboard': UserRole.VOLUNTEER,
  '/dashboard/profile': UserRole.VOLUNTEER,
  '/dashboard/checkin': UserRole.VOLUNTEER,
  '/dashboard/pending': UserRole.VOLUNTEER,
} as const;

// Check if user can access a specific route
export function canAccessRoute(
  userRole: UserRole,
  userStatus: UserStatus,
  route: string
): boolean {
  // Check if route requires specific permission
  const requiredRole = ROUTE_PERMISSIONS[route as keyof typeof ROUTE_PERMISSIONS];
  
  if (requiredRole) {
    return canAccessResource(
      { role: userRole, status: userStatus },
      requiredRole,
      true
    );
  }
  
  // Default: allow access to authenticated users with active status
  return hasActiveStatus(userStatus);
}

// Navigation items configuration based on user role
export const getNavigationItems = (userRole: UserRole, userStatus: UserStatus) => {
  const items = [];
  
  // Always include dashboard
  items.push({
    title: "Dashboard",
    url: "/dashboard",
    icon: "LayoutDashboard",
    permission: true
  });
  
  // Projects - all users can view, staff+ can manage
  if (hasPermission(userRole, 'VIEW_PROJECTS')) {
    items.push({
      title: "Projects",
      url: "/dashboard/projects",
      icon: "FolderKanban",
      permission: true
    });
  }
  
  // Tasks - all users can view, staff+ can manage
  if (hasPermission(userRole, 'VIEW_TASKS')) {
    items.push({
      title: "Tasks",
      url: "/dashboard/tasks",
      icon: "ClipboardList",
      permission: true
    });
  }
  
  // Team - staff+ only
  if (hasPermission(userRole, 'VIEW_TEAM')) {
    items.push({
      title: "Team Management",
      url: "/dashboard/team",
      icon: "Users",
      permission: true
    });
  }
  
  // Documents - all users
  if (hasPermission(userRole, 'VIEW_DOCUMENTS')) {
    items.push({
      title: "Documents",
      url: "/dashboard/documents",
      icon: "FileText",
      permission: true
    });
  }
  
  // Reports & Analytics - staff+
  if (hasPermission(userRole, 'VIEW_REPORTS')) {
    items.push({
      title: "Reports",
      url: "/dashboard/reports",
      icon: "BarChart",
      permission: true
    });
  }
  
  // Finance - staff+
  if (hasPermission(userRole, 'VIEW_FINANCES')) {
    items.push({
      title: "Finance",
      url: "/dashboard/finance",
      icon: "Wallet",
      permission: true
    });
  }
  
  // Admin section - admin+
  if (isAdmin(userRole)) {
    items.push({
      title: "Administration",
      url: "/admin",
      icon: "Settings",
      permission: true,
      children: [
        {
          title: "User Management",
          url: "/admin/users",
          permission: hasPermission(userRole, 'MANAGE_USERS')
        },
        {
          title: "System Reports",
          url: "/admin/reports",
          permission: hasPermission(userRole, 'VIEW_ADMIN_ANALYTICS')
        },
        {
          title: "Settings",
          url: "/admin/settings",
          permission: hasPermission(userRole, 'MANAGE_SETTINGS')
        }
      ]
    });
  }
  
  return items.filter(item => item.permission);
};

// Resource ownership helpers
export interface ResourceOwnership {
  isOwner: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers?: boolean;
}

// Check project permissions for a specific user
export function checkProjectPermissions(
  userRole: UserRole,
  userStatus: UserStatus,
  userId: string,
  projectOwnerId?: string,
  projectMemberIds: string[] = []
): ResourceOwnership {
  const isOwner = projectOwnerId === userId;
  const isMember = projectMemberIds.includes(userId);
  const hasActiveStatusCheck = hasActiveStatus(userStatus);
  
  // SUPER_ADMIN has universal access to all projects
  if (isSuperAdmin(userRole) && hasActiveStatusCheck) {
    console.log("[RBAC] SUPER_ADMIN detected - granting universal project access");
    return {
      isOwner,
      canView: true,
      canEdit: true,
      canDelete: true,
      canManageMembers: true
    };
  }
  
  return {
    isOwner,
    canView: hasActiveStatusCheck && (
      hasPermission(userRole, 'VIEW_PROJECTS') && (
        isMember || 
        isOwner || 
        hasPermission(userRole, 'VIEW_ALL_TASKS')
      )
    ),
    canEdit: hasActiveStatusCheck && (
      (isOwner && hasPermission(userRole, 'EDIT_OWN_PROJECTS')) ||
      hasPermission(userRole, 'EDIT_ALL_PROJECTS')
    ),
    canDelete: hasActiveStatusCheck && (
      (isOwner && hasPermission(userRole, 'DELETE_OWN_PROJECTS')) ||
      hasPermission(userRole, 'DELETE_ALL_PROJECTS')
    ),
    canManageMembers: hasActiveStatusCheck && (
      (isOwner && hasPermission(userRole, 'MANAGE_PROJECT_MEMBERS')) ||
      hasPermission(userRole, 'EDIT_ALL_PROJECTS')
    )
  };
}

// Check task permissions for a specific user
export function checkTaskPermissions(
  userRole: UserRole,
  userStatus: UserStatus,
  userId: string,
  taskCreatorId?: string,
  taskAssigneeIds: string[] = [],
  projectOwnerId?: string
): ResourceOwnership {
  const isCreator = taskCreatorId === userId;
  const isAssignee = taskAssigneeIds.includes(userId);
  const isProjectOwner = projectOwnerId === userId;
  const hasActiveStatusCheck = hasActiveStatus(userStatus);
  
  // SUPER_ADMIN has universal access to all tasks
  if (isSuperAdmin(userRole) && hasActiveStatusCheck) {
    console.log("[RBAC] SUPER_ADMIN detected - granting universal task access");
    return {
      isOwner: isCreator,
      canView: true,
      canEdit: true,
      canDelete: true
    };
  }
  
  const result = {
    isOwner: isCreator,
    canView: hasActiveStatusCheck && (
      hasPermission(userRole, 'VIEW_TASKS') && (
        isAssignee || 
        isCreator || 
        isProjectOwner || 
        hasPermission(userRole, 'VIEW_ALL_TASKS')
      )
    ),
    canEdit: hasActiveStatusCheck && (
      (isCreator && hasPermission(userRole, 'EDIT_OWN_TASKS')) ||
      (isAssignee && hasPermission(userRole, 'EDIT_OWN_TASKS')) ||
      (isProjectOwner && hasPermission(userRole, 'EDIT_ALL_TASKS')) ||
      hasPermission(userRole, 'EDIT_ALL_TASKS')
    ),
    canDelete: hasActiveStatusCheck && (
      (isCreator && hasPermission(userRole, 'DELETE_OWN_TASKS')) ||
      hasPermission(userRole, 'DELETE_ALL_TASKS')
    )
  };
  
  return result;
} 