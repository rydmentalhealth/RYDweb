import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateStipendSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'PAID', 'REJECTED']).optional(),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(['MOBILE_MONEY', 'BANK_TRANSFER', 'CASH', 'CHEQUE']).optional(),
  remarks: z.string().optional(),
})

// GET /api/stipends/[id] - Get specific stipend
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stipend = await prisma.stipend.findUnique({
      where: { id: params.id },
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

    if (!stipend) {
      return NextResponse.json({ error: 'Stipend not found' }, { status: 404 })
    }

    return NextResponse.json(stipend)
  } catch (error) {
    console.error('Error fetching stipend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/stipends/[id] - Update stipend status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update stipends
    if (!['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateStipendSchema.parse(body)

    const stipend = await prisma.stipend.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : undefined,
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

    return NextResponse.json(stipend)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating stipend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/stipends/[id] - Delete stipend
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete stipends
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.stipend.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Stipend deleted successfully' })
  } catch (error) {
    console.error('Error deleting stipend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
