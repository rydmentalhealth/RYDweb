import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole, AuditAction, RiskLevel } from '@prisma/client'

// Get audit logs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Super Admin and Admin can view audit logs
    if (![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action') as AuditAction | null
    const resource = searchParams.get('resource')
    const riskLevel = searchParams.get('riskLevel') as RiskLevel | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (userId) where.userId = userId
    if (action) where.action = action
    if (resource) where.resource = resource
    if (riskLevel) where.riskLevel = riskLevel
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
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
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ])

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        user: log.user ? {
          id: log.user.id,
          name: `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email,
          email: log.user.email,
          role: log.user.role
        } : null,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        riskLevel: log.riskLevel,
        status: log.status,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        location: log.location,
        createdAt: log.createdAt,
        metadata: log.metadata
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Audit logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

// Create audit log entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const body = await request.json()
    
    const {
      action,
      resource,
      resourceId,
      oldValues,
      newValues,
      riskLevel = 'LOW',
      metadata
    } = body

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: action as AuditAction,
        resource,
        resourceId,
        oldValues: oldValues || null,
        newValues: newValues || null,
        ipAddress,
        userAgent,
        riskLevel: riskLevel as RiskLevel,
        status: 'SUCCESS',
        metadata: metadata || null
      }
    })

    return NextResponse.json({ success: true, logId: auditLog.id })

  } catch (error) {
    console.error('Create audit log error:', error)
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    )
  }
}