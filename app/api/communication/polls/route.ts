import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createPollSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RATING', 'TEXT_RESPONSE']).default('SINGLE_CHOICE'),
  options: z.array(z.string()).min(2).optional(),
  isAnonymous: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  endsAt: z.string().optional(),
  targetAudience: z.array(z.string()).optional(),
});

// GET /api/communication/polls - Get polls
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const active = searchParams.get('active') === 'true';

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const whereClause: any = {
      isActive: true,
    };

    if (active) {
      whereClause.OR = [
        { endsAt: null },
        { endsAt: { gt: new Date() } },
      ];
    }

    // Filter by target audience
    whereClause.AND = [
      {
        OR: [
          { targetAudience: null },
          { targetAudience: { path: [], array_contains: user.role } },
          { targetAudience: { path: [], array_contains: user.department } },
          { targetAudience: { path: [], array_contains: session.user.id } },
        ],
      },
    ];

    const polls = await prisma.poll.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
        votes: {
          where: { userId: session.user.id },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Add user voting status
    const pollsWithUserData = polls.map(poll => ({
      ...poll,
      hasVoted: poll.votes.length > 0,
      userVotes: poll.votes,
    }));

    return NextResponse.json({ 
      polls: pollsWithUserData,
      hasMore: polls.length === limit,
    });
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}

// POST /api/communication/polls - Create poll
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createPollSchema.parse(body);

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const canCreatePolls = [
      'SUPER_ADMIN', 'CEO', 'CFO', 'ADMIN', 'DIRECTOR', 'HR_OFFICER', 'TEAM_LEAD'
    ].includes(user.role);

    if (!canCreatePolls) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Create poll
    const poll = await prisma.poll.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        isAnonymous: data.isAnonymous,
        allowComments: data.allowComments,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        targetAudience: data.targetAudience ? JSON.stringify(data.targetAudience) : null,
        createdById: session.user.id,
      },
    });

    // Create poll options if provided
    if (data.options && data.options.length > 0) {
      const optionData = data.options.map((option, index) => ({
        pollId: poll.id,
        text: option,
        order: index,
      }));

      await prisma.pollOption.createMany({
        data: optionData,
      });
    }

    // Fetch the created poll with options
    const createdPoll = await prisma.poll.findUnique({
      where: { id: poll.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        options: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    });

    // Create notifications for targeted users
    if (data.targetAudience) {
      let targetUserIds: string[] = [];

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
      
      targetUserIds = users.map(u => u.id).filter(id => id !== session.user.id);

      if (targetUserIds.length > 0) {
        const notifications = targetUserIds.map(userId => ({
          userId,
          type: 'POLL_CREATED' as const,
          title: 'New poll created',
          content: data.title,
          actionUrl: `/dashboard/communication?tab=polls&poll=${poll.id}`,
          data: JSON.stringify({
            pollId: poll.id,
            type: data.type,
          }),
        }));

        await prisma.notification.createMany({
          data: notifications,
        });
      }
    }

    return NextResponse.json({ poll: createdPoll }, { status: 201 });
  } catch (error) {
    console.error("Error creating poll:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create poll" },
      { status: 500 }
    );
  }
}