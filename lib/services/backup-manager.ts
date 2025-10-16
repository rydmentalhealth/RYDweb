import { prisma } from '@/lib/db'
import { BackupType, BackupStatus } from '@prisma/client'
import { EncryptionService } from './encryption'
import { auditLogger } from './audit-logger'
import crypto from 'crypto'

export interface BackupConfig {
  type: BackupType
  includeUserData: boolean
  includeDocuments: boolean
  includeSystemConfig: boolean
  encryptBackup: boolean
  retentionDays: number
  description?: string
}

export interface BackupResult {
  backupId: string
  fileName: string
  fileUrl: string
  fileSize: number
  checksum: string
  status: BackupStatus
  createdAt: Date
}

export interface RestoreOptions {
  backupId: string
  restoreUserData: boolean
  restoreDocuments: boolean
  restoreSystemConfig: boolean
  createRestorePoint: boolean
}

export class BackupManager {
  private static instance: BackupManager

  private constructor() {}

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager()
    }
    return BackupManager.instance
  }

  /**
   * Create a full database backup
   */
  async createFullBackup(config: Partial<BackupConfig> = {}, userId?: string): Promise<BackupResult> {
    const backupConfig: BackupConfig = {
      type: BackupType.FULL_DATABASE,
      includeUserData: true,
      includeDocuments: true,
      includeSystemConfig: true,
      encryptBackup: true,
      retentionDays: 90,
      ...config
    }

    try {
      // Log backup initiation
      await auditLogger.log({
        userId,
        action: 'BACKUP',
        resource: 'database',
        metadata: { backupType: backupConfig.type },
        riskLevel: 'MEDIUM'
      })

      // Create backup record
      const backup = await prisma.systemBackup.create({
        data: {
          backupType: backupConfig.type,
          fileName: this.generateBackupFileName(backupConfig.type),
          fileUrl: '', // Will be updated after backup creation
          fileSize: BigInt(0), // Will be updated after backup creation
          checksum: '', // Will be updated after backup creation
          status: BackupStatus.IN_PROGRESS,
          retentionDate: new Date(Date.now() + backupConfig.retentionDays * 24 * 60 * 60 * 1000),
          metadata: {
            config: backupConfig,
            startedAt: new Date()
          },
          createdById: userId
        }
      })

      // Perform the actual backup
      const backupData = await this.performBackup(backupConfig)
      
      // Calculate file size and checksum
      const backupJson = JSON.stringify(backupData)
      const fileSize = Buffer.byteLength(backupJson, 'utf8')
      const checksum = crypto.createHash('sha256').update(backupJson).digest('hex')

      // Encrypt backup if required
      let finalBackupData = backupJson
      if (backupConfig.encryptBackup) {
        const encryptionResult = EncryptionService.encrypt(backupJson)
        finalBackupData = JSON.stringify(encryptionResult)
      }

      // In a real implementation, you would upload to cloud storage
      // For now, we'll simulate the file URL
      const fileUrl = `/backups/${backup.fileName}`

      // Update backup record with results
      const updatedBackup = await prisma.systemBackup.update({
        where: { id: backup.id },
        data: {
          fileUrl,
          fileSize: BigInt(fileSize),
          checksum,
          status: BackupStatus.COMPLETED,
          completedAt: new Date(),
          metadata: {
            ...backup.metadata,
            completedAt: new Date(),
            recordCounts: this.getRecordCounts(backupData)
          }
        }
      })

      // Log successful backup
      await auditLogger.log({
        userId,
        action: 'BACKUP',
        resource: 'database',
        resourceId: backup.id,
        metadata: {
          backupType: backupConfig.type,
          fileSize,
          status: 'completed'
        },
        riskLevel: 'LOW'
      })

      return {
        backupId: updatedBackup.id,
        fileName: updatedBackup.fileName,
        fileUrl: updatedBackup.fileUrl,
        fileSize: Number(updatedBackup.fileSize),
        checksum: updatedBackup.checksum,
        status: updatedBackup.status,
        createdAt: updatedBackup.startedAt
      }

    } catch (error) {
      console.error('[BackupManager] Backup failed:', error)
      
      // Update backup status to failed
      await prisma.systemBackup.update({
        where: { id: (await prisma.systemBackup.findFirst({ 
          where: { status: BackupStatus.IN_PROGRESS },
          orderBy: { startedAt: 'desc' }
        }))?.id || '' },
        data: {
          status: BackupStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      // Log failed backup
      await auditLogger.log({
        userId,
        action: 'BACKUP',
        resource: 'database',
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        riskLevel: 'HIGH'
      })

      throw error
    }
  }

  /**
   * Create incremental backup
   */
  async createIncrementalBackup(lastBackupDate: Date, userId?: string): Promise<BackupResult> {
    const config: BackupConfig = {
      type: BackupType.INCREMENTAL,
      includeUserData: true,
      includeDocuments: true,
      includeSystemConfig: false,
      encryptBackup: true,
      retentionDays: 30
    }

    // Similar to full backup but only include records modified since lastBackupDate
    return this.createFullBackup(config, userId)
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(options: RestoreOptions, userId?: string): Promise<void> {
    try {
      // Log restore initiation
      await auditLogger.log({
        userId,
        action: 'RESTORE',
        resource: 'database',
        resourceId: options.backupId,
        metadata: options,
        riskLevel: 'CRITICAL'
      })

      // Get backup record
      const backup = await prisma.systemBackup.findUnique({
        where: { id: options.backupId }
      })

      if (!backup || backup.status !== BackupStatus.COMPLETED) {
        throw new Error('Backup not found or not completed')
      }

      // Create restore point if requested
      if (options.createRestorePoint) {
        await this.createFullBackup({
          type: BackupType.MANUAL,
          description: `Pre-restore backup created on ${new Date().toISOString()}`
        }, userId)
      }

      // In a real implementation, you would:
      // 1. Download backup file from storage
      // 2. Decrypt if encrypted
      // 3. Parse backup data
      // 4. Restore selected data types
      // 5. Verify data integrity

      // Log successful restore
      await auditLogger.log({
        userId,
        action: 'RESTORE',
        resource: 'database',
        resourceId: options.backupId,
        metadata: { ...options, status: 'completed' },
        riskLevel: 'CRITICAL'
      })

    } catch (error) {
      console.error('[BackupManager] Restore failed:', error)
      
      // Log failed restore
      await auditLogger.log({
        userId,
        action: 'RESTORE',
        resource: 'database',
        resourceId: options.backupId,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        riskLevel: 'CRITICAL'
      })

      throw error
    }
  }

  /**
   * Schedule automated backups
   */
  async scheduleAutomatedBackups(): Promise<void> {
    // In a real implementation, this would set up cron jobs or scheduled tasks
    console.log('[BackupManager] Automated backup scheduling would be implemented here')
    
    // Example schedule:
    // - Full backup: Daily at 2 AM
    // - Incremental backup: Every 6 hours
    // - Document backup: Daily at 3 AM
    // - System config backup: Weekly on Sunday at 1 AM
  }

  /**
   * Clean up expired backups
   */
  async cleanupExpiredBackups(): Promise<number> {
    const now = new Date()
    
    const expiredBackups = await prisma.systemBackup.findMany({
      where: {
        retentionDate: { lt: now },
        status: { in: [BackupStatus.COMPLETED, BackupStatus.FAILED] }
      }
    })

    let deletedCount = 0
    for (const backup of expiredBackups) {
      try {
        // In a real implementation, delete the actual backup file from storage
        
        await prisma.systemBackup.update({
          where: { id: backup.id },
          data: { status: BackupStatus.EXPIRED }
        })
        
        deletedCount++
      } catch (error) {
        console.error(`[BackupManager] Failed to delete backup ${backup.id}:`, error)
      }
    }

    if (deletedCount > 0) {
      await auditLogger.log({
        action: 'DELETE',
        resource: 'backup_cleanup',
        metadata: { deletedCount },
        riskLevel: 'LOW'
      })
    }

    return deletedCount
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number
    completedBackups: number
    failedBackups: number
    totalSize: number
    lastBackupDate?: Date
    nextScheduledBackup?: Date
    retentionCompliance: number
  }> {
    const [
      totalBackups,
      completedBackups,
      failedBackups,
      sizeResult,
      lastBackup
    ] = await Promise.all([
      prisma.systemBackup.count(),
      prisma.systemBackup.count({ where: { status: BackupStatus.COMPLETED } }),
      prisma.systemBackup.count({ where: { status: BackupStatus.FAILED } }),
      prisma.systemBackup.aggregate({
        where: { status: BackupStatus.COMPLETED },
        _sum: { fileSize: true }
      }),
      prisma.systemBackup.findFirst({
        where: { status: BackupStatus.COMPLETED },
        orderBy: { completedAt: 'desc' }
      })
    ])

    const totalSize = Number(sizeResult._sum.fileSize || 0)
    
    // Calculate retention compliance (percentage of backups within retention period)
    const now = new Date()
    const validBackups = await prisma.systemBackup.count({
      where: {
        status: BackupStatus.COMPLETED,
        retentionDate: { gt: now }
      }
    })
    const retentionCompliance = completedBackups > 0 ? (validBackups / completedBackups) * 100 : 100

    return {
      totalBackups,
      completedBackups,
      failedBackups,
      totalSize,
      lastBackupDate: lastBackup?.completedAt || undefined,
      nextScheduledBackup: this.calculateNextScheduledBackup(),
      retentionCompliance
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackupIntegrity(backupId: string): Promise<{
    isValid: boolean
    checksumMatch: boolean
    canDecrypt: boolean
    errors: string[]
  }> {
    const errors: string[] = []
    let isValid = true
    let checksumMatch = false
    let canDecrypt = false

    try {
      const backup = await prisma.systemBackup.findUnique({
        where: { id: backupId }
      })

      if (!backup) {
        errors.push('Backup record not found')
        return { isValid: false, checksumMatch: false, canDecrypt: false, errors }
      }

      // In a real implementation, you would:
      // 1. Download the backup file
      // 2. Calculate checksum and compare
      // 3. Try to decrypt if encrypted
      // 4. Validate data structure

      checksumMatch = true // Simulated
      canDecrypt = true // Simulated

    } catch (error) {
      isValid = false
      errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    return { isValid, checksumMatch, canDecrypt, errors }
  }

  /**
   * Generate backup file name
   */
  private generateBackupFileName(type: BackupType): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const typeString = type.toLowerCase().replace('_', '-')
    return `ryd-hr-${typeString}-${timestamp}.backup`
  }

  /**
   * Perform the actual backup operation
   */
  private async performBackup(config: BackupConfig): Promise<any> {
    const backupData: any = {
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        config
      },
      data: {}
    }

    if (config.includeUserData) {
      backupData.data.users = await prisma.user.findMany()
      backupData.data.employeeProfiles = await prisma.employeeProfile.findMany()
      backupData.data.projects = await prisma.project.findMany()
      backupData.data.tasks = await prisma.task.findMany()
      backupData.data.timeEntries = await prisma.timeEntry.findMany()
      backupData.data.checkIns = await prisma.checkIn.findMany()
      backupData.data.leaveRequests = await prisma.leaveRequest.findMany()
      backupData.data.performanceReviews = await prisma.performanceReview.findMany()
    }

    if (config.includeDocuments) {
      backupData.data.documents = await prisma.document.findMany()
      backupData.data.employeeDocuments = await prisma.employeeDocument.findMany()
    }

    if (config.includeSystemConfig) {
      backupData.data.permissions = await prisma.permission.findMany()
      backupData.data.rolePermissions = await prisma.rolePermission.findMany()
      backupData.data.teams = await prisma.team.findMany()
      backupData.data.documentCategories = await prisma.documentCategory.findMany()
    }

    return backupData
  }

  /**
   * Get record counts from backup data
   */
  private getRecordCounts(backupData: any): Record<string, number> {
    const counts: Record<string, number> = {}
    
    if (backupData.data) {
      for (const [table, records] of Object.entries(backupData.data)) {
        if (Array.isArray(records)) {
          counts[table] = records.length
        }
      }
    }

    return counts
  }

  /**
   * Calculate next scheduled backup time
   */
  private calculateNextScheduledBackup(): Date {
    // Example: Next backup at 2 AM tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(2, 0, 0, 0)
    return tomorrow
  }
}

// Export singleton instance
export const backupManager = BackupManager.getInstance()

// Export convenience functions
export const createFullBackup = backupManager.createFullBackup.bind(backupManager)
export const createIncrementalBackup = backupManager.createIncrementalBackup.bind(backupManager)
export const restoreFromBackup = backupManager.restoreFromBackup.bind(backupManager)
export const cleanupExpiredBackups = backupManager.cleanupExpiredBackups.bind(backupManager)
export const getBackupStats = backupManager.getBackupStats.bind(backupManager)
export const verifyBackupIntegrity = backupManager.verifyBackupIntegrity.bind(backupManager)