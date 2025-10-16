import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const reactionSchema = z.object({
  emoji: z.string().min(1),
});

// POST /api/communication/messages/[messageId]/reactions - Add/toggle reaction
export async function POST(
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
    const { emoji } = reactionSchema.parse(body);

    // Check if user has access to the message
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

    if (!message || message.channel.members.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // Remove reaction if it exists
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id },
      });

      return NextResponse.json({ 
        message: "Reaction removed",
        action: "removed",
      });
    } else {
      // Add new reaction
      const reaction = await prisma.messageReaction.create({
        data: {
          messageId,
          userId: session.user.id,
          emoji,
        },
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
      });

      return NextResponse.json({ 
        reaction,
        action: "added",
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error handling reaction:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to handle reaction" },
      { status: 500 }
    );
  }
}

// GET /api/communication/messages/[messageId]/reactions - Get message reactions
export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = params;

    // Check if user has access to the message
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

    if (!message || message.channel.members.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const reactions = await prisma.messageReaction.findMany({
      where: { messageId },
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
      orderBy: { createdAt: 'asc' },
    });

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
          userReacted: false,
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user);
      if (reaction.userId === session.user.id) {
        acc[reaction.emoji].userReacted = true;
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ 
      reactions: Object.values(groupedReactions),
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}