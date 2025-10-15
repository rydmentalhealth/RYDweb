import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const updateOnboardingItemSchema = z.object({
  isCompleted: z.boolean(),
  notes: z.string().optional(),
});

// Helper function to check permissions
function hasOnboardingPermission(userRole: UserRole, action: 'read' | 'update') {
  switch (userRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
    case 'HR_OFFICER':
      return true;
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

// Default onboarding checklist items
const defaultOnboardingItems = [
  {
    title: 'Mission Statement Review',
    description: 'Read and understand the RYD mission statement and organizational values',
    category: 'ORIENTATION' as const,
    isRequired: true,
  },
  {
    title: 'Code of Conduct',
    description: 'Review and acknowledge the organization\'s code of conduct',
    category: 'ORIENTATION' as const,
    isRequired: true,
  },
  {
    title: 'Mental Health Policy',
    description: 'Read and understand the mental health policies and procedures',
    category: 'ORIENTATION' as const,
    isRequired: true,
  },
  {
    title: 'Employee Handbook',
    description: 'Review the complete employee handbook',
    category: 'ORIENTATION' as const,
    isRequired: true,
  },
  {
    title: 'IT Systems Access',
    description: 'Set up access to all required IT systems and tools',
    category: 'TRAINING' as const,
    isRequired: true,
  },
  {
    title: 'Safety Training',
    description: 'Complete workplace safety training',
    category: 'TRAINING' as const,
    isRequired: true,
  },
  {
    title: 'Contract Signing',
    description: 'Sign and return employment contract',
    category: 'DOCUMENTATION' as const,
    isRequired: true,
  },
  {
    title: 'ID Document Submission',
    description: 'Submit copies of identification documents',
    category: 'DOCUMENTATION' as const,
    isRequired: true,
  },
  {
    title: 'Bank Details',
    description: 'Provide bank account details for payroll',
    category: 'DOCUMENTATION' as const,
    isRequired: true,
  },
  {
    title: 'Emergency Contact',
    description: 'Provide emergency contact information',
    category: 'DOCUMENTATION' as const,
    isRequired: true,
  },
];

// GET /api/employees/[id]/onboarding - Get onboarding checklist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasOnboardingPermission(session.user.role, 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if employee exists
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: params.id }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get existing onboarding items
    let onboardingItems = await prisma.onboardingItem.findMany({
      where: { employeeId: params.id },
      orderBy: [
        { category: 'asc' },
        { isRequired: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    // If no items exist, create default checklist
    if (onboardingItems.length === 0) {
      const itemsToCreate = defaultOnboardingItems.map(item => ({
        ...item,
        employeeId: params.id,
      }));

      await prisma.onboardingItem.createMany({
        data: itemsToCreate
      });

      // Fetch the created items
      onboardingItems = await prisma.onboardingItem.findMany({
        where: { employeeId: params.id },
        orderBy: [
          { category: 'asc' },
          { isRequired: 'desc' },
          { createdAt: 'asc' }
        ]
      });
    }

    // Calculate completion statistics
    const totalItems = onboardingItems.length;
    const completedItems = onboardingItems.filter(item => item.isCompleted).length;
    const requiredItems = onboardingItems.filter(item => item.isRequired).length;
    const completedRequiredItems = onboardingItems.filter(item => item.isRequired && item.isCompleted).length;

    const completionStats = {
      totalItems,
      completedItems,
      requiredItems,
      completedRequiredItems,
      completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      requiredCompletionPercentage: requiredItems > 0 ? Math.round((completedRequiredItems / requiredItems) * 100) : 0,
    };

    return NextResponse.json({
      items: onboardingItems,
      stats: completionStats
    });

  } catch (error) {
    console.error('Error fetching onboarding checklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/employees/[id]/onboarding - Update onboarding item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasOnboardingPermission(session.user.role, 'update')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { itemId, ...updateData } = body;
    const validatedData = updateOnboardingItemSchema.parse(updateData);

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Check if employee exists
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: params.id }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Update the onboarding item
    const updatedItem = await prisma.onboardingItem.update({
      where: {
        id: itemId,
        employeeId: params.id, // Ensure the item belongs to this employee
      },
      data: {
        ...validatedData,
        completedAt: validatedData.isCompleted ? new Date() : null,
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'onboarding_item',
        resourceId: updatedItem.id,
        details: {
          employeeId: employee.employeeId,
          employeeName: employee.fullName,
          itemTitle: updatedItem.title,
          isCompleted: updatedItem.isCompleted,
        }
      }
    });

    return NextResponse.json(updatedItem);

  } catch (error) {
    console.error('Error updating onboarding item:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
