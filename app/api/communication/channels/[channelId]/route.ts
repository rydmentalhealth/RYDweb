import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateChannelSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  avatar: z.string().optional(),
});

// GET /api/communication/channels/[channelId] - Get channel details
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

    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                department: true,
              },
            },
          },
        },
        pinnedPosts: {
          include: {
            message: {
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
          },
          orderBy: { pinnedAt: 'desc' },
        },
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json({ channel });
  } catch (error) {
    console.error("Error fetching channel:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel" },
      { status: 500 }
    );
  }
}

// PUT /api/communication/channels/[channelId] - Update channel
export async function PUT(
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
    const { name, description, avatar } = updateChannelSchema.parse(body);

    // Check if user is an admin of the channel
    const membership = await prisma.chatMember.findFirst({
      where: {
        channelId,
        userId: session.user.id,
        role: { in: ['ADMIN', 'MODERATOR'] },
        leftAt: null,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const updatedChannel = await prisma.chatChannel.update({
      where: { id: channelId },
      data: {
        name,
        description,
        avatar,
      },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
                department: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({ channel: updatedChannel });
  } catch (error) {
    console.error("Error updating channel:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update channel" },
      { status: 500 }
    );
  }
}

// DELETE /api/communication/channels/[channelId] - Delete/Leave channel
export async function DELETE(
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
    const action = searchParams.get('action'); // 'leave' or 'delete'

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

    if (action === 'leave') {
      // User leaves the channel
      await prisma.chatMember.update({
        where: { id: membership.id },
        data: { leftAt: new Date() },
      });

      return NextResponse.json({ message: "Left channel successfully" });
    } else if (action === 'delete') {
      // Delete the entire channel (admin only)
      if (membership.role !== 'ADMIN') {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
      }

      await prisma.chatChannel.update({
        where: { id: channelId },
        data: { isActive: false },
      });

      return NextResponse.json({ message: "Channel deleted successfully" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error deleting/leaving channel:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}