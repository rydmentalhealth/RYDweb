import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hasPermission } from "@/lib/auth/rbac"
import { UserRole } from "@/lib/generated/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const stipend = await db.stipend.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!stipend) {
      return new NextResponse(JSON.stringify({ error: "Stipend not found" }), {
        status: 404,
      })
    }

    return NextResponse.json({
      ...stipend,
      employee: {
        ...stipend.employee,
        name: stipend.employee.name || `${stipend.employee.firstName || ''} ${stipend.employee.lastName || ''}`.trim()
      },
      approvedBy: stipend.approvedBy ? {
        ...stipend.approvedBy,
        name: stipend.approvedBy.name || `${stipend.approvedBy.firstName || ''} ${stipend.approvedBy.lastName || ''}`.trim()
      } : null
    })
  } catch (error) {
    console.error("Error fetching stipend:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch stipend" }), {
      status: 500,
    })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const userRole = session.user.role as UserRole
    if (!hasPermission(userRole, 'EDIT_STIPENDS')) {
      return new NextResponse(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
      })
    }

    const body = await req.json()
    const {
      amount,
      type,
      status,
      paymentMethod,
      remarks,
      department,
      paymentDate
    } = body

    // Check if stipend exists
    const existingStipend = await db.stipend.findUnique({
      where: { id: params.id }
    })

    if (!existingStipend) {
      return new NextResponse(JSON.stringify({ error: "Stipend not found" }), {
        status: 404,
      })
    }

    const updateData: any = {}
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (type !== undefined) updateData.type = type
    if (status !== undefined) {
      updateData.status = status
      if (status === 'APPROVED' || status === 'PAID') {
        updateData.approvedById = session.user.id
      }
    }
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod
    if (remarks !== undefined) updateData.remarks = remarks
    if (department !== undefined) updateData.department = department
    if (paymentDate !== undefined) updateData.paymentDate = paymentDate ? new Date(paymentDate) : null

    const stipend = await db.stipend.update({
      where: { id: params.id },
      data: updateData,
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
      }
    })

    return NextResponse.json({
      ...stipend,
      employee: {
        ...stipend.employee,
        name: stipend.employee.name || `${stipend.employee.firstName || ''} ${stipend.employee.lastName || ''}`.trim()
      },
      approvedBy: stipend.approvedBy ? {
        ...stipend.approvedBy,
        name: stipend.approvedBy.name || `${stipend.approvedBy.firstName || ''} ${stipend.approvedBy.lastName || ''}`.trim()
      } : null
    })
  } catch (error) {
    console.error("Error updating stipend:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to update stipend" }), {
      status: 500,
    })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    const userRole = session.user.role as UserRole
    if (!hasPermission(userRole, 'DELETE_STIPENDS')) {
      return new NextResponse(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
      })
    }

    // Check if stipend exists
    const existingStipend = await db.stipend.findUnique({
      where: { id: params.id }
    })

    if (!existingStipend) {
      return new NextResponse(JSON.stringify({ error: "Stipend not found" }), {
        status: 404,
      })
    }

    await db.stipend.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Stipend deleted successfully" })
  } catch (error) {
    console.error("Error deleting stipend:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to delete stipend" }), {
      status: 500,
    })
  }
}