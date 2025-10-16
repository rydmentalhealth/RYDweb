import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schema for badge
const badgeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().default('#FFD700'),
  points: z.number().default(0),
  category: z.enum(['EXCELLENCE', 'LEADERSHIP', 'INNOVATION', 'TEAMWORK', 'ATTENDANCE', 'MILESTONE', 'CUSTOM']),
  criteria: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Validation schema for awarding a badge
const awardBadgeSchema = z.object({
  userId: z.string(),
  badgeId: z.string(),
  reason: z.string().optional(),
});

// Helper function to check permissions
function canManageRewards(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// GET /api/performance/rewards - Get badges and user rewards
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'badges'; // 'badges' or 'user-rewards'
    const userId = searchParams.get('userId');

    if (type === 'badges') {
      // Get all active badges
      const badges = await prisma.rewardBadge.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              userRewards: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return NextResponse.json({ badges });
    } else if (type === 'user-rewards') {
      // Get user's rewards
      const targetUserId = userId || session.user.id;

      // Check permissions
      if (targetUserId !== session.user.id && !canManageRewards(session.user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const rewards = await prisma.userReward.findMany({
        where: { userId: targetUserId },
        include: {
          badge: true,
          awardedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { awardedAt: 'desc' },
      });

      // Calculate total points
      const totalPoints = rewards.reduce((sum, r) => sum + r.badge.points, 0);

      return NextResponse.json({
        rewards,
        totalPoints,
        totalBadges: rewards.length,
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/performance/rewards - Create badge or award badge to user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageRewards(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'create-badge') {
      // Create new badge
      const validatedData = badgeSchema.parse(data);

      const badge = await prisma.rewardBadge.create({
        data: validatedData,
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE',
          resource: 'reward_badge',
          resourceId: badge.id,
        },
      });

      return NextResponse.json(badge, { status: 201 });
    } else if (action === 'award-badge') {
      // Award badge to user
      const validatedData = awardBadgeSchema.parse(data);

      // Check if badge exists
      const badge = await prisma.rewardBadge.findUnique({
        where: { id: validatedData.badgeId },
      });

      if (!badge) {
        return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
      }

      // Check if user already has this badge (optional: allow multiple awards)
      const existingReward = await prisma.userReward.findFirst({
        where: {
          userId: validatedData.userId,
          badgeId: validatedData.badgeId,
        },
      });

      if (existingReward) {
        return NextResponse.json({ error: 'User already has this badge' }, { status: 400 });
      }

      const reward = await prisma.userReward.create({
        data: {
          userId: validatedData.userId,
          badgeId: validatedData.badgeId,
          awardedById: session.user.id,
          reason: validatedData.reason,
        },
        include: {
          badge: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          awardedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'AWARD',
          resource: 'reward',
          resourceId: reward.id,
          details: {
            badgeName: badge.name,
            recipient: validatedData.userId,
          },
        },
      });

      return NextResponse.json(reward, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing rewards:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
