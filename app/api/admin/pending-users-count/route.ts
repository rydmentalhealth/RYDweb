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
      const count = await prisma.user.count({
        where: {
          status: 'PENDING'
        }
      })

      return NextResponse.json({ count })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error fetching pending users count:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 