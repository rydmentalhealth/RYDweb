import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const review360Schema = z.object({
  employeeId: z.string(),
  reviewType: z.enum(['SELF', 'PEER', 'SUPERVISOR', 'SUBORDINATE']),
  period: z.string(),
  communicationRating: z.number().min(1).max(5).optional(),
  teamworkRating: z.number().min(1).max(5).optional(),
  leadershipRating: z.number().min(1).max(5).optional(),
  technicalSkillsRating: z.number().min(1).max(5).optional(),
  problemSolvingRating: z.number().min(1).max(5).optional(),
  initiativeRating: z.number().min(1).max(5).optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  additionalComments: z.string().optional(),
  isAnonymous: z.boolean().optional().default(false),
});

// Helper function to check permissions
function canManageReviews(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(userRole);
}

// GET /api/performance/reviews-360 - Get 360 reviews
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const period = searchParams.get('period');
    const reviewType = searchParams.get('reviewType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (employeeId) {
      // Users can view reviews they gave or reviews about them if they have permission
      const employeeProfile = await prisma.employeeProfile.findUnique({
        where: { id: employeeId },
        select: { userId: true },
      });

      if (!canManageReviews(session.user.role) && employeeProfile?.userId !== session.user.id) {
        // User can see reviews they gave
        where.AND = [
          { employeeId },
          { reviewerId: session.user.id },
        ];
      } else {
        where.employeeId = employeeId;
      }
    } else if (!canManageReviews(session.user.role)) {
      // Regular users can see reviews about them and reviews they gave
      const employeeProfile = await prisma.employeeProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      where.OR = [
        { employeeId: employeeProfile?.id },
        { reviewerId: session.user.id },
      ];
    }

    if (period) {
      where.period = period;
    }

    if (reviewType) {
      where.reviewType = reviewType;
    }

    const [reviews, total] = await Promise.all([
      prisma.review360.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review360.count({ where }),
    ]);

    // Hide reviewer info for anonymous reviews (unless admin)
    const sanitizedReviews = reviews.map(review => {
      if (review.isAnonymous && !canManageReviews(session.user.role)) {
        return {
          ...review,
          reviewer: {
            id: 'anonymous',
            name: 'Anonymous',
            email: 'anonymous',
            avatar: null,
          },
        };
      }
      return review;
    });

    return NextResponse.json({
      reviews: sanitizedReviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching 360 reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/performance/reviews-360 - Create 360 review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = review360Schema.parse(body);

    // Calculate overall rating
    const ratings = [
      validatedData.communicationRating,
      validatedData.teamworkRating,
      validatedData.leadershipRating,
      validatedData.technicalSkillsRating,
      validatedData.problemSolvingRating,
      validatedData.initiativeRating,
    ].filter(r => r !== undefined) as number[];

    const overallRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : undefined;

    const review = await prisma.review360.create({
      data: {
        employeeId: validatedData.employeeId,
        reviewerId: session.user.id,
        reviewType: validatedData.reviewType,
        period: validatedData.period,
        communicationRating: validatedData.communicationRating,
        teamworkRating: validatedData.teamworkRating,
        leadershipRating: validatedData.leadershipRating,
        technicalSkillsRating: validatedData.technicalSkillsRating,
        problemSolvingRating: validatedData.problemSolvingRating,
        initiativeRating: validatedData.initiativeRating,
        overallRating: overallRating ? Math.round(overallRating * 100) / 100 : undefined,
        strengths: validatedData.strengths,
        areasForImprovement: validatedData.areasForImprovement,
        additionalComments: validatedData.additionalComments,
        isAnonymous: validatedData.isAnonymous,
        isCompleted: true,
        submittedAt: new Date(),
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reviewer: {
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
        action: 'CREATE',
        resource: '360_review',
        resourceId: review.id,
        details: {
          reviewType: validatedData.reviewType,
          period: validatedData.period,
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating 360 review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
