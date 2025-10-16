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

    const { searchParams } = new URL(req.url)
    const department = searchParams.get('department')
    const period = searchParams.get('period')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (department && department !== 'all') {
      where.department = department
    }
    if (period && period !== 'all') {
      where.budgetPeriod = period
    }

    const [budgets, total] = await Promise.all([
      db.departmentBudget.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
            }
          },
          lastModifiedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
            }
          },
          adjustments: {
            include: {
              approvedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  name: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              expenses: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      db.departmentBudget.count({ where })
    ])

    return NextResponse.json({
      budgets: budgets.map(budget => ({
        ...budget,
        createdBy: {
          ...budget.createdBy,
          name: budget.createdBy.name || `${budget.createdBy.firstName || ''} ${budget.createdBy.lastName || ''}`.trim()
        },
        lastModifiedBy: budget.lastModifiedBy ? {
          ...budget.lastModifiedBy,
          name: budget.lastModifiedBy.name || `${budget.lastModifiedBy.firstName || ''} ${budget.lastModifiedBy.lastName || ''}`.trim()
        } : null,
        adjustments: budget.adjustments.map(adj => ({
          ...adj,
          approvedBy: {
            ...adj.approvedBy,
            name: adj.approvedBy.name || `${adj.approvedBy.firstName || ''} ${adj.approvedBy.lastName || ''}`.trim()
          }
        }))
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch budgets" }), {
      status: 500,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const userRole = session.user.role as UserRole
    if (!hasPermission(userRole, 'CREATE_BUDGETS')) {
      return new NextResponse(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
      })
    }

    const body = await req.json()
    const {
      department,
      budgetPeriod,
      allocatedAmount
    } = body

    // Validate required fields
    if (!department || !budgetPeriod || !allocatedAmount) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      })
    }

    // Check if budget already exists for this department and period
    const existingBudget = await db.departmentBudget.findFirst({
      where: {
        department,
        budgetPeriod,
        isActive: true
      }
    })

    if (existingBudget) {
      return new NextResponse(JSON.stringify({ error: "Budget already exists for this department and period" }), {
        status: 409,
      })
    }

    const budget = await db.departmentBudget.create({
      data: {
        department,
        budgetPeriod,
        allocatedAmount: parseFloat(allocatedAmount),
        remainingAmount: parseFloat(allocatedAmount),
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
          }
        },
        _count: {
          select: {
            expenses: true
          }
        }
      }
    })

    return NextResponse.json({
      ...budget,
      createdBy: {
        ...budget.createdBy,
        name: budget.createdBy.name || `${budget.createdBy.firstName || ''} ${budget.createdBy.lastName || ''}`.trim()
      }
    })
  } catch (error) {
    console.error("Error creating budget:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to create budget" }), {
      status: 500,
    })
  }
}