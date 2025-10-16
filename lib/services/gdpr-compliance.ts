import { prisma } from '@/lib/db'
import { PrivacyRequestType, PrivacyRequestStatus } from '@prisma/client'
import { auditLogger } from './audit-logger'
import { EncryptionService } from './encryption'

export interface DataExportRequest {
  userId: string
  requestedData?: string[]
  format: 'json' | 'csv' | 'pdf'
  includePersonalData: boolean
  includeActivityLogs: boolean
  includeDocuments: boolean
}

export interface DataDeletionRequest {
  userId: string
  retainLegalData: boolean
  anonymizeInstead: boolean
  reason?: string
}

export interface ConsentRecord {
  userId: string
  consentType: string
  granted: boolean
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export interface GDPRReport {
  totalUsers: number
  activeConsents: number
  pendingRequests: number
  completedRequests: number
  dataRetentionCompliance: number
  encryptedDataRecords: number
  lastAuditDate?: Date
}

export class GDPRComplianceService {
  private static instance: GDPRComplianceService

  private constructor() {}

  static getInstance(): GDPRComplianceService {
    if (!GDPRComplianceService.instance) {
      GDPRComplianceService.instance = new GDPRComplianceService()
    }
    return GDPRComplianceService.instance
  }

  /**
   * Submit data export request (Right to Data Portability)
   */
  async requestDataExport(request: DataExportRequest, requesterId?: string): Promise<string> {
    try {
      const privacyRequest = await prisma.dataPrivacyRequest.create({
        data: {
          userId: request.userId,
          requestType: PrivacyRequestType.DATA_EXPORT,
          status: PrivacyRequestStatus.PENDING,
          description: 'User requested data export',
          requestedData: {
            format: request.format,
            includePersonalData: request.includePersonalData,
            includeActivityLogs: request.includeActivityLogs,
            includeDocuments: request.includeDocuments,
            requestedFields: request.requestedData
          },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })

      // Log the request
      await auditLogger.log({
        userId: requesterId || request.userId,
        action: 'CREATE',
        resource: 'data_privacy_request',
        resourceId: privacyRequest.id,
        newValues: { requestType: 'DATA_EXPORT', targetUserId: request.userId },
        riskLevel: 'MEDIUM'
      })

      return privacyRequest.id
    } catch (error) {
      console.error('[GDPR] Failed to create data export request:', error)
      throw new Error('Failed to submit data export request')
    }
  }

  /**
   * Submit data deletion request (Right to be Forgotten)
   */
  async requestDataDeletion(request: DataDeletionRequest, requesterId?: string): Promise<string> {
    try {
      const privacyRequest = await prisma.dataPrivacyRequest.create({
        data: {
          userId: request.userId,
          requestType: PrivacyRequestType.DATA_DELETION,
          status: PrivacyRequestStatus.PENDING,
          description: request.reason || 'User requested data deletion',
          requestedData: {
            retainLegalData: request.retainLegalData,
            anonymizeInstead: request.anonymizeInstead
          },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      })

      // Log the request
      await auditLogger.log({
        userId: requesterId || request.userId,
        action: 'CREATE',
        resource: 'data_privacy_request',
        resourceId: privacyRequest.id,
        newValues: { requestType: 'DATA_DELETION', targetUserId: request.userId },
        riskLevel: 'HIGH'
      })

      return privacyRequest.id
    } catch (error) {
      console.error('[GDPR] Failed to create data deletion request:', error)
      throw new Error('Failed to submit data deletion request')
    }
  }

  /**
   * Process data export request
   */
  async processDataExport(requestId: string, processedById: string): Promise<any> {
    try {
      const request = await prisma.dataPrivacyRequest.findUnique({
        where: { id: requestId },
        include: { user: true }
      })

      if (!request || request.requestType !== PrivacyRequestType.DATA_EXPORT) {
        throw new Error('Invalid data export request')
      }

      // Collect user data
      const userData = await this.collectUserData(request.userId, request.requestedData as any)

      // Update request status
      await prisma.dataPrivacyRequest.update({
        where: { id: requestId },
        data: {
          status: PrivacyRequestStatus.COMPLETED,
          processedById,
          processedAt: new Date(),
          processedData: userData
        }
      })

      // Log the processing
      await auditLogger.log({
        userId: processedById,
        action: 'EXPORT',
        resource: 'user_data',
        resourceId: request.userId,
        metadata: {
          requestId,
          dataTypes: Object.keys(userData),
          recordCount: this.countRecords(userData)
        },
        riskLevel: 'HIGH'
      })

      return userData
    } catch (error) {
      console.error('[GDPR] Failed to process data export:', error)
      
      // Update request status to failed
      await prisma.dataPrivacyRequest.update({
        where: { id: requestId },
        data: {
          status: PrivacyRequestStatus.REJECTED,
          notes: error instanceof Error ? error.message : 'Processing failed'
        }
      })

      throw error
    }
  }

  /**
   * Process data deletion request
   */
  async processDataDeletion(requestId: string, processedById: string): Promise<void> {
    try {
      const request = await prisma.dataPrivacyRequest.findUnique({
        where: { id: requestId },
        include: { user: true }
      })

      if (!request || request.requestType !== PrivacyRequestType.DATA_DELETION) {
        throw new Error('Invalid data deletion request')
      }

      const options = request.requestedData as any
      const userId = request.userId

      // Perform deletion or anonymization
      if (options.anonymizeInstead) {
        await this.anonymizeUserData(userId, options.retainLegalData)
      } else {
        await this.deleteUserData(userId, options.retainLegalData)
      }

      // Update request status
      await prisma.dataPrivacyRequest.update({
        where: { id: requestId },
        data: {
          status: PrivacyRequestStatus.COMPLETED,
          processedById,
          processedAt: new Date(),
          processedData: {
            action: options.anonymizeInstead ? 'anonymized' : 'deleted',
            retainedLegalData: options.retainLegalData,
            processedAt: new Date()
          }
        }
      })

      // Log the processing
      await auditLogger.log({
        userId: processedById,
        action: 'DELETE',
        resource: 'user_data',
        resourceId: userId,
        metadata: {
          requestId,
          action: options.anonymizeInstead ? 'anonymized' : 'deleted',
          retainedLegalData: options.retainLegalData
        },
        riskLevel: 'CRITICAL'
      })

    } catch (error) {
      console.error('[GDPR] Failed to process data deletion:', error)
      
      // Update request status to failed
      await prisma.dataPrivacyRequest.update({
        where: { id: requestId },
        data: {
          status: PrivacyRequestStatus.REJECTED,
          notes: error instanceof Error ? error.message : 'Processing failed'
        }
      })

      throw error
    }
  }

  /**
   * Record user consent
   */
  async recordConsent(consent: ConsentRecord): Promise<void> {
    try {
      // In a real implementation, you would have a separate consent table
      // For now, we'll use the audit log to track consent
      await auditLogger.log({
        userId: consent.userId,
        action: 'CREATE',
        resource: 'user_consent',
        newValues: {
          consentType: consent.consentType,
          granted: consent.granted,
          timestamp: consent.timestamp,
          ipAddress: consent.ipAddress,
          userAgent: consent.userAgent
        },
        riskLevel: 'LOW'
      })
    } catch (error) {
      console.error('[GDPR] Failed to record consent:', error)
      throw new Error('Failed to record user consent')
    }
  }

  /**
   * Check data retention compliance
   */
  async checkDataRetentionCompliance(): Promise<{
    totalRecords: number
    expiredRecords: number
    complianceRate: number
    expiredUsers: string[]
  }> {
    const retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000 // 7 years in milliseconds
    const cutoffDate = new Date(Date.now() - retentionPeriod)

    // Find users who haven't been active for the retention period
    const expiredUsers = await prisma.user.findMany({
      where: {
        updatedAt: { lt: cutoffDate },
        status: { not: 'ACTIVE' }
      },
      select: { id: true, email: true, updatedAt: true }
    })

    const totalUsers = await prisma.user.count()
    const complianceRate = totalUsers > 0 ? ((totalUsers - expiredUsers.length) / totalUsers) * 100 : 100

    return {
      totalRecords: totalUsers,
      expiredRecords: expiredUsers.length,
      complianceRate,
      expiredUsers: expiredUsers.map(u => u.id)
    }
  }

  /**
   * Generate GDPR compliance report
   */
  async generateComplianceReport(): Promise<GDPRReport> {
    const [
      totalUsers,
      pendingRequests,
      completedRequests,
      retentionCompliance,
      encryptionStats,
      lastAudit
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dataPrivacyRequest.count({ where: { status: PrivacyRequestStatus.PENDING } }),
      prisma.dataPrivacyRequest.count({ where: { status: PrivacyRequestStatus.COMPLETED } }),
      this.checkDataRetentionCompliance(),
      EncryptionService.getEncryptionStats(),
      prisma.auditLog.findFirst({
        where: { resource: 'gdpr_audit' },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return {
      totalUsers,
      activeConsents: totalUsers, // Simplified - in reality, you'd track actual consents
      pendingRequests,
      completedRequests,
      dataRetentionCompliance: retentionCompliance.complianceRate,
      encryptedDataRecords: encryptionStats.totalEncryptedRecords,
      lastAuditDate: lastAudit?.createdAt
    }
  }

  /**
   * Get user's data privacy requests
   */
  async getUserPrivacyRequests(userId: string): Promise<any[]> {
    return prisma.dataPrivacyRequest.findMany({
      where: { userId },
      include: {
        processedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Collect all user data for export
   */
  private async collectUserData(userId: string, options: any): Promise<any> {
    const userData: any = {
      metadata: {
        userId,
        exportedAt: new Date().toISOString(),
        format: options.format || 'json'
      },
      personalData: {},
      activityLogs: [],
      documents: []
    }

    if (options.includePersonalData) {
      // Get user profile data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          employeeProfile: true
        }
      })

      if (user) {
        userData.personalData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          jobTitle: user.jobTitle,
          department: user.department,
          phone: user.phone,
          startDate: user.startDate,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }

        // Get encrypted sensitive data
        const sensitiveData = await EncryptionService.decryptUserSensitiveData(userId)
        userData.personalData.sensitiveData = sensitiveData
      }
    }

    if (options.includeActivityLogs) {
      // Get user's audit logs
      userData.activityLogs = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 1000 // Limit to last 1000 entries
      })
    }

    if (options.includeDocuments) {
      // Get user's documents
      userData.documents = await prisma.document.findMany({
        where: { uploadedById: userId },
        select: {
          id: true,
          title: true,
          fileName: true,
          fileType: true,
          createdAt: true
        }
      })
    }

    return userData
  }

  /**
   * Delete user data while retaining legal requirements
   */
  private async deleteUserData(userId: string, retainLegalData: boolean): Promise<void> {
    if (retainLegalData) {
      // Anonymize personal data but keep records for legal compliance
      await this.anonymizeUserData(userId, true)
    } else {
      // Complete deletion (use with caution)
      await prisma.$transaction(async (tx) => {
        // Delete in correct order to handle foreign key constraints
        await tx.auditLog.deleteMany({ where: { userId } })
        await tx.timeEntry.deleteMany({ where: { userId } })
        await tx.checkIn.deleteMany({ where: { userId } })
        await tx.taskAssignee.deleteMany({ where: { userId } })
        await tx.projectMember.deleteMany({ where: { userId } })
        await tx.document.deleteMany({ where: { uploadedById: userId } })
        await tx.employeeProfile.deleteMany({ where: { userId } })
        await tx.encryptedData.deleteMany({ where: { recordId: userId, tableName: 'User' } })
        await tx.user.delete({ where: { id: userId } })
      })
    }
  }

  /**
   * Anonymize user data
   */
  private async anonymizeUserData(userId: string, retainLegalData: boolean): Promise<void> {
    const anonymizedEmail = `anonymized_${Date.now()}@deleted.local`
    const anonymizedName = 'Anonymized User'

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        firstName: anonymizedName,
        lastName: '',
        name: anonymizedName,
        phone: null,
        nationalId: null,
        avatar: null,
        bio: null,
        emergencyContact: null,
        status: 'INACTIVE'
      }
    })

    // Remove encrypted sensitive data
    await prisma.encryptedData.deleteMany({
      where: { recordId: userId, tableName: 'User' }
    })

    if (!retainLegalData) {
      // Also anonymize employee profile if not retaining legal data
      await prisma.employeeProfile.updateMany({
        where: { userId },
        data: {
          fullName: anonymizedName,
          phone: null,
          email: anonymizedEmail,
          address: null,
          nationalId: null
        }
      })
    }
  }

  /**
   * Count records in exported data
   */
  private countRecords(userData: any): number {
    let count = 0
    if (userData.personalData) count += 1
    if (userData.activityLogs) count += userData.activityLogs.length
    if (userData.documents) count += userData.documents.length
    return count
  }
}

// Export singleton instance
export const gdprService = GDPRComplianceService.getInstance()

// Export convenience functions
export const requestDataExport = gdprService.requestDataExport.bind(gdprService)
export const requestDataDeletion = gdprService.requestDataDeletion.bind(gdprService)
export const processDataExport = gdprService.processDataExport.bind(gdprService)
export const processDataDeletion = gdprService.processDataDeletion.bind(gdprService)
export const recordConsent = gdprService.recordConsent.bind(gdprService)
export const generateComplianceReport = gdprService.generateComplianceReport.bind(gdprService)
export const checkDataRetentionCompliance = gdprService.checkDataRetentionCompliance.bind(gdprService)