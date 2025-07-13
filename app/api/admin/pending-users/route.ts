import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@/lib/generated/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view pending users
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const prisma = new PrismaClient()

    try {
      const users = await prisma.user.findMany({
        where: {
          status: 'PENDING'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const count = users.length

      return NextResponse.json({ count, users })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error fetching pending users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 