import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const updateEmployeeSchema = z.object({
  fullName: z.string().min(1).optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  supervisorId: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'VOLUNTEER', 'INTERN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE', 'SUSPENDED']).optional(),
  bio: z.string().optional(),
  profilePhoto: z.string().optional(),
});

// Helper function to check permissions
function hasEmployeePermission(userRole: UserRole, action: 'read' | 'update' | 'delete') {
  switch (userRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return true;
    case 'HR_OFFICER':
      return ['read', 'update'].includes(action);
    case 'DIRECTOR':
      return action === 'read';
    case 'TEAM_LEAD':
      return action === 'read';
    case 'STAFF':
    case 'VOLUNTEER':
      return false;
    default:
      return false;
  }
}

// GET /api/employees/[id] - Get employee details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasEmployeePermission(session.user.role, 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const employee = await prisma.employeeProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          }
        },
        supervisor: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            designation: true,
            department: true,
          }
        },
        subordinates: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            designation: true,
            department: true,
            status: true,
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            category: true,
            fileType: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        performanceReviews: {
          select: {
            id: true,
            title: true,
            rating: true,
            reviewDate: true,
            reviewer: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { reviewDate: 'desc' }
        },
        leaveRequests: {
          select: {
            id: true,
            type: true,
            startDate: true,
            endDate: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        timelineEvents: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            date: true,
            createdAt: true,
          },
          orderBy: { date: 'desc' }
        },
        privateNotes: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        welcomeNotes: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
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
            documents: true,
            performanceReviews: true,
            leaveRequests: true,
            subordinates: true,
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'VIEW',
        resource: 'employee',
        resourceId: employee.id,
        details: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
        }
      }
    });

    return NextResponse.json(employee);

  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/employees/[id] - Update employee (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasEmployeePermission(session.user.role, 'update')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateEmployeeSchema.parse(body);

    // Check if employee exists
    const existingEmployee = await prisma.employeeProfile.findUnique({
      where: { id: params.id }
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    if (validatedData.dateOfBirth) {
      updateData.dateOfBirth = new Date(validatedData.dateOfBirth);
    }

    const employee = await prisma.employeeProfile.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          }
        },
        supervisor: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'employee',
        resourceId: employee.id,
        details: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          changes: validatedData,
        }
      }
    });

    return NextResponse.json(employee);

  } catch (error) {
    console.error('Error updating employee:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasEmployeePermission(session.user.role, 'update')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateEmployeeSchema.parse(body);

    // Check if employee exists
    const existingEmployee = await prisma.employeeProfile.findUnique({
      where: { id: params.id }
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    if (validatedData.dateOfBirth) {
      updateData.dateOfBirth = new Date(validatedData.dateOfBirth);
    }

    const employee = await prisma.employeeProfile.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          }
        },
        supervisor: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'employee',
        resourceId: employee.id,
        details: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          changes: validatedData,
        }
      }
    });

    return NextResponse.json(employee);

  } catch (error) {
    console.error('Error updating employee:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/employees/[id] - Delete employee (soft delete by setting status to INACTIVE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasEmployeePermission(session.user.role, 'delete')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if employee exists
    const existingEmployee = await prisma.employeeProfile.findUnique({
      where: { id: params.id }
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Soft delete by setting status to INACTIVE
    const employee = await prisma.employeeProfile.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'employee',
        resourceId: employee.id,
        details: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
        }
      }
    });

    return NextResponse.json({ message: 'Employee deactivated successfully' });

  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
