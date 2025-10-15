import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateExpenseSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED_BY_TL', 'APPROVED_BY_FINANCE', 'REJECTED', 'PAID', 'CANCELLED']).optional(),
  teamLeadNotes: z.string().optional(),
  financeNotes: z.string().optional(),
  directorNotes: z.string().optional(),
  paymentMethod: z.enum(['MOBILE_MONEY', 'BANK_TRANSFER', 'CASH', 'CHEQUE']).optional(),
  voucherUrl: z.string().optional(),
})

// GET /api/expenses/[id] - Get specific expense request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expense = await prisma.expenseRequest.findUnique({
      where: { id: params.id },
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
            fileSize: true,
            uploadedBy: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense request not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/expenses/[id] - Update expense request (approval workflow)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateExpenseSchema.parse(body)

    // Get the current expense to check status and permissions
    const currentExpense = await prisma.expenseRequest.findUnique({
      where: { id: params.id },
      select: {
        status: true,
        requesterId: true,
        department: true,
      }
    })

    if (!currentExpense) {
      return NextResponse.json({ error: 'Expense request not found' }, { status: 404 })
    }

    // Determine what updates are allowed based on user role and current status
    const updates: any = {}
    const now = new Date()

    if (validatedData.status) {
      // Team Lead approval
      if (validatedData.status === 'APPROVED_BY_TL' && ['PENDING'].includes(currentExpense.status)) {
        if (!['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(session.user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions for team lead approval' }, { status: 403 })
        }
        updates.status = 'APPROVED_BY_TL'
        updates.teamLeadId = session.user.id
        updates.teamLeadApprovedAt = now
        if (validatedData.teamLeadNotes) {
          updates.teamLeadNotes = validatedData.teamLeadNotes
        }
      }
      // Finance approval
      else if (validatedData.status === 'APPROVED_BY_FINANCE' && ['APPROVED_BY_TL'].includes(currentExpense.status)) {
        if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions for finance approval' }, { status: 403 })
        }
        updates.status = 'APPROVED_BY_FINANCE'
        updates.financeApprovedById = session.user.id
        updates.financeApprovedAt = now
        if (validatedData.financeNotes) {
          updates.financeNotes = validatedData.financeNotes
        }
      }
      // Director approval (optional)
      else if (validatedData.status === 'PAID' && ['APPROVED_BY_FINANCE'].includes(currentExpense.status)) {
        if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions for payment approval' }, { status: 403 })
        }
        updates.status = 'PAID'
        updates.directorApprovedById = session.user.id
        updates.directorApprovedAt = now
        updates.paidAt = now
        if (validatedData.directorNotes) {
          updates.directorNotes = validatedData.directorNotes
        }
        if (validatedData.paymentMethod) {
          updates.paymentMethod = validatedData.paymentMethod
        }
        if (validatedData.voucherUrl) {
          updates.voucherUrl = validatedData.voucherUrl
        }
      }
      // Rejection
      else if (validatedData.status === 'REJECTED') {
        if (!['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(session.user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions for rejection' }, { status: 403 })
        }
        updates.status = 'REJECTED'
        // Set the appropriate rejection fields based on current status
        if (currentExpense.status === 'PENDING') {
          updates.teamLeadId = session.user.id
          updates.teamLeadApprovedAt = now
          if (validatedData.teamLeadNotes) {
            updates.teamLeadNotes = validatedData.teamLeadNotes
          }
        } else if (currentExpense.status === 'APPROVED_BY_TL') {
          updates.financeApprovedById = session.user.id
          updates.financeApprovedAt = now
          if (validatedData.financeNotes) {
            updates.financeNotes = validatedData.financeNotes
          }
        }
      }
      else {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
    }

    const expense = await prisma.expenseRequest.update({
      where: { id: params.id },
      data: updates,
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
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/expenses/[id] - Delete expense request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete expenses
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.expenseRequest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Expense request deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
