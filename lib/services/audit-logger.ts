import { prisma } from '@/lib/db'
import { AuditAction, RiskLevel, AuditStatus } from '@prisma/client'

export interface AuditLogEntry {
  userId?: string
  sessionId?: string
  action: AuditAction
  resource: string
  resourceId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  location?: string
  deviceInfo?: Record<string, any>
  riskLevel?: RiskLevel
  status?: AuditStatus
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface AuditContext {
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  location?: string
  deviceInfo?: Record<string, any>
}

export class AuditLogger {
  private static instance: AuditLogger
  private context: AuditContext = {}

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  /**
   * Set audit context for subsequent log entries
   */
  setContext(context: Partial<AuditContext>): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * Clear audit context
   */
  clearContext(): void {
    this.context = {}
  }

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const auditEntry = {
        userId: entry.userId || this.context.userId,
        sessionId: entry.sessionId || this.context.sessionId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        oldValues: entry.oldValues || null,
        newValues: entry.newValues || null,
        ipAddress: entry.ipAddress || this.context.ipAddress,
        userAgent: entry.userAgent || this.context.userAgent,
        location: entry.location || this.context.location,
        deviceInfo: entry.deviceInfo || this.context.deviceInfo || null,
        riskLevel: entry.riskLevel || this.calculateRiskLevel(entry),
        status: entry.status || AuditStatus.SUCCESS,
        errorMessage: entry.errorMessage,
        metadata: entry.metadata || null
      }

      await prisma.auditLog.create({
        data: auditEntry as any
      })

      // Log high-risk events to console for immediate attention
      if (auditEntry.riskLevel === RiskLevel.HIGH || auditEntry.riskLevel === RiskLevel.CRITICAL) {
        console.warn(`[AUDIT] ${auditEntry.riskLevel} risk event:`, {
          action: auditEntry.action,
          resource: auditEntry.resource,
          userId: auditEntry.userId,
          ipAddress: auditEntry.ipAddress
        })
      }
    } catch (error) {
      console.error('[AuditLogger] Failed to log audit event:', error)
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Calculate risk level based on action and context
   */
  private calculateRiskLevel(entry: AuditLogEntry): RiskLevel {
    // Critical risk actions
    if ([
      AuditAction.DELETE,
      AuditAction.PERMISSION_CHANGE,
      AuditAction.ROLE_CHANGE,
      AuditAction.SYSTEM_CONFIG,
      AuditAction.BULK_OPERATION
    ].includes(entry.action)) {
      return RiskLevel.CRITICAL
    }

    // High risk actions
    if ([
      AuditAction.PASSWORD_CHANGE,
      AuditAction.EMAIL_CHANGE,
      AuditAction.DATA_EXPORT,
      AuditAction.BACKUP,
      AuditAction.RESTORE
    ].includes(entry.action)) {
      return RiskLevel.HIGH
    }

    // Medium risk actions
    if ([
      AuditAction.CREATE,
      AuditAction.UPDATE,
      AuditAction.APPROVE,
      AuditAction.REJECT,
      AuditAction.EXPORT,
      AuditAction.UPLOAD
    ].includes(entry.action)) {
      return RiskLevel.MEDIUM
    }

    // Low risk actions (default)
    return RiskLevel.LOW
  }

  /**
   * Log user authentication events
   */
  async logAuth(action: 'LOGIN' | 'LOGOUT', userId?: string, success: boolean = true, errorMessage?: string): Promise<void> {
    await this.log({
      userId,
      action: action === 'LOGIN' ? AuditAction.LOGIN : AuditAction.LOGOUT,
      resource: 'authentication',
      status: success ? AuditStatus.SUCCESS : AuditStatus.FAILED,
      errorMessage,
      riskLevel: success ? RiskLevel.LOW : RiskLevel.MEDIUM
    })
  }

  /**
   * Log data access events
   */
  async logDataAccess(resource: string, resourceId?: string, userId?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.READ,
      resource,
      resourceId,
      riskLevel: RiskLevel.LOW
    })
  }

  /**
   * Log data modification events
   */
  async logDataModification(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    resource: string,
    resourceId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    const auditAction = action === 'CREATE' ? AuditAction.CREATE :
                       action === 'UPDATE' ? AuditAction.UPDATE :
                       AuditAction.DELETE

    await this.log({
      userId,
      action: auditAction,
      resource,
      resourceId,
      oldValues,
      newValues
    })
  }

  /**
   * Log permission changes
   */
  async logPermissionChange(
    targetUserId: string,
    oldRole?: string,
    newRole?: string,
    oldPermissions?: string[],
    newPermissions?: string[],
    userId?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PERMISSION_CHANGE,
      resource: 'user_permissions',
      resourceId: targetUserId,
      oldValues: { role: oldRole, permissions: oldPermissions },
      newValues: { role: newRole, permissions: newPermissions },
      riskLevel: RiskLevel.CRITICAL
    })
  }

  /**
   * Log file operations
   */
  async logFileOperation(
    action: 'UPLOAD' | 'DOWNLOAD' | 'DELETE',
    fileName: string,
    fileId?: string,
    userId?: string
  ): Promise<void> {
    const auditAction = action === 'UPLOAD' ? AuditAction.UPLOAD :
                       action === 'DOWNLOAD' ? AuditAction.DOWNLOAD :
                       AuditAction.DELETE

    await this.log({
      userId,
      action: auditAction,
      resource: 'files',
      resourceId: fileId,
      metadata: { fileName },
      riskLevel: action === 'DELETE' ? RiskLevel.HIGH : RiskLevel.MEDIUM
    })
  }

  /**
   * Log export operations
   */
  async logExport(
    exportType: string,
    recordCount: number,
    filters?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.EXPORT,
      resource: 'data_export',
      metadata: {
        exportType,
        recordCount,
        filters
      },
      riskLevel: recordCount > 1000 ? RiskLevel.HIGH : RiskLevel.MEDIUM
    })
  }

  /**
   * Log system configuration changes
   */
  async logSystemConfig(
    configType: string,
    oldConfig?: Record<string, any>,
    newConfig?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.SYSTEM_CONFIG,
      resource: 'system_configuration',
      resourceId: configType,
      oldValues: oldConfig,
      newValues: newConfig,
      riskLevel: RiskLevel.CRITICAL
    })
  }

  /**
   * Log suspicious activities
   */
  async logSuspiciousActivity(
    description: string,
    details?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.READ, // Generic action for suspicious activities
      resource: 'security_incident',
      status: AuditStatus.SUSPICIOUS,
      metadata: {
        description,
        details
      },
      riskLevel: RiskLevel.CRITICAL
    })
  }

  /**
   * Log bulk operations
   */
  async logBulkOperation(
    operation: string,
    resource: string,
    affectedCount: number,
    filters?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.BULK_OPERATION,
      resource,
      metadata: {
        operation,
        affectedCount,
        filters
      },
      riskLevel: affectedCount > 100 ? RiskLevel.CRITICAL : RiskLevel.HIGH
    })
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalEvents: number
    eventsByRisk: Record<RiskLevel, number>
    eventsByAction: Record<AuditAction, number>
    topUsers: Array<{ userId: string; eventCount: number }>
    suspiciousActivities: number
  }> {
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    const [
      totalEvents,
      eventsByRisk,
      eventsByAction,
      topUsers,
      suspiciousActivities
    ] = await Promise.all([
      // Total events
      prisma.auditLog.count({
        where: { createdAt: { gte: startDate } }
      }),

      // Events by risk level
      prisma.auditLog.groupBy({
        by: ['riskLevel'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      }),

      // Events by action
      prisma.auditLog.groupBy({
        by: ['action'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      }),

      // Top users by activity
      prisma.auditLog.groupBy({
        by: ['userId'],
        where: { 
          createdAt: { gte: startDate },
          userId: { not: null }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),

      // Suspicious activities
      prisma.auditLog.count({
        where: {
          createdAt: { gte: startDate },
          status: AuditStatus.SUSPICIOUS
        }
      })
    ])

    return {
      totalEvents,
      eventsByRisk: eventsByRisk.reduce((acc, item) => {
        acc[item.riskLevel] = item._count.id
        return acc
      }, {} as Record<RiskLevel, number>),
      eventsByAction: eventsByAction.reduce((acc, item) => {
        acc[item.action] = item._count.id
        return acc
      }, {} as Record<AuditAction, number>),
      topUsers: topUsers.map(user => ({
        userId: user.userId!,
        eventCount: user._count.id
      })),
      suspiciousActivities
    }
  }

  /**
   * Search audit logs with filters
   */
  async searchLogs(filters: {
    userId?: string
    action?: AuditAction
    resource?: string
    riskLevel?: RiskLevel
    status?: AuditStatus
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }): Promise<{
    logs: any[]
    total: number
  }> {
    const where: any = {}

    if (filters.userId) where.userId = filters.userId
    if (filters.action) where.action = filters.action
    if (filters.resource) where.resource = { contains: filters.resource }
    if (filters.riskLevel) where.riskLevel = filters.riskLevel
    if (filters.status) where.status = filters.status
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0
      }),
      prisma.auditLog.count({ where })
    ])

    return { logs, total }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()

// Export convenience functions
export const logAuth = auditLogger.logAuth.bind(auditLogger)
export const logDataAccess = auditLogger.logDataAccess.bind(auditLogger)
export const logDataModification = auditLogger.logDataModification.bind(auditLogger)
export const logPermissionChange = auditLogger.logPermissionChange.bind(auditLogger)
export const logFileOperation = auditLogger.logFileOperation.bind(auditLogger)
export const logExport = auditLogger.logExport.bind(auditLogger)
export const logSystemConfig = auditLogger.logSystemConfig.bind(auditLogger)
export const logSuspiciousActivity = auditLogger.logSuspiciousActivity.bind(auditLogger)
export const logBulkOperation = auditLogger.logBulkOperation.bind(auditLogger)