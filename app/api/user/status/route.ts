import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    // Get the latest user status from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        status: true,
        role: true,
        email: true,
      }
    })
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      status: user.status,
      role: user.role,
      hasStatusChanged: user.status !== session.user.status
    })
  } catch (error) {
    console.error('Error checking user status:', error)
    return NextResponse.json(
      { message: 'Error checking status' },
      { status: 500 }
    )
  }
} 