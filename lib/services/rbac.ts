import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'

// Define comprehensive permission structure
export interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  action: string
}

export interface RolePermissions {
  role: UserRole
  permissions: string[]
}

// Core permission definitions
export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_APPROVE: 'user:approve',
  USER_SUSPEND: 'user:suspend',
  
  // Employee Management
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_READ: 'employee:read',
  EMPLOYEE_UPDATE: 'employee:update',
  EMPLOYEE_DELETE: 'employee:delete',
  EMPLOYEE_DOCUMENTS_UPLOAD: 'employee:documents:upload',
  EMPLOYEE_DOCUMENTS_VIEW: 'employee:documents:view',
  EMPLOYEE_PERFORMANCE_VIEW: 'employee:performance:view',
  EMPLOYEE_PERFORMANCE_CREATE: 'employee:performance:create',
  
  // Project Management
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_ASSIGN_MEMBERS: 'project:assign:members',
  PROJECT_VIEW_ANALYTICS: 'project:analytics:view',
  
  // Task Management
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  TASK_APPROVE: 'task:approve',
  
  // Finance Management
  FINANCE_VIEW: 'finance:view',
  FINANCE_CREATE: 'finance:create',
  FINANCE_UPDATE: 'finance:update',
  FINANCE_DELETE: 'finance:delete',
  FINANCE_APPROVE: 'finance:approve',
  FINANCE_REPORTS: 'finance:reports',
  STIPEND_CREATE: 'stipend:create',
  STIPEND_APPROVE: 'stipend:approve',
  EXPENSE_CREATE: 'expense:create',
  EXPENSE_APPROVE: 'expense:approve',
  
  // Leave Management
  LEAVE_CREATE: 'leave:create',
  LEAVE_READ: 'leave:read',
  LEAVE_UPDATE: 'leave:update',
  LEAVE_APPROVE: 'leave:approve',
  LEAVE_REJECT: 'leave:reject',
  
  // Attendance Management
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_MANAGE: 'attendance:manage',
  ATTENDANCE_REPORTS: 'attendance:reports',
  
  // Analytics & Reports
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  REPORTS_CREATE: 'reports:create',
  REPORTS_VIEW: 'reports:view',
  REPORTS_DELETE: 'reports:delete',
  
  // Security & Audit
  SECURITY_VIEW: 'security:view',
  SECURITY_MANAGE: 'security:manage',
  AUDIT_LOGS_VIEW: 'audit:logs:view',
  AUDIT_LOGS_EXPORT: 'audit:logs:export',
  PERMISSIONS_MANAGE: 'permissions:manage',
  
  // System Administration
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
  SYSTEM_MAINTENANCE: 'system:maintenance',
  
  // Document Management
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_VIEW: 'documents:view',
  DOCUMENTS_DELETE: 'documents:delete',
  DOCUMENTS_MANAGE_CATEGORIES: 'documents:categories:manage',
  
  // Team Management
  TEAM_CREATE: 'team:create',
  TEAM_READ: 'team:read',
  TEAM_UPDATE: 'team:update',
  TEAM_DELETE: 'team:delete',
  TEAM_ASSIGN_MEMBERS: 'team:assign:members'
} as const

// Role-based permission mappings
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Full system access
    ...Object.values(PERMISSIONS)
  ],
  
  [UserRole.CEO]: [
    // Strategic oversight and high-level analytics
    PERMISSIONS.USER_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.EMPLOYEE_PERFORMANCE_VIEW,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_VIEW_ANALYTICS,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_REPORTS,
    PERMISSIONS.LEAVE_READ,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_REPORTS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.TEAM_READ
  ],
  
  [UserRole.CFO]: [
    // Financial management and oversight
    PERMISSIONS.USER_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_CREATE,
    PERMISSIONS.FINANCE_UPDATE,
    PERMISSIONS.FINANCE_APPROVE,
    PERMISSIONS.FINANCE_REPORTS,
    PERMISSIONS.STIPEND_CREATE,
    PERMISSIONS.STIPEND_APPROVE,
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.EXPENSE_APPROVE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD
  ],
  
  [UserRole.ADMIN]: [
    // Administrative functions
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_APPROVE,
    PERMISSIONS.USER_SUSPEND,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.EMPLOYEE_DOCUMENTS_UPLOAD,
    PERMISSIONS.EMPLOYEE_DOCUMENTS_VIEW,
    PERMISSIONS.EMPLOYEE_PERFORMANCE_VIEW,
    PERMISSIONS.EMPLOYEE_PERFORMANCE_CREATE,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_ASSIGN_MEMBERS,
    PERMISSIONS.PROJECT_VIEW_ANALYTICS,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_APPROVE,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_REPORTS,
    PERMISSIONS.LEAVE_READ,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.LEAVE_REJECT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.ATTENDANCE_REPORTS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SECURITY_VIEW,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.DOCUMENTS_MANAGE_CATEGORIES,
    PERMISSIONS.TEAM_CREATE,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_UPDATE,
    PERMISSIONS.TEAM_ASSIGN_MEMBERS
  ],
  
  [UserRole.DIRECTOR]: [
    // Departmental leadership
    PERMISSIONS.USER_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.EMPLOYEE_PERFORMANCE_VIEW,
    PERMISSIONS.EMPLOYEE_PERFORMANCE_CREATE,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_ASSIGN_MEMBERS,
    PERMISSIONS.PROJECT_VIEW_ANALYTICS,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_APPROVE,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.EXPENSE_APPROVE,
    PERMISSIONS.LEAVE_READ,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_REPORTS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.TEAM_CREATE,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_UPDATE,
    PERMISSIONS.TEAM_ASSIGN_MEMBERS
  ],
  
  [UserRole.HR_OFFICER]: [
    // HR management functions
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_APPROVE,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.EMPLOYEE_DOCUMENTS_UPLOAD,
    PERMISSIONS.EMPLOYEE_DOCUMENTS_VIEW,
    PERMISSIONS.EMPLOYEE_PERFORMANCE_VIEW,
    PERMISSIONS.EMPLOYEE_PERFORMANCE_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.LEAVE_READ,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.LEAVE_REJECT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
    PERMISSIONS.ATTENDANCE_REPORTS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_UPDATE
  ],
  
  [UserRole.TEAM_LEAD]: [
    // Team leadership functions
    PERMISSIONS.USER_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.EMPLOYEE_PERFORMANCE_VIEW,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_VIEW_ANALYTICS,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.LEAVE_READ,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.TEAM_READ,
    PERMISSIONS.TEAM_UPDATE
  ],
  
  [UserRole.STAFF]: [
    // Staff member functions
    PERMISSIONS.USER_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.LEAVE_CREATE,
    PERMISSIONS.LEAVE_READ,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.TEAM_READ
  ],
  
  [UserRole.VOLUNTEER]: [
    // Basic volunteer functions
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.LEAVE_CREATE,
    PERMISSIONS.LEAVE_READ,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.TEAM_READ
  ]
}

export class RBACService {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRole: UserRole, permission: string): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || []
    return rolePermissions.includes(permission)
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission))
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission))
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(userRole: UserRole): string[] {
    return ROLE_PERMISSIONS[userRole] || []
  }

  /**
   * Check if a user can access a specific resource
   */
  static canAccessResource(userRole: UserRole, resource: string, action: string): boolean {
    const permission = `${resource}:${action}`
    return this.hasPermission(userRole, permission)
  }

  /**
   * Get permissions grouped by category
   */
  static getPermissionsByCategory(userRole: UserRole): Record<string, string[]> {
    const permissions = this.getRolePermissions(userRole)
    const grouped: Record<string, string[]> = {}

    permissions.forEach(permission => {
      const [resource] = permission.split(':')
      if (!grouped[resource]) {
        grouped[resource] = []
      }
      grouped[resource].push(permission)
    })

    return grouped
  }

  /**
   * Initialize default permissions in database
   */
  static async initializePermissions(): Promise<void> {
    const permissionDefinitions = [
      // User Management
      { name: PERMISSIONS.USER_CREATE, description: 'Create new users', category: 'USER_MANAGEMENT', resource: 'user', action: 'create' },
      { name: PERMISSIONS.USER_READ, description: 'View user information', category: 'USER_MANAGEMENT', resource: 'user', action: 'read' },
      { name: PERMISSIONS.USER_UPDATE, description: 'Update user information', category: 'USER_MANAGEMENT', resource: 'user', action: 'update' },
      { name: PERMISSIONS.USER_DELETE, description: 'Delete users', category: 'USER_MANAGEMENT', resource: 'user', action: 'delete' },
      { name: PERMISSIONS.USER_APPROVE, description: 'Approve user registrations', category: 'USER_MANAGEMENT', resource: 'user', action: 'approve' },
      { name: PERMISSIONS.USER_SUSPEND, description: 'Suspend user accounts', category: 'USER_MANAGEMENT', resource: 'user', action: 'suspend' },

      // Project Management
      { name: PERMISSIONS.PROJECT_CREATE, description: 'Create new projects', category: 'PROJECT_MANAGEMENT', resource: 'project', action: 'create' },
      { name: PERMISSIONS.PROJECT_READ, description: 'View project information', category: 'PROJECT_MANAGEMENT', resource: 'project', action: 'read' },
      { name: PERMISSIONS.PROJECT_UPDATE, description: 'Update project information', category: 'PROJECT_MANAGEMENT', resource: 'project', action: 'update' },
      { name: PERMISSIONS.PROJECT_DELETE, description: 'Delete projects', category: 'PROJECT_MANAGEMENT', resource: 'project', action: 'delete' },
      { name: PERMISSIONS.PROJECT_ASSIGN_MEMBERS, description: 'Assign team members to projects', category: 'PROJECT_MANAGEMENT', resource: 'project', action: 'assign' },
      { name: PERMISSIONS.PROJECT_VIEW_ANALYTICS, description: 'View project analytics', category: 'PROJECT_MANAGEMENT', resource: 'project', action: 'analytics' },

      // Finance Management
      { name: PERMISSIONS.FINANCE_VIEW, description: 'View financial information', category: 'FINANCE', resource: 'finance', action: 'view' },
      { name: PERMISSIONS.FINANCE_CREATE, description: 'Create financial records', category: 'FINANCE', resource: 'finance', action: 'create' },
      { name: PERMISSIONS.FINANCE_UPDATE, description: 'Update financial records', category: 'FINANCE', resource: 'finance', action: 'update' },
      { name: PERMISSIONS.FINANCE_DELETE, description: 'Delete financial records', category: 'FINANCE', resource: 'finance', action: 'delete' },
      { name: PERMISSIONS.FINANCE_APPROVE, description: 'Approve financial transactions', category: 'FINANCE', resource: 'finance', action: 'approve' },
      { name: PERMISSIONS.FINANCE_REPORTS, description: 'Generate financial reports', category: 'FINANCE', resource: 'finance', action: 'reports' },

      // Analytics & Reports
      { name: PERMISSIONS.ANALYTICS_VIEW, description: 'View analytics dashboard', category: 'ANALYTICS', resource: 'analytics', action: 'view' },
      { name: PERMISSIONS.ANALYTICS_EXPORT, description: 'Export analytics data', category: 'ANALYTICS', resource: 'analytics', action: 'export' },
      { name: PERMISSIONS.REPORTS_CREATE, description: 'Create custom reports', category: 'REPORTS', resource: 'reports', action: 'create' },
      { name: PERMISSIONS.REPORTS_VIEW, description: 'View generated reports', category: 'REPORTS', resource: 'reports', action: 'view' },
      { name: PERMISSIONS.REPORTS_DELETE, description: 'Delete reports', category: 'REPORTS', resource: 'reports', action: 'delete' },

      // Security & Audit
      { name: PERMISSIONS.SECURITY_VIEW, description: 'View security dashboard', category: 'SECURITY', resource: 'security', action: 'view' },
      { name: PERMISSIONS.SECURITY_MANAGE, description: 'Manage security settings', category: 'SECURITY', resource: 'security', action: 'manage' },
      { name: PERMISSIONS.AUDIT_LOGS_VIEW, description: 'View audit logs', category: 'AUDIT', resource: 'audit', action: 'view' },
      { name: PERMISSIONS.AUDIT_LOGS_EXPORT, description: 'Export audit logs', category: 'AUDIT', resource: 'audit', action: 'export' },
      { name: PERMISSIONS.PERMISSIONS_MANAGE, description: 'Manage user permissions', category: 'SECURITY', resource: 'permissions', action: 'manage' }
    ]

    // Create permissions if they don't exist
    for (const permDef of permissionDefinitions) {
      await prisma.permission.upsert({
        where: { name: permDef.name },
        update: {},
        create: permDef
      })
    }

    // Create role permissions
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      for (const permissionName of permissions) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName }
        })

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role,
                permissionId: permission.id
              }
            },
            update: { granted: true },
            create: {
              roleId: role,
              permissionId: permission.id,
              granted: true
            }
          })
        }
      }
    }
  }

  /**
   * Middleware function to check permissions
   */
  static requirePermission(permission: string) {
    return (userRole: UserRole) => {
      if (!this.hasPermission(userRole, permission)) {
        throw new Error(`Insufficient permissions. Required: ${permission}`)
      }
      return true
    }
  }

  /**
   * Middleware function to check multiple permissions (any)
   */
  static requireAnyPermission(permissions: string[]) {
    return (userRole: UserRole) => {
      if (!this.hasAnyPermission(userRole, permissions)) {
        throw new Error(`Insufficient permissions. Required any of: ${permissions.join(', ')}`)
      }
      return true
    }
  }

  /**
   * Middleware function to check multiple permissions (all)
   */
  static requireAllPermissions(permissions: string[]) {
    return (userRole: UserRole) => {
      if (!this.hasAllPermissions(userRole, permissions)) {
        throw new Error(`Insufficient permissions. Required all of: ${permissions.join(', ')}`)
      }
      return true
    }
  }
}

// Export commonly used permission checks
export const canViewAnalytics = (role: UserRole) => RBACService.hasPermission(role, PERMISSIONS.ANALYTICS_VIEW)
export const canManageUsers = (role: UserRole) => RBACService.hasAnyPermission(role, [
  PERMISSIONS.USER_CREATE,
  PERMISSIONS.USER_UPDATE,
  PERMISSIONS.USER_DELETE,
  PERMISSIONS.USER_APPROVE
])
export const canManageFinance = (role: UserRole) => RBACService.hasAnyPermission(role, [
  PERMISSIONS.FINANCE_CREATE,
  PERMISSIONS.FINANCE_UPDATE,
  PERMISSIONS.FINANCE_APPROVE
])
export const canViewReports = (role: UserRole) => RBACService.hasPermission(role, PERMISSIONS.REPORTS_VIEW)
export const canManageSecurity = (role: UserRole) => RBACService.hasPermission(role, PERMISSIONS.SECURITY_MANAGE)