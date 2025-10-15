import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { cloudinaryService } from '@/lib/upload/cloudinary-service';
import { z } from 'zod';

const uploadSchema = z.object({
  employeeId: z.string(),
  category: z.enum(['IDENTIFICATION', 'EMPLOYMENT', 'CERTIFICATES', 'PERFORMANCE', 'LEAVE', 'OTHER']),
  title: z.string().min(1),
  description: z.string().optional(),
});

// Helper function to check permissions
function hasUploadPermission(userRole: UserRole) {
  switch (userRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
    case 'HR_OFFICER':
      return true;
    case 'DIRECTOR':
    case 'TEAM_LEAD':
    case 'STAFF':
    case 'VOLUNTEER':
      return false;
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasUploadPermission(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const employeeId = formData.get('employeeId') as string;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Validate input
    const validatedData = uploadSchema.parse({
      employeeId,
      category,
      title,
      description,
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.' 
      }, { status: 400 });
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    // Check if employee exists
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: validatedData.employeeId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadDocument(
      buffer,
      employee.id,
      validatedData.category
    );

    // Save document record to database
    const document = await prisma.employeeDocument.create({
      data: {
        employeeId: employee.id,
        title: validatedData.title,
        description: validatedData.description,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        fileType: file.type,
        fileSize: file.size,
        category: validatedData.category,
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
        action: 'UPLOAD',
        resource: 'document',
        resourceId: document.id,
        details: {
          employeeId: employee.employeeId,
          employeeName: employee.fullName,
          documentTitle: document.title,
          category: document.category,
          fileName: document.fileName,
        }
      }
    });

    return NextResponse.json({
      success: true,
      document,
      uploadResult: {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      }
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
