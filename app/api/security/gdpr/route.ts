import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { gdprService } from '@/lib/services/gdpr-compliance'
import { UserRole } from '@prisma/client'

// Get GDPR compliance status and user's privacy requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId') || session.user.id

    // Check permissions - users can only access their own data unless they're admin
    const canAccessOtherUsers = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_OFFICER].includes(session.user.role)
    if (userId !== session.user.id && !canAccessOtherUsers) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    switch (action) {
      case 'compliance-report':
        // Only admins can view compliance reports
        if (!canAccessOtherUsers) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
        const report = await gdprService.generateComplianceReport()
        return NextResponse.json(report)

      case 'user-requests':
        const requests = await gdprService.getUserPrivacyRequests(userId)
        return NextResponse.json({ requests })

      case 'retention-compliance':
        if (!canAccessOtherUsers) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
        const compliance = await gdprService.checkDataRetentionCompliance()
        return NextResponse.json(compliance)

      default:
        // Default: return user's privacy requests
        const userRequests = await gdprService.getUserPrivacyRequests(userId)
        return NextResponse.json({ requests: userRequests })
    }

  } catch (error) {
    console.error('GDPR API error:', error)
    return NextResponse.json(
      { error: 'Failed to process GDPR request' },
      { status: 500 }
    )
  }
}

// Submit GDPR requests (data export, deletion, etc.)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { requestType, ...requestData } = body

    switch (requestType) {
      case 'data-export':
        const exportRequestId = await gdprService.requestDataExport({
          userId: requestData.userId || session.user.id,
          requestedData: requestData.requestedData,
          format: requestData.format || 'json',
          includePersonalData: requestData.includePersonalData ?? true,
          includeActivityLogs: requestData.includeActivityLogs ?? false,
          includeDocuments: requestData.includeDocuments ?? false
        }, session.user.id)

        return NextResponse.json({ 
          success: true, 
          requestId: exportRequestId,
          message: 'Data export request submitted successfully'
        })

      case 'data-deletion':
        const deletionRequestId = await gdprService.requestDataDeletion({
          userId: requestData.userId || session.user.id,
          retainLegalData: requestData.retainLegalData ?? true,
          anonymizeInstead: requestData.anonymizeInstead ?? true,
          reason: requestData.reason
        }, session.user.id)

        return NextResponse.json({ 
          success: true, 
          requestId: deletionRequestId,
          message: 'Data deletion request submitted successfully'
        })

      case 'consent':
        await gdprService.recordConsent({
          userId: session.user.id,
          consentType: requestData.consentType,
          granted: requestData.granted,
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        })

        return NextResponse.json({ 
          success: true,
          message: 'Consent recorded successfully'
        })

      default:
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
    }

  } catch (error) {
    console.error('GDPR request error:', error)
    return NextResponse.json(
      { error: 'Failed to submit GDPR request' },
      { status: 500 }
    )
  }
}

// Process GDPR requests (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can process GDPR requests
    const canProcessRequests = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_OFFICER].includes(session.user.role)
    if (!canProcessRequests) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { requestId, action } = body

    switch (action) {
      case 'process-export':
        const exportData = await gdprService.processDataExport(requestId, session.user.id)
        return NextResponse.json({ 
          success: true, 
          data: exportData,
          message: 'Data export processed successfully'
        })

      case 'process-deletion':
        await gdprService.processDataDeletion(requestId, session.user.id)
        return NextResponse.json({ 
          success: true,
          message: 'Data deletion processed successfully'
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('GDPR processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process GDPR request' },
      { status: 500 }
    )
  }
}