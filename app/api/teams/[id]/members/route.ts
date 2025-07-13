import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { addTeamMember, type AddTeamMemberData } from "@/lib/services/team-service"
import { z } from "zod"

const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.string().optional()
})

// POST /api/teams/[id]/members - Add a member to a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: teamId } = await params
    const body = await request.json()
    const validatedData = addMemberSchema.parse(body)

    const teamMember = await addTeamMember({
      teamId,
      userId: validatedData.userId,
      role: validatedData.role as any
    })

    return NextResponse.json(teamMember, { status: 201 })
  } catch (error) {
    console.error("Error adding team member:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        )
      }
      
      if (error.message.includes("already a member")) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }
      
      if (error.message.includes("Cannot add user")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    )
  }
} 