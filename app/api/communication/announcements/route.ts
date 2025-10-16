import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum([
    'GENERAL', 'URGENT', 'POLICY', 'EVENT', 'ACHIEVEMENT', 
    'BIRTHDAY', 'NEW_MEMBER', 'PROJECT_UPDATE', 'TRAINING', 'DEADLINE'
  ]).default('GENERAL'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string(),
    fileType: z.string(),
    fileSize: z.number().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(), // roles, departments, or user IDs
  isPublic: z.boolean().default(true),
  allowComments: z.boolean().default(true),
  allowReactions: z.boolean().default(true),
  publishNow: z.boolean().default(true),
  expiresAt: z.string().optional(),
  isPinned: z.boolean().default(false),
  pinnedUntil: z.string().optional(),
});

// GET /api/communication/announcements - Get announcements feed
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const whereClause: any = {
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

    if (type) {
      whereClause.type = type;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
            views: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
      skip: (page - 1) * limit,
    });

    // Mark announcements as viewed
    const viewPromises = announcements.map(announcement =>
      prisma.announcementView.upsert({
        where: {
          announcementId_userId: {
            announcementId: announcement.id,
            userId: session.user.id,
          },
        },
        update: { viewedAt: new Date() },
        create: {
          announcementId: announcement.id,
          userId: session.user.id,
        },
      })
    );

    await Promise.all(viewPromises);

    // Add user-specific data
    const announcementsWithUserData = announcements.map(announcement => {
      const userReaction = announcement.reactions.find(r => r.userId === session.user.id);
      return {
        ...announcement,
        userReaction: userReaction?.emoji || null,
        hasViewed: true, // Since we just marked it as viewed
      };
    });

    return NextResponse.json({ 
      announcements: announcementsWithUserData,
      hasMore: announcements.length === limit,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST /api/communication/announcements - Create announcement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createAnnouncementSchema.parse(body);

    // Check permissions - only certain roles can create announcements
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const canCreateAnnouncements = [
      'SUPER_ADMIN', 'CEO', 'CFO', 'ADMIN', 'DIRECTOR', 'HR_OFFICER', 'TEAM_LEAD'
    ].includes(user.role);

    if (!canCreateAnnouncements) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        priority: data.priority,
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        targetAudience: data.targetAudience ? JSON.stringify(data.targetAudience) : null,
        isPublic: data.isPublic,
        allowComments: data.allowComments,
        allowReactions: data.allowReactions,
        isPublished: data.publishNow,
        publishedAt: data.publishNow ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isPinned: data.isPinned,
        pinnedUntil: data.pinnedUntil ? new Date(data.pinnedUntil) : null,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
            views: true,
          },
        },
      },
    });

    // Create notifications for targeted users if published
    if (data.publishNow) {
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
          title: `New ${data.type.toLowerCase()} announcement`,
          content: data.title,
          actionUrl: `/dashboard/communication?announcement=${announcement.id}`,
          data: JSON.stringify({
            announcementId: announcement.id,
            type: data.type,
            priority: data.priority,
          }),
        }));

        await prisma.notification.createMany({
          data: notifications,
        });
      }
    }

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}