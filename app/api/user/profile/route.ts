import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, UserStatus, Availability } from '@/lib/generated/prisma'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// PATCH - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const userId = session.user.id
    
    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Prepare update data - only allow profile fields, not status/role changes
    const updateData: any = {}
    
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.avatar !== undefined) updateData.avatar = body.avatar
    if (body.bio !== undefined) updateData.bio = body.bio
    if (body.location !== undefined) updateData.location = body.location
    if (body.district !== undefined) updateData.district = body.district
    if (body.region !== undefined) updateData.region = body.region
    if (body.languages !== undefined) updateData.languages = body.languages
    if (body.skills !== undefined) updateData.skills = body.skills
    if (body.emergencyContact !== undefined) updateData.emergencyContact = body.emergencyContact
    if (body.availability !== undefined) updateData.availability = body.availability as Availability
    
    // Update computed name field if first and last names are provided
    if (body.firstName && body.lastName) {
      updateData.name = `${body.firstName} ${body.lastName}`
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        location: true,
        district: true,
        region: true,
        languages: true,
        skills: true,
        emergencyContact: true,
        availability: true,
        updatedAt: true,
      }
    })
    
    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { message: 'Error updating profile' },
      { status: 500 }
    )
  }
}

// GET - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    const userId = session.user.id
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        location: true,
        district: true,
        region: true,
        languages: true,
        skills: true,
        emergencyContact: true,
        availability: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { message: 'Error fetching profile' },
      { status: 500 }
    )
  }
} 