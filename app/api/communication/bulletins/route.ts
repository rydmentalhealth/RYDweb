import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createBulletinSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  isPublic: z.boolean().default(false),
  accessRoles: z.array(z.string()).optional(),
  allowComments: z.boolean().default(true),
});

// GET /api/communication/bulletins - Get bulletin boards
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, department: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bulletins = await prisma.bulletinBoard.findMany({
      where: {
        isActive: true,
        OR: [
          { isPublic: true },
          { departmentId: user.department },
          { accessRoles: { path: [], array_contains: user.role } },
          { createdById: session.user.id },
        ],
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        posts: {
          where: {
            isPublished: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          orderBy: [
            { isPinned: 'desc' },
            { publishedAt: 'desc' },
          ],
          take: 5, // Latest 5 posts per bulletin
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
            _count: {
              select: {
                comments: true,
                views: true,
              },
            },
          },
        },
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ bulletins });
  } catch (error) {
    console.error("Error fetching bulletins:", error);
    return NextResponse.json(
      { error: "Failed to fetch bulletins" },
      { status: 500 }
    );
  }
}

// POST /api/communication/bulletins - Create bulletin board
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createBulletinSchema.parse(body);

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const canCreateBulletins = [
      'SUPER_ADMIN', 'CEO', 'CFO', 'ADMIN', 'DIRECTOR', 'HR_OFFICER', 'TEAM_LEAD'
    ].includes(user.role);

    if (!canCreateBulletins) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const bulletin = await prisma.bulletinBoard.create({
      data: {
        name: data.name,
        description: data.description,
        departmentId: data.departmentId,
        isPublic: data.isPublic,
        accessRoles: data.accessRoles ? JSON.stringify(data.accessRoles) : null,
        allowComments: data.allowComments,
        createdById: session.user.id,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json({ bulletin }, { status: 201 });
  } catch (error) {
    console.error("Error creating bulletin:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create bulletin" },
      { status: 500 }
    );
  }
}