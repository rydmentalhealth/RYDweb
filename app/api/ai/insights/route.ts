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

    // For now, return mock AI insights
    // In a real implementation, this would connect to ML models and analyze actual data
    const mockInsights = [
      {
        id: "insight-1",
        type: "PREDICTION",
        title: "Budget Overrun Alert: IT Department",
        description: "Based on current spending patterns, the IT department is projected to exceed its monthly budget by 15% (UGX 300,000) within the next 2 weeks.",
        confidence: 87,
        impact: "HIGH",
        category: "BUDGET",
        actionable: true,
        createdAt: new Date().toISOString(),
        status: "NEW"
      },
      {
        id: "insight-2",
        type: "ANOMALY",
        title: "Unusual Expense Pattern Detected",
        description: "Transport expenses have increased by 45% compared to the same period last month. This may indicate inefficient routing or increased fuel costs.",
        confidence: 92,
        impact: "MEDIUM",
        category: "EXPENSE",
        actionable: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: "NEW"
      },
      {
        id: "insight-3",
        type: "RECOMMENDATION",
        title: "Optimize Stipend Payment Schedule",
        description: "Consolidating stipend payments to bi-weekly cycles could reduce processing costs by UGX 50,000 per month and improve cash flow management.",
        confidence: 78,
        impact: "MEDIUM",
        category: "STIPEND",
        actionable: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        status: "NEW"
      },
      {
        id: "insight-4",
        type: "OPTIMIZATION",
        title: "Vendor Consolidation Opportunity",
        description: "Analysis shows that 3 office supply vendors could be consolidated into 1, potentially saving 12% on procurement costs (UGX 180,000 annually).",
        confidence: 85,
        impact: "HIGH",
        category: "EFFICIENCY",
        actionable: true,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        status: "REVIEWED"
      },
      {
        id: "insight-5",
        type: "ALERT",
        title: "Cash Flow Projection Warning",
        description: "Current spending rate suggests potential cash flow constraints in 6 weeks. Consider adjusting discretionary spending or securing additional funding.",
        confidence: 91,
        impact: "CRITICAL",
        category: "CASH_FLOW",
        actionable: true,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        status: "NEW"
      }
    ]

    return NextResponse.json({
      insights: mockInsights
    })
  } catch (error) {
    console.error("Error fetching AI insights:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch AI insights" }), {
      status: 500,
    })
  }
}