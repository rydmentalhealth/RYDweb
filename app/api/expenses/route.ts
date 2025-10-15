import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const expenseRequestSchema = z.object({
  purpose: z.string().min(1),
  category: z.enum(['TRANSPORT', 'PRINTING', 'OUTREACH_EVENT', 'OFFICE_SUPPLIES', 'COMMUNICATION', 'TRAINING', 'MEETING_EXPENSES', 'EQUIPMENT', 'MAINTENANCE', 'OTHER']),
  amount: z.number().positive(),
  description: z.string().optional(),
  department: z.string().optional(),
  projectId: z.string().optional(),
  budgetId: z.string().optional(),
})

// GET /api/expenses - Get all expense requests with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (department) where.department = department
    if (status) where.status = status
    if (category) where.category = category

    const [expenses, total] = await Promise.all([
      prisma.expenseRequest.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              jobTitle: true,
            }
          },
          teamLead: {
            select: {
              id: true,
              name: true,
            }
          },
          financeApprovedBy: {
            select: {
              id: true,
              name: true,
            }
          },
          directorApprovedBy: {
            select: {
              id: true,
              name: true,
            }
          },
          project: {
            select: {
              id: true,
              name: true,
            }
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileUrl: true,
              fileType: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expenseRequest.count({ where })
    ])

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/expenses - Create new expense request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = expenseRequestSchema.parse(body)

    // Get user's department if not provided
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { department: true }
    })

    const expense = await prisma.expenseRequest.create({
      data: {
        ...validatedData,
        requesterId: session.user.id,
        department: validatedData.department || user?.department,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            jobTitle: true,
          }
        },
        project: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating expense request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
