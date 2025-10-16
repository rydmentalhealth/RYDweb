import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  chatMessages: z.boolean(),
  taskUpdates: z.boolean,
  announcements: z.boolean(),
});

// GET /api/user/notification-preferences - Get user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      // Return default preferences if none exist
      return NextResponse.json({
        emailNotifications: true,
        pushNotifications: true,
        chatMessages: true,
        taskUpdates: true,
        announcements: true,
      });
    }

    return NextResponse.json({
      emailNotifications: preferences.emailNotifications,
      pushNotifications: preferences.pushNotifications,
      chatMessages: preferences.chatMessages,
      taskUpdates: preferences.taskUpdates,
      announcements: preferences.announcements,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/user/notification-preferences - Update user's notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = notificationPreferencesSchema.parse(body);

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
        chatMessages: data.chatMessages,
        taskUpdates: data.taskUpdates,
        announcements: data.announcements,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
        chatMessages: data.chatMessages,
        taskUpdates: data.taskUpdates,
        announcements: data.announcements,
      },
    });

    return NextResponse.json({ 
      message: 'Notification preferences updated successfully',
      preferences 
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}