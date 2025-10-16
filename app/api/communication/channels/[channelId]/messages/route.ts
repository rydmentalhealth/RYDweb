import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createMessageSchema = z.object({
  content: z.string().min(1),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'VOICE_NOTE']).default('TEXT'),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string(),
    fileType: z.string(),
    fileSize: z.number().optional(),
  })).optional(),
  mentions: z.array(z.string()).optional(),
  replyToId: z.string().optional(),
});

// GET /api/communication/channels/[channelId]/messages - Get channel messages
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { channelId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // For pagination

    // Check if user is a member of the channel
    const membership = await prisma.chatMember.findFirst({
      where: {
        channelId,
        userId: session.user.id,
        leftAt: null,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const whereClause: any = {
      channelId,
      isDeleted: false,
    };

    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.chatMessage.findMany({
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
        replyTo: {
          include: {
            author: {
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
          select: { replies: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Update user's last read timestamp
    await prisma.chatMember.update({
      where: { id: membership.id },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({ 
      messages: messages.reverse(), // Reverse to show oldest first
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/communication/channels/[channelId]/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { channelId } = params;
    const body = await request.json();
    const { content, messageType, attachments, mentions, replyToId } = createMessageSchema.parse(body);

    // Check if user is a member of the channel
    const membership = await prisma.chatMember.findFirst({
      where: {
        channelId,
        userId: session.user.id,
        leftAt: null,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        channelId,
        authorId: session.user.id,
        content,
        messageType,
        attachments: attachments ? JSON.stringify(attachments) : null,
        mentions: mentions ? JSON.stringify(mentions) : null,
        replyToId,
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
        replyTo: {
          include: {
            author: {
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
        reactions: true,
        _count: {
          select: { replies: true },
        },
      },
    });

    // Update channel's last activity
    await prisma.chatChannel.update({
      where: { id: channelId },
      data: { updatedAt: new Date() },
    });

    // Create notifications for mentioned users
    if (mentions && mentions.length > 0) {
      const mentionNotifications = mentions
        .filter(userId => userId !== session.user.id)
        .map(userId => ({
          userId,
          type: 'CHAT_MENTION' as const,
          title: `${session.user.name || session.user.firstName} mentioned you`,
          content: content.substring(0, 100),
          actionUrl: `/dashboard/communication?channel=${channelId}`,
          data: JSON.stringify({
            channelId,
            messageId: message.id,
            authorId: session.user.id,
          }),
        }));

      if (mentionNotifications.length > 0) {
        await prisma.notification.createMany({
          data: mentionNotifications,
        });
      }
    }

    // Create notifications for other channel members (except author)
    const otherMembers = await prisma.chatMember.findMany({
      where: {
        channelId,
        userId: { not: session.user.id },
        leftAt: null,
        notificationLevel: { in: ['ALL', 'MENTIONS'] },
      },
      select: { userId: true, notificationLevel: true },
    });

    const messageNotifications = otherMembers
      .filter(member => 
        member.notificationLevel === 'ALL' || 
        (member.notificationLevel === 'MENTIONS' && mentions?.includes(member.userId))
      )
      .map(member => ({
        userId: member.userId,
        type: 'CHAT_MESSAGE' as const,
        title: `New message from ${session.user.name || session.user.firstName}`,
        content: content.substring(0, 100),
        actionUrl: `/dashboard/communication?channel=${channelId}`,
        data: JSON.stringify({
          channelId,
          messageId: message.id,
          authorId: session.user.id,
        }),
      }));

    if (messageNotifications.length > 0) {
      await prisma.notification.createMany({
        data: messageNotifications,
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}