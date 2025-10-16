"use client"

import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { UserRole, UserStatus } from "@prisma/client"
import { 
  hasPermission, 
  checkProjectPermissions, 
  isAdmin, 
  isSuperAdmin,
  hasActiveStatus 
} from "@/lib/auth/rbac"

interface ProjectPermissionsHook {
  // User info
  user: {
    id: string | null
    role: UserRole | null
    status: UserStatus | null
    email: string | null
  }
  
  // General permissions
  canViewProjects: boolean
  canCreateProjects: boolean
  canViewAnalytics: boolean
  canExportReports: boolean
  canManageAllProjects: boolean
  
  // Project-specific permissions checker
  checkProjectPermissions: (
    projectOwnerId?: string,
    projectMemberIds?: string[]
  ) => {
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    canManageMembers: boolean
    isOwner: boolean
    isMember: boolean
  }
  
  // Milestone permissions
  canCreateMilestones: boolean
  canEditMilestones: boolean
  canDeleteMilestones: boolean
  
  // Progress update permissions
  canCreateProgressUpdates: boolean
  canApproveProgressUpdates: boolean
  canEditAllProgressUpdates: boolean
  
  // Resource permissions
  canUploadResources: boolean
  canEditAllResources: boolean
  canDeleteAllResources: boolean
  
  // Notification permissions
  canSendNotifications: boolean
  canViewAllNotifications: boolean
  
  // Role checks
  isAdmin: boolean
  isSuperAdmin: boolean
  isStaffOrAbove: boolean
  hasActiveStatus: boolean
}

export function useProjectPermissions(): ProjectPermissionsHook {
  const { data: session } = useSession()
  
  const user = useMemo(() => ({
    id: session?.user?.id || null,
    role: session?.user?.role as UserRole || null,
    status: session?.user?.status as UserStatus || null,
    email: session?.user?.email || null,
  }), [session])

  const permissions = useMemo(() => {
    if (!user.role || !user.status) {
      return {
        user,
        canViewProjects: false,
        canCreateProjects: false,
        canViewAnalytics: false,
        canExportReports: false,
        canManageAllProjects: false,
        checkProjectPermissions: () => ({
          canView: false,
          canEdit: false,
          canDelete: false,
          canManageMembers: false,
          isOwner: false,
          isMember: false,
        }),
        canCreateMilestones: false,
        canEditMilestones: false,
        canDeleteMilestones: false,
        canCreateProgressUpdates: false,
        canApproveProgressUpdates: false,
        canEditAllProgressUpdates: false,
        canUploadResources: false,
        canEditAllResources: false,
        canDeleteAllResources: false,
        canSendNotifications: false,
        canViewAllNotifications: false,
        isAdmin: false,
        isSuperAdmin: false,
        isStaffOrAbove: false,
        hasActiveStatus: false,
      }
    }

    const userRole = user.role
    const userStatus = user.status
    const userId = user.id

    return {
      user,
      
      // General permissions
      canViewProjects: hasPermission(userRole, 'VIEW_PROJECTS'),
      canCreateProjects: hasPermission(userRole, 'CREATE_PROJECTS'),
      canViewAnalytics: hasPermission(userRole, 'VIEW_PROJECT_ANALYTICS'),
      canExportReports: hasPermission(userRole, 'EXPORT_PROJECT_REPORTS'),
      canManageAllProjects: hasPermission(userRole, 'EDIT_ALL_PROJECTS'),
      
      // Project-specific permissions checker
      checkProjectPermissions: (
        projectOwnerId?: string,
        projectMemberIds: string[] = []
      ) => {
        if (!userId) {
          return {
            canView: false,
            canEdit: false,
            canDelete: false,
            canManageMembers: false,
            isOwner: false,
            isMember: false,
          }
        }

        const permissions = checkProjectPermissions(
          userRole,
          userStatus,
          userId,
          projectOwnerId,
          projectMemberIds
        )

        return {
          ...permissions,
          isMember: projectMemberIds.includes(userId),
        }
      },
      
      // Milestone permissions
      canCreateMilestones: hasPermission(userRole, 'CREATE_MILESTONES'),
      canEditMilestones: hasPermission(userRole, 'EDIT_MILESTONES'),
      canDeleteMilestones: hasPermission(userRole, 'DELETE_MILESTONES'),
      
      // Progress update permissions
      canCreateProgressUpdates: hasPermission(userRole, 'CREATE_PROGRESS_UPDATES'),
      canApproveProgressUpdates: hasPermission(userRole, 'APPROVE_PROGRESS_UPDATES'),
      canEditAllProgressUpdates: hasPermission(userRole, 'EDIT_ALL_PROGRESS_UPDATES'),
      
      // Resource permissions
      canUploadResources: hasPermission(userRole, 'UPLOAD_PROJECT_RESOURCES'),
      canEditAllResources: hasPermission(userRole, 'EDIT_ALL_PROJECT_RESOURCES'),
      canDeleteAllResources: hasPermission(userRole, 'DELETE_ALL_PROJECT_RESOURCES'),
      
      // Notification permissions
      canSendNotifications: hasPermission(userRole, 'SEND_ANNOUNCEMENTS'),
      canViewAllNotifications: hasPermission(userRole, 'VIEW_ALL_MESSAGES'),
      
      // Role checks
      isAdmin: isAdmin(userRole),
      isSuperAdmin: isSuperAdmin(userRole),
      isStaffOrAbove: hasPermission(userRole, 'CREATE_PROJECTS'), // Staff or above can create projects
      hasActiveStatus: hasActiveStatus(userStatus),
    }
  }, [user])

  return permissions
}

// Hook for checking permissions on a specific project
export function useSpecificProjectPermissions(
  projectId: string,
  projectOwnerId?: string,
  projectMemberIds: string[] = []
) {
  const basePermissions = useProjectPermissions()
  
  const projectPermissions = useMemo(() => {
    const specific = basePermissions.checkProjectPermissions(
      projectOwnerId,
      projectMemberIds
    )
    
    return {
      ...basePermissions,
      ...specific,
      projectId,
    }
  }, [basePermissions, projectId, projectOwnerId, projectMemberIds])

  return projectPermissions
}

// Hook for milestone-specific permissions
export function useMilestonePermissions(
  projectId: string,
  milestoneId?: string,
  milestoneResponsibleUserId?: string
) {
  const basePermissions = useProjectPermissions()
  
  const milestonePermissions = useMemo(() => {
    const isResponsible = milestoneResponsibleUserId === basePermissions.user.id
    
    return {
      ...basePermissions,
      canEditThisMilestone: basePermissions.canEditMilestones || isResponsible,
      canDeleteThisMilestone: basePermissions.canDeleteMilestones,
      canUpdateProgress: basePermissions.canCreateProgressUpdates || isResponsible,
      isResponsible,
      milestoneId,
      projectId,
    }
  }, [basePermissions, projectId, milestoneId, milestoneResponsibleUserId])

  return milestonePermissions
}

// Hook for progress update permissions
export function useProgressUpdatePermissions(
  projectId: string,
  updateUserId?: string,
  isProjectLead: boolean = false
) {
  const basePermissions = useProjectPermissions()
  
  const progressPermissions = useMemo(() => {
    const isOwnUpdate = updateUserId === basePermissions.user.id
    
    return {
      ...basePermissions,
      canEditThisUpdate: isOwnUpdate || basePermissions.canEditAllProgressUpdates,
      canDeleteThisUpdate: isOwnUpdate || basePermissions.canEditAllProgressUpdates,
      canApproveThisUpdate: basePermissions.canApproveProgressUpdates || isProjectLead,
      isOwnUpdate,
      isProjectLead,
      projectId,
    }
  }, [basePermissions, projectId, updateUserId, isProjectLead])

  return progressPermissions
}