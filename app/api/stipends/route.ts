import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const stipendSchema = z.object({
  employeeId: z.string(),
  amount: z.number().positive(),
  type: z.enum(['MONTHLY_STIPEND', 'ALLOWANCE', 'REIMBURSEMENT', 'BONUS', 'VOLUNTEER_ALLOWANCE', 'TRANSPORT_ALLOWANCE', 'MEAL_ALLOWANCE']),
  paymentMethod: z.enum(['MOBILE_MONEY', 'BANK_TRANSFER', 'CASH', 'CHEQUE']).optional(),
  remarks: z.string().optional(),
  department: z.string().optional(),
})

// GET /api/stipends - Get all stipends with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (department) where.department = department
    if (status) where.status = status
    if (type) where.type = type

    const [stipends, total] = await Promise.all([
      prisma.stipend.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              jobTitle: true,
            }
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stipend.count({ where })
    ])

    return NextResponse.json({
      stipends,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching stipends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/stipends - Create new stipend
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create stipends
    if (!['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = stipendSchema.parse(body)

    // Get employee details
    const employee = await prisma.user.findUnique({
      where: { id: validatedData.employeeId },
      select: { department: true }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const stipend = await prisma.stipend.create({
      data: {
        ...validatedData,
        department: validatedData.department || employee.department,
        approvedById: session.user.id,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            jobTitle: true,
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json(stipend, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating stipend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
