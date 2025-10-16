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
    if (!hasPermission(userRole, 'VIEW_BUDGETS')) {
      return new NextResponse(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
      })
    }

    // Get current date for filtering
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Fetch budget statistics
    const budgets = await db.departmentBudget.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            expenses: true
          }
        }
      }
    })

    // Calculate statistics
    const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0)
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0)
    const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remainingAmount, 0)
    
    const overBudgetDepartments = budgets.filter(budget => 
      budget.spentAmount > budget.allocatedAmount
    ).length
    
    const nearLimitDepartments = budgets.filter(budget => {
      const utilization = budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0
      return utilization >= 80 && utilization < 100
    }).length

    const averageUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

    // Generate monthly trend (mock data for now)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        allocated: totalAllocated * (0.8 + Math.random() * 0.4),
        spent: totalSpent * (0.6 + Math.random() * 0.8)
      })
    }

    // Department comparison
    const departmentComparison = budgets.map(budget => ({
      department: budget.department,
      allocated: budget.allocatedAmount,
      spent: budget.spentAmount,
      utilization: budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0
    }))

    return NextResponse.json({
      totalAllocated,
      totalSpent,
      totalRemaining,
      overBudgetDepartments,
      nearLimitDepartments,
      averageUtilization,
      monthlyTrend,
      departmentComparison
    })
  } catch (error) {
    console.error("Error fetching budget stats:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch budget statistics" }), {
      status: 500,
    })
  }
}