import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, UserRole, UserStatus } from '@/lib/generated/prisma'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Get a single team member by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has permission to view team members
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    
    const { id } = await context.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        nationalId: true,
        role: true,
        status: true,
        district: true,
        region: true,
        availability: true,
        languages: true,
        skills: true,
        emergencyContact: true,
        jobTitle: true,
        department: true,
        createdAt: true,
        approvedAt: true,
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
    console.error('Error fetching team member:', error)
    return NextResponse.json(
      { message: 'Error fetching team member' },
      { status: 500 }
    )
  }
}

// PUT or PATCH - Update a team member
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has permission to update team members
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 })
    }
    
    const { id } = await context.params;
    const body = await request.json()
    
    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if this is an approval (status changing from PENDING to ACTIVE)
    const isApproval = existingUser.status === 'PENDING' && body.status === 'ACTIVE'
    
    // Prepare update data
    const updateData: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      name: body.firstName && body.lastName ? `${body.firstName} ${body.lastName}` : undefined,
      email: body.email,
      avatar: body.avatar,
      phone: body.phone,
      nationalId: body.nationalId,
      role: body.role ? (body.role as UserRole) : undefined,
      status: body.status ? (body.status as UserStatus) : undefined,
      district: body.district,
      region: body.region,
      availability: body.availability,
      languages: body.languages,
      skills: body.skills,
      emergencyContact: body.emergencyContact,
      jobTitle: body.jobTitle,
      department: body.department,
    }
    
    // If this is an approval, set approval fields
    if (isApproval) {
      updateData.approvedAt = new Date()
      updateData.approvedById = session.user.id
    }
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        avatar: true,
        phone: true,
        nationalId: true,
        role: true,
        status: true,
        district: true,
        region: true,
        availability: true,
        languages: true,
        skills: true,
        emergencyContact: true,
        jobTitle: true,
        department: true,
        createdAt: true,
        approvedAt: true,
      }
    })
    
    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { message: 'Error updating team member' },
      { status: 500 }
    )
  }
}

// Alias PATCH to PUT
export const PATCH = PUT

// DELETE - Delete a team member
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has permission to delete team members
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 })
    }
    
    const { id } = await context.params;
    
    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { message: 'Team member deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { message: 'Error deleting team member' },
      { status: 500 }
    )
  }
} 