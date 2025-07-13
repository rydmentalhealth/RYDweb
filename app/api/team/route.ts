import { NextRequest, NextResponse } from 'next/server'
import { UserRole, UserStatus } from '@/lib/generated/prisma'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Get all team members (users with staff/volunteer roles)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has permission to view team members
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    
    const teamMembers = await db.user.findMany({
      where: {
        role: {
          in: ['STAFF', 'VOLUNTEER']
        },
        status: {
          in: ['ACTIVE', 'PENDING']
        }
      },
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
      },
      orderBy: { firstName: 'asc' }
    })
    return NextResponse.json(teamMembers, { status: 200 })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { message: 'Error fetching team members' },
      { status: 500 }
    )
  }
}

// POST - Create a new team member (redirect to admin user creation)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has permission to create team members
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { message: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }
    
    // Check if a user with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email: body.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 409 }
      )
    }
    
    // Create the new user as team member
    const newUser = await db.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        name: `${body.firstName} ${body.lastName}`,
        email: body.email,
        avatar: body.avatar,
        phone: body.phone,
        nationalId: body.nationalId,
        role: (body.role as UserRole) || UserRole.VOLUNTEER,
        status: UserStatus.ACTIVE, // Admin-created users are immediately active
        district: body.district,
        region: body.region,
        availability: body.availability || 'PART_TIME',
        languages: body.languages,
        skills: body.skills,
        emergencyContact: body.emergencyContact,
        jobTitle: body.jobTitle,
        department: body.department,
        approvedAt: new Date(),
        approvedById: session.user.id,
      },
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
    
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { message: 'Error creating team member' },
      { status: 500 }
    )
  }
}

// PATCH - Update a team member
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has permission to update team members
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 })
    }
    
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Check if the user exists
    const existingUser = await db.user.findUnique({
      where: { id: body.id }
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
    const updatedUser = await db.user.update({
      where: { id: body.id },
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

// DELETE - Delete a team member
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has permission to delete team members
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 })
    }
    
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Check if the user exists
    const existingUser = await db.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Delete the user
    await db.user.delete({
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