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
    if (!hasPermission(userRole, 'VIEW_STIPENDS')) {
      return new NextResponse(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
      })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (department && department !== 'all') {
      where.department = department
    }

    const [stipends, total] = await Promise.all([
      db.stipend.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
              email: true,
              department: true,
              jobTitle: true,
            }
          },
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
        },
        skip,
        take: limit,
      }),
      db.stipend.count({ where })
    ])

    return NextResponse.json({
      stipends: stipends.map(stipend => ({
        ...stipend,
        employee: {
          ...stipend.employee,
          name: stipend.employee.name || `${stipend.employee.firstName || ''} ${stipend.employee.lastName || ''}`.trim()
        },
        approvedBy: stipend.approvedBy ? {
          ...stipend.approvedBy,
          name: stipend.approvedBy.name || `${stipend.approvedBy.firstName || ''} ${stipend.approvedBy.lastName || ''}`.trim()
        } : null
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching stipends:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch stipends" }), {
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
    if (!hasPermission(userRole, 'CREATE_STIPENDS')) {
      return new NextResponse(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
      })
    }

    const body = await req.json()
    const {
      employeeId,
      amount,
      type,
      paymentMethod,
      remarks,
      department,
      paymentDate
    } = body

    // Validate required fields
    if (!employeeId || !amount || !type) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      })
    }

    // Check if employee exists
    const employee = await db.user.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return new NextResponse(JSON.stringify({ error: "Employee not found" }), {
        status: 404,
      })
    }

    const stipend = await db.stipend.create({
      data: {
        employeeId,
        amount: parseFloat(amount),
        type,
        status: 'PENDING',
        paymentMethod: paymentMethod || null,
        remarks: remarks || null,
        department: department || employee.department,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            email: true,
            department: true,
            jobTitle: true,
          }
        }
      }
    })

    return NextResponse.json({
      ...stipend,
      employee: {
        ...stipend.employee,
        name: stipend.employee.name || `${stipend.employee.firstName || ''} ${stipend.employee.lastName || ''}`.trim()
      }
    })
  } catch (error) {
    console.error("Error creating stipend:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to create stipend" }), {
      status: 500,
    })
  }
}