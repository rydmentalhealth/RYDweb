import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateMessageSchema = z.object({
  content: z.string().min(1),
});

const reactionSchema = z.object({
  emoji: z.string().min(1),
});

// PUT /api/communication/messages/[messageId] - Edit message
export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = params;
    const body = await request.json();
    const { content } = updateMessageSchema.parse(body);

    // Check if user is the author of the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { authorId: true, createdAt: true },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if message is not too old (e.g., 24 hours)
    const hoursSinceCreated = (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated > 24) {
      return NextResponse.json(
        { error: "Message too old to edit" },
        { status: 400 }
      );
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
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
    });

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error("Error updating message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE /api/communication/messages/[messageId] - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = params;

    // Get message with channel info to check permissions
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        channel: {
          include: {
            members: {
              where: {
                userId: session.user.id,
                leftAt: null,
              },
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const userMembership = message.channel.members[0];
    if (!userMembership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if user is the author or has moderation permissions
    const canDelete = 
      message.authorId === session.user.id ||
      ['ADMIN', 'MODERATOR'].includes(userMembership.role);

    if (!canDelete) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Soft delete the message
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: "[Message deleted]",
      },
    });

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}