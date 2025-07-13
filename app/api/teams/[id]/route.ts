import { NextRequest, NextResponse } from "next/server"
import { 
  getTeamById, 
  updateTeam, 
  deleteTeam, 
  type UpdateTeamData 
} from "@/lib/services/team-service"
import { z } from "zod"

const updateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET /api/teams/[id] - Get a specific team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const includeMembers = searchParams.get('includeMembers') === 'true'
    const includeTasks = searchParams.get('includeTasks') === 'true'

    const team = await getTeamById(id, {
      includeMembers,
      includeTasks
    })

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    )
  }
}

// PATCH /api/teams/[id] - Update a team
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateTeamSchema.parse(body)

    const team = await updateTeam(id, validatedData as UpdateTeamData)

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error updating team:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Team with this name already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await deleteTeam(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team:", error)
    
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    )
  }
}