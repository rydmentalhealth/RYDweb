import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for creating a chat channel
const createChannelSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['DIRECT', 'GROUP', 'DEPARTMENT', 'PROJECT', 'ANNOUNCEMENT']),
  departmentId: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

// GET /api/communication/channels - Get user's channels
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const includeDepartment = searchParams.get('includeDepartment') === 'true';

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { department: true, role: true },
    });

    // If includeDepartment is true and user has a department, ensure department channel exists
    if (includeDepartment && currentUser?.department) {
      await ensureDepartmentChannel(currentUser.department, session.user.id);
    }

    // Get channels where user is a member
    const channels = await prisma.chatChannel.findMany({
      where: {
        isActive: true,
        members: {
          some: {
            userId: session.user.id,
            leftAt: null,
          },
        },
        ...(type && { type: type as any }),
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
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
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
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                createdAt: {
                  gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
              },
            },
          },
        },
      },
      orderBy: [
        { updatedAt: 'desc' },
      ],
    });

    // Calculate unread counts for each channel
    const channelsWithUnread = await Promise.all(
      channels.map(async (channel) => {
        const member = channel.members.find(m => m.userId === session.user.id);
        const lastReadAt = member?.lastReadAt || new Date(0);

        const unreadCount = await prisma.chatMessage.count({
          where: {
            channelId: channel.id,
            createdAt: { gt: lastReadAt },
            authorId: { not: session.user.id },
            isDeleted: false,
          },
        });

        return {
          ...channel,
          unreadCount,
          lastMessage: channel.messages[0] || null,
        };
      })
    );

    return NextResponse.json({ channels: channelsWithUnread });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}

// POST /api/communication/channels - Create a new channel
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, departmentId, memberIds } = createChannelSchema.parse(body);

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only certain roles can create department/announcement channels
    if ((type === 'DEPARTMENT' || type === 'ANNOUNCEMENT') && 
        !['SUPER_ADMIN', 'CEO', 'CFO', 'ADMIN', 'DIRECTOR', 'HR_OFFICER', 'TEAM_LEAD'].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Create the channel
    const channel = await prisma.chatChannel.create({
      data: {
        name,
        description,
        type,
        departmentId,
        createdById: session.user.id,
        isAutoGenerated: type === 'DEPARTMENT',
      },
    });

    // Add members to the channel
    const membersToAdd = memberIds || [];
    if (!membersToAdd.includes(session.user.id)) {
      membersToAdd.push(session.user.id); // Always add creator
    }

    // For direct messages, ensure only 2 members
    if (type === 'DIRECT' && membersToAdd.length !== 2) {
      return NextResponse.json(
        { error: "Direct messages must have exactly 2 members" },
        { status: 400 }
      );
    }

    // Add members
    await prisma.chatMember.createMany({
      data: membersToAdd.map(userId => ({
        channelId: channel.id,
        userId,
        role: userId === session.user.id ? 'ADMIN' : 'MEMBER',
      })),
    });

    // Fetch the created channel with members
    const createdChannel = await prisma.chatChannel.findUnique({
      where: { id: channel.id },
      include: {
        members: {
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

    return NextResponse.json({ channel: createdChannel }, { status: 201 });
  } catch (error) {
    console.error("Error creating channel:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 }
    );
  }
}

// Helper function to ensure department channel exists and user is a member
async function ensureDepartmentChannel(department: string, userId: string) {
  try {
    // Check if department channel already exists
    let departmentChannel = await prisma.chatChannel.findFirst({
      where: {
        type: 'DEPARTMENT',
        name: `${department} Department`,
        isActive: true,
      },
    });

    // Create department channel if it doesn't exist
    if (!departmentChannel) {
      departmentChannel = await prisma.chatChannel.create({
        data: {
          name: `${department} Department`,
          description: `Department chat for ${department} team members`,
          type: 'DEPARTMENT',
          isActive: true,
          isAutoGenerated: true,
          createdById: userId,
        },
      });
    }

    // Check if user is already a member
    const existingMembership = await prisma.chatMember.findFirst({
      where: {
        channelId: departmentChannel.id,
        userId: userId,
        leftAt: null,
      },
    });

    // Add user to department channel if not already a member
    if (!existingMembership) {
      await prisma.chatMember.create({
        data: {
          channelId: departmentChannel.id,
          userId: userId,
          role: 'MEMBER',
        },
      });
    }

    // Also add other department members who aren't already in the channel
    const departmentUsers = await prisma.user.findMany({
      where: {
        department: department,
        status: 'ACTIVE',
        id: { not: userId }, // Exclude current user as they're already added
      },
      select: { id: true },
    });

    if (departmentUsers.length > 0) {
      // Get existing members to avoid duplicates
      const existingMembers = await prisma.chatMember.findMany({
        where: {
          channelId: departmentChannel.id,
          leftAt: null,
        },
        select: { userId: true },
      });

      const existingMemberIds = existingMembers.map(m => m.userId);
      const newMembers = departmentUsers.filter(u => !existingMemberIds.includes(u.id));

      if (newMembers.length > 0) {
        await prisma.chatMember.createMany({
          data: newMembers.map(user => ({
            channelId: departmentChannel.id,
            userId: user.id,
            role: 'MEMBER',
          })),
        });
      }
    }

    return departmentChannel;
  } catch (error) {
    console.error('Error ensuring department channel:', error);
    return null;
  }
}