import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getAllTeams, createTeam, type CreateTeamData } from "@/lib/services/team-service"
import { z } from "zod"

// Validation schema for team creation/update
const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET /api/teams - Get all teams
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeMembers = searchParams.get('includeMembers') === 'true'
    const includeTasks = searchParams.get('includeTasks') === 'true'
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const teams = await getAllTeams({
      includeMembers,
      includeTasks,
      activeOnly
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    )
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has permission to create teams (ADMIN or STAFF)
    if (!['ADMIN', 'STAFF', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createTeamSchema.parse(body)

    const team = await createTeam(validatedData as CreateTeamData)

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("Error creating team:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Team with this name already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    )
  }
} 