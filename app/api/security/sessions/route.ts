import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

// Get active security sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const showAll = searchParams.get('showAll') === 'true'

    // Check permissions - users can see their own sessions, admins can see all
    const canViewAllSessions = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(session.user.role)
    
    if (!canViewAllSessions && userId && userId !== session.user.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const where: any = {
      isActive: true,
      expiresAt: { gt: new Date() }
    }

    if (userId) {
      where.userId = userId
    } else if (!canViewAllSessions) {
      where.userId = session.user.id
    }

    const sessions = await prisma.securitySession.findMany({
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
      orderBy: { lastActivity: 'desc' },
      take: showAll ? undefined : 50
    })

    return NextResponse.json({
      sessions: sessions.map(s => ({
        id: s.id,
        user: {
          id: s.user.id,
          name: `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() || s.user.email,
          email: s.user.email,
          role: s.user.role
        },
        ipAddress: s.ipAddress,
        location: s.location,
        deviceInfo: s.deviceInfo,
        lastActivity: s.lastActivity,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt
      }))
    })

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

// Terminate session
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const terminateAll = searchParams.get('terminateAll') === 'true'

    if (!sessionId && !terminateAll) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    if (terminateAll) {
      // Terminate all sessions for the current user
      await prisma.securitySession.updateMany({
        where: {
          userId: session.user.id,
          isActive: true
        },
        data: {
          isActive: false,
          terminatedAt: new Date(),
          terminatedBy: session.user.id
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'LOGOUT',
          resource: 'security_sessions',
          newValues: { action: 'terminate_all_sessions' },
          riskLevel: 'MEDIUM'
        }
      })

      return NextResponse.json({ success: true, message: 'All sessions terminated' })
    } else {
      // Terminate specific session
      const targetSession = await prisma.securitySession.findUnique({
        where: { id: sessionId! }
      })

      if (!targetSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      // Check permissions - users can only terminate their own sessions
      const canTerminateAnySession = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(session.user.role)
      
      if (!canTerminateAnySession && targetSession.userId !== session.user.id) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      await prisma.securitySession.update({
        where: { id: sessionId! },
        data: {
          isActive: false,
          terminatedAt: new Date(),
          terminatedBy: session.user.id
        }
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'LOGOUT',
          resource: 'security_sessions',
          resourceId: sessionId,
          newValues: { 
            action: 'terminate_session',
            targetUserId: targetSession.userId
          },
          riskLevel: targetSession.userId !== session.user.id ? 'HIGH' : 'LOW'
        }
      })

      return NextResponse.json({ success: true, message: 'Session terminated' })
    }

  } catch (error) {
    console.error('Terminate session error:', error)
    return NextResponse.json(
      { error: 'Failed to terminate session' },
      { status: 500 }
    )
  }
}