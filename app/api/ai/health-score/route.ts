import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hasPermission } from "@/lib/auth/rbac"
import { UserRole } from "@/lib/generated/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const userRole = session.user.role as UserRole
    if (!hasPermission(userRole, 'VIEW_FINANCIAL_REPORTS')) {
      return new NextResponse(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
      })
    }

    // In a real implementation, this would calculate actual health scores based on:
    // - Budget adherence
    // - Expense approval times
    // - Cash flow stability
    // - Compliance metrics
    // - Efficiency indicators

    // Mock health score calculation
    const mockHealthScore = {
      overall: 82,
      budgetManagement: 78,
      expenseControl: 85,
      cashFlow: 88,
      efficiency: 75,
      compliance: 92,
      trends: [
        { month: "Jul 2024", score: 75 },
        { month: "Aug 2024", score: 78 },
        { month: "Sep 2024", score: 80 },
        { month: "Oct 2024", score: 82 },
        { month: "Nov 2024", score: 85 },
        { month: "Dec 2024", score: 82 }
      ]
    }

    return NextResponse.json(mockHealthScore)
  } catch (error) {
    console.error("Error fetching health score:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch health score" }), {
      status: 500,
    })
  }
}