import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { removeTeamMember } from "@/lib/services/team-service"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateMemberSchema = z.object({
  role: z.enum(["LEADER", "COORDINATOR", "MEMBER"])
})

// PATCH /api/teams/[id]/members/[userId] - Update team member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has permission to manage team members
    if (!['ADMIN', 'STAFF', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id: teamId, userId } = await params
    const body = await request.json()
    const { role } = updateMemberSchema.parse(body)

    // Check if the user is a member of the team
    const existingMember = await prisma.userTeam.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId
        }
      }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 404 }
      )
    }

    // Update the member's role
    const updatedMember = await prisma.userTeam.update({
      where: {
        userId_teamId: {
          userId,
          teamId
        }
      },
      data: {
        role
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            status: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating team member role:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update team member role" },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id]/members/[userId] - Remove member from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has permission to manage team members
    if (!['ADMIN', 'STAFF', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { id: teamId, userId } = await params

    await removeTeamMember(userId, teamId)

    return NextResponse.json({ message: "Team member removed successfully" })
  } catch (error) {
    console.error("Error removing team member:", error)
    
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    )
  }
} 