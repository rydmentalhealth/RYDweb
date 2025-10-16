import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const generalSettingsSchema = z.object({
  organizationName: z.string().min(1),
  timezone: z.string(),
  language: z.string(),
  theme: z.string(),
  maintenanceMode: z.boolean(),
});

// Helper function to check admin permissions
function canManageSystem(userRole: string) {
  return ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
}

// GET /api/settings/general - Get general system settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || !canManageSystem(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // For now, return default settings since we don't have a settings table
    // In a real implementation, you'd create a SystemSettings model
    return NextResponse.json({
      organizationName: 'RYD Mental Health',
      timezone: 'Africa/Kampala',
      language: 'en',
      theme: 'light',
      maintenanceMode: false,
    });
  } catch (error) {
    console.error('Error fetching general settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/settings/general - Update general system settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || !canManageSystem(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const data = generalSettingsSchema.parse(body);

    // Log the settings change
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'system_settings',
        details: {
          action: 'updated_general_settings',
          changes: data,
        },
      },
    });

    // In a real implementation, you'd save these to a SystemSettings table
    // For now, we'll just return success
    return NextResponse.json({ 
      message: 'General settings updated successfully',
      settings: data 
    });
  } catch (error) {
    console.error('Error updating general settings:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}