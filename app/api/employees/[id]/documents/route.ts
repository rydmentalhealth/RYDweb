import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const createDocumentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
  fileSize: z.number().positive().optional(),
  category: z.enum(['IDENTIFICATION', 'EMPLOYMENT', 'CERTIFICATES', 'PERFORMANCE', 'LEAVE', 'OTHER']).default('OTHER'),
  isPublic: z.boolean().default(false),
});

// Helper function to check permissions
function hasDocumentPermission(userRole: UserRole, action: 'create' | 'read' | 'update' | 'delete') {
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

// GET /api/employees/[id]/documents - Get employee documents
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasDocumentPermission(session.user.role, 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {
      employeeId: params.id,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const documents = await prisma.employeeDocument.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(documents);

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/employees/[id]/documents - Upload document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasDocumentPermission(session.user.role, 'create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createDocumentSchema.parse(body);

    // Check if employee exists
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: params.id }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const document = await prisma.employeeDocument.create({
      data: {
        ...validatedData,
        employeeId: params.id,
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'document',
        resourceId: document.id,
        details: {
          employeeId: employee.employeeId,
          employeeName: employee.fullName,
          documentTitle: document.title,
          category: document.category,
        }
      }
    });

    return NextResponse.json(document, { status: 201 });

  } catch (error) {
    console.error('Error creating document:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
