import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  type: z.string().default('GENERAL'),
  isPublic: z.boolean().default(true),
  targetAudience: z.array(z.string()).optional(),
});

// GET /api/events - Get events
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // For now, we'll use announcements with type 'EVENT' as events
    // You can create a separate Event model if needed
    const whereClause: any = {
      type: 'EVENT',
      isPublished: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
      AND: [
        {
          OR: [
            { isPublic: true },
            { targetAudience: { path: [], array_contains: user.role } },
            { targetAudience: { path: [], array_contains: user.department } },
            { targetAudience: { path: [], array_contains: session.user.id } },
            { targetAudience: null },
          ],
        },
      ],
    };

    if (upcoming) {
      // For events, we'll use publishedAt as the event date
      whereClause.publishedAt = { gte: new Date() };
    }

    const events = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { publishedAt: 'asc' },
      take: limit,
    });

    // Transform announcements to event format
    const transformedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.content,
      date: event.publishedAt?.toISOString() || new Date().toISOString(),
      type: event.type,
      author: event.author,
    }));

    return NextResponse.json({ events: transformedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events - Create event (HR/Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createEventSchema.parse(body);

    // Check permissions - only certain roles can create events
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const canCreateEvents = [
      'SUPER_ADMIN', 'CEO', 'CFO', 'ADMIN', 'DIRECTOR', 'HR_OFFICER'
    ].includes(user.role);

    if (!canCreateEvents) {
      return NextResponse.json({ error: 'Insufficient permissions. Only HR, Admin, and Super Admin can create events.' }, { status: 403 });
    }

    // Create event as an announcement with type 'EVENT'
    const event = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.description || '',
        type: 'EVENT',
        priority: 'NORMAL',
        targetAudience: data.targetAudience ? JSON.stringify(data.targetAudience) : null,
        isPublic: data.isPublic,
        allowComments: true,
        allowReactions: true,
        isPublished: true,
        publishedAt: new Date(data.date),
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Create notifications for targeted users
    let targetUserIds: string[] = [];

    if (data.isPublic) {
      // Get all active users
      const allUsers = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      targetUserIds = allUsers.map(u => u.id);
    } else if (data.targetAudience) {
      // Get users based on target audience
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { role: { in: data.targetAudience } },
            { department: { in: data.targetAudience } },
            { id: { in: data.targetAudience } },
          ],
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      targetUserIds = users.map(u => u.id);
    }

    // Remove the author from notifications
    targetUserIds = targetUserIds.filter(id => id !== session.user.id);

    if (targetUserIds.length > 0) {
      const notifications = targetUserIds.map(userId => ({
        userId,
        type: 'ANNOUNCEMENT' as const,
        title: `New RYD Event: ${data.title}`,
        content: data.description || data.title,
        actionUrl: `/dashboard/communication?event=${event.id}`,
        data: JSON.stringify({
          eventId: event.id,
          type: 'EVENT',
          date: data.date,
        }),
      }));

      await prisma.notification.createMany({
        data: notifications,
      });
    }

    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.content,
      date: event.publishedAt?.toISOString() || new Date().toISOString(),
      type: event.type,
      author: event.author,
    };

    return NextResponse.json({ event: transformedEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}