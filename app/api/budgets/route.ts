import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const budgetSchema = z.object({
  department: z.string().min(1),
  budgetPeriod: z.string().min(1), // e.g., "2025-01"
  allocatedAmount: z.number().positive(),
})

// GET /api/budgets - Get all departmental budgets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const period = searchParams.get('period')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (department) where.department = department
    if (period) where.budgetPeriod = period
    if (isActive !== null) where.isActive = isActive === 'true'

    const budgets = await prisma.departmentBudget.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        },
        lastModifiedBy: {
          select: {
            id: true,
            name: true,
          }
        },
        adjustments: {
          include: {
            approvedBy: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            expenses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ budgets })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/budgets - Create new departmental budget
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create budgets
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = budgetSchema.parse(body)

    // Check if budget already exists for this department and period
    const existingBudget = await prisma.departmentBudget.findFirst({
      where: {
        department: validatedData.department,
        budgetPeriod: validatedData.budgetPeriod,
      }
    })

    if (existingBudget) {
      return NextResponse.json({ 
        error: 'Budget already exists for this department and period' 
      }, { status: 400 })
    }

    const budget = await prisma.departmentBudget.create({
      data: {
        ...validatedData,
        remainingAmount: validatedData.allocatedAmount,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating budget:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
