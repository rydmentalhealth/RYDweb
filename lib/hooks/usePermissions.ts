import { useSession } from 'next-auth/react';
import { UserRole, UserStatus } from '../generated/prisma';
import {
  hasMinimumRole,
  isAdmin,
  isSuperAdmin,
  isStaffOrAbove,
  hasActiveStatus,
  isPendingApproval,
  isUserBlocked,
  canAccessResource,
  canManageOwnedResource,
  hasPermission,
  canAccessRoute,
  checkProjectPermissions,
  checkTaskPermissions,
  getNavigationItems,
  PERMISSIONS,
  type UserPermissions,
  type ResourceOwnership,
} from '../auth/rbac';

export interface UsePermissionsReturn {
  // User info
  user: {
    id: string | null;
    role: UserRole | null;
    status: UserStatus | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  
  // Role checks
  hasMinimumRole: (requiredRole: UserRole) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStaffOrAbove: boolean;
  isVolunteer: boolean;
  
  // Status checks
  hasActiveStatus: boolean;
  isPendingApproval: boolean;
  isUserBlocked: boolean;
  
  // Permission checks
  canAccessResource: (requiredRole: UserRole, requireActiveStatus?: boolean) => boolean;
  canManageOwnedResource: (isOwner: boolean, requiredRoleForOthers?: UserRole) => boolean;
  hasPermission: (permission: keyof typeof PERMISSIONS) => boolean;
  canAccessRoute: (route: string) => boolean;
  
  // Resource-specific permissions
  checkProjectPermissions: (projectOwnerId?: string, projectMemberIds?: string[]) => ResourceOwnership;
  checkTaskPermissions: (taskCreatorId?: string, taskAssigneeIds?: string[], projectOwnerId?: string) => ResourceOwnership;
  
  // Helper methods for specific resources
  canEditTask: (task: any) => boolean;
  canDeleteTask: (task: any) => boolean;
  canEditProject: (project: any) => boolean;
  canDeleteProject: (project: any) => boolean;
  
  // Navigation
  getNavigationItems: () => any[];
  
  // Utility functions for common permissions
  canManageUsers: boolean;
  canApproveUsers: boolean;
  canViewTeam: boolean;
  canManageTeam: boolean;
  canViewProjects: boolean;
  canCreateProjects: boolean;
  canViewTasks: boolean;
  canCreateTasks: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
  canManageFinances: boolean;
  canViewReports: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { data: session, status } = useSession();
  
  const userId = session?.user?.id as string | null;
  const userRole = session?.user?.role as UserRole | null;
  const userStatus = session?.user?.status as UserStatus | null;
  const isAuthenticated = !!session?.user;
  const isLoading = status === 'loading';
  
  // Create user permissions object
  const userPermissions: UserPermissions | null = userRole && userStatus 
    ? { role: userRole, status: userStatus }
    : null;

  // Helper function to check task permissions
  const canEditTask = (task: any): boolean => {
    if (!userRole || !userStatus || !userId) return false;
    
    const taskAssigneeIds = task.assignees?.map((a: any) => a.id) || [];
    const taskCreatorId = task.createdById || task.createdBy?.id;
    const projectOwnerId = task.project?.ownerId;
    
    const permissions = checkTaskPermissions(userRole, userStatus, userId, taskCreatorId, taskAssigneeIds, projectOwnerId);
    
    // Debug logging for SUPER_ADMIN
    if (userRole === 'SUPER_ADMIN') {
      console.log(`[usePermissions] SUPER_ADMIN canEditTask for task ${task.id}:`, {
        userRole,
        userStatus,
        userId,
        taskCreatorId,
        taskAssigneeIds,
        projectOwnerId,
        permissions,
        result: permissions.canEdit
      });
    }
    
    return permissions.canEdit;
  };

  const canDeleteTask = (task: any): boolean => {
    if (!userRole || !userStatus || !userId) return false;
    
    const taskAssigneeIds = task.assignees?.map((a: any) => a.id) || [];
    const taskCreatorId = task.createdById || task.createdBy?.id;
    const projectOwnerId = task.project?.ownerId;
    
    const permissions = checkTaskPermissions(userRole, userStatus, userId, taskCreatorId, taskAssigneeIds, projectOwnerId);
    
    // Debug logging for SUPER_ADMIN
    if (userRole === 'SUPER_ADMIN') {
      console.log(`[usePermissions] SUPER_ADMIN canDeleteTask for task ${task.id}:`, {
        userRole,
        userStatus,
        userId,
        taskCreatorId,
        taskAssigneeIds,
        projectOwnerId,
        permissions,
        result: permissions.canDelete
      });
    }
    
    return permissions.canDelete;
  };

  const canEditProject = (project: any): boolean => {
    if (!userRole || !userStatus || !userId) return false;
    
    const projectMemberIds = project.members?.map((m: any) => m.id) || project.team?.map((t: any) => t.user?.id || t.userId) || [];
    const projectOwnerId = project.ownerId || project.owner?.id;
    
    const permissions = checkProjectPermissions(userRole, userStatus, userId, projectOwnerId, projectMemberIds);
    return permissions.canEdit;
  };

  const canDeleteProject = (project: any): boolean => {
    if (!userRole || !userStatus || !userId) return false;
    
    const projectMemberIds = project.members?.map((m: any) => m.id) || project.team?.map((t: any) => t.user?.id || t.userId) || [];
    const projectOwnerId = project.ownerId || project.owner?.id;
    
    const permissions = checkProjectPermissions(userRole, userStatus, userId, projectOwnerId, projectMemberIds);
    return permissions.canDelete;
  };
  
  return {
    // User info
    user: {
      id: userId,
      role: userRole,
      status: userStatus,
      isAuthenticated,
      isLoading,
    },
    
    // Role checks
    hasMinimumRole: (requiredRole: UserRole) => 
      userRole ? hasMinimumRole(userRole, requiredRole) : false,
    isAdmin: userRole ? isAdmin(userRole) : false,
    isSuperAdmin: userRole ? isSuperAdmin(userRole) : false,
    isStaffOrAbove: userRole ? isStaffOrAbove(userRole) : false,
    isVolunteer: userRole === UserRole.VOLUNTEER,
    
    // Status checks
    hasActiveStatus: userStatus ? hasActiveStatus(userStatus) : false,
    isPendingApproval: userStatus ? isPendingApproval(userStatus) : false,
    isUserBlocked: userStatus ? isUserBlocked(userStatus) : false,
    
    // Permission checks
    canAccessResource: (requiredRole: UserRole, requireActiveStatus = true) =>
      userPermissions ? canAccessResource(userPermissions, requiredRole, requireActiveStatus) : false,
    canManageOwnedResource: (isOwner: boolean, requiredRoleForOthers = UserRole.ADMIN) =>
      userRole && userStatus ? canManageOwnedResource(userRole, userStatus, isOwner, requiredRoleForOthers) : false,
    hasPermission: (permission: keyof typeof PERMISSIONS) =>
      userRole ? hasPermission(userRole, permission) : false,
    canAccessRoute: (route: string) =>
      userRole && userStatus ? canAccessRoute(userRole, userStatus, route) : false,
    
    // Resource-specific permissions
    checkProjectPermissions: (projectOwnerId?: string, projectMemberIds: string[] = []) =>
      userRole && userStatus && userId 
        ? checkProjectPermissions(userRole, userStatus, userId, projectOwnerId, projectMemberIds)
        : { isOwner: false, canView: false, canEdit: false, canDelete: false, canManageMembers: false },
    checkTaskPermissions: (taskCreatorId?: string, taskAssigneeIds: string[] = [], projectOwnerId?: string) =>
      userRole && userStatus && userId 
        ? checkTaskPermissions(userRole, userStatus, userId, taskCreatorId, taskAssigneeIds, projectOwnerId)
        : { isOwner: false, canView: false, canEdit: false, canDelete: false },
    
    // Helper methods for specific resources
    canEditTask,
    canDeleteTask,
    canEditProject,
    canDeleteProject,
    
    // Navigation
    getNavigationItems: () =>
      userRole && userStatus ? getNavigationItems(userRole, userStatus) : [],
    
    // Utility functions for common permissions
    canManageUsers: userRole ? hasPermission(userRole, 'MANAGE_USERS') : false,
    canApproveUsers: userRole ? hasPermission(userRole, 'APPROVE_USERS') : false,
    canViewTeam: userRole ? hasPermission(userRole, 'VIEW_TEAM') : false,
    canManageTeam: userRole ? hasPermission(userRole, 'MANAGE_TEAM') : false,
    canViewProjects: userRole ? hasPermission(userRole, 'VIEW_PROJECTS') : false,
    canCreateProjects: userRole ? hasPermission(userRole, 'CREATE_PROJECTS') : false,
    canViewTasks: userRole ? hasPermission(userRole, 'VIEW_TASKS') : false,
    canCreateTasks: userRole ? hasPermission(userRole, 'CREATE_TASKS') : false,
    canViewDocuments: userRole ? hasPermission(userRole, 'VIEW_DOCUMENTS') : false,
    canUploadDocuments: userRole ? hasPermission(userRole, 'UPLOAD_DOCUMENTS') : false,
    canManageFinances: userRole ? hasPermission(userRole, 'MANAGE_FINANCES') : false,
    canViewReports: userRole ? hasPermission(userRole, 'VIEW_REPORTS') : false,
    canViewAnalytics: userRole ? hasPermission(userRole, 'VIEW_ANALYTICS') : false,
    canManageSettings: userRole ? hasPermission(userRole, 'MANAGE_SETTINGS') : false,
  };
} 