import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Helper function to check permissions
function canViewAllSummaries(userRole: UserRole): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR'].includes(userRole);
}

// Helper function to generate work summary for a user and month
async function generateWorkSummary(userId: string, month: string) {
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  // Get all check-ins for the month
  const checkIns = await prisma.checkIn.findMany({
    where: {
      userId,
      checkInTime: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get all daily logs for the month
  const dailyLogs = await prisma.dailyTaskLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate stats
  const totalDays = endDate.getDate();
  const daysPresent = new Set(checkIns.map(c => c.checkInTime.toDateString())).size;
  const daysAbsent = totalDays - daysPresent;
  const totalHours = checkIns.reduce((sum, c) => sum + (c.workingHours || 0), 0);
  const tasksCompleted = dailyLogs.filter(l => l.isApproved).length;
  const attendanceRate = (daysPresent / totalDays) * 100;

  // Additional summary data
  const summaryData = {
    averageHoursPerDay: daysPresent > 0 ? totalHours / daysPresent : 0,
    checkInCount: checkIns.length,
    taskLogsCount: dailyLogs.length,
    approvedLogsCount: tasksCompleted,
    lateCheckIns: checkIns.filter(c => {
      const hour = c.checkInTime.getHours();
      return hour >= 10; // Consider 10 AM as late
    }).length,
  };

  return {
    userId,
    month,
    totalDays,
    daysPresent,
    daysAbsent,
    totalHours: Math.round(totalHours * 100) / 100,
    tasksCompleted,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
    summaryData,
  };
}

// GET /api/attendance/work-summary - Get work summaries
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month'); // Format: YYYY-MM
    const generate = searchParams.get('generate') === 'true';

    // Determine which user's summary to fetch
    let targetUserId = session.user.id;
    if (userId && canViewAllSummaries(session.user.role)) {
      targetUserId = userId;
    }

    // If month is not provided, use current month
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    if (generate) {
      // Generate new summary
      const summaryData = await generateWorkSummary(targetUserId, targetMonth);
      
      // Upsert the summary
      const summary = await prisma.workSummary.upsert({
        where: {
          userId_month: {
            userId: targetUserId,
            month: targetMonth,
          },
        },
        update: {
          ...summaryData,
          generatedAt: new Date(),
        },
        create: {
          ...summaryData,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              department: true,
              jobTitle: true,
            },
          },
        },
      });

      return NextResponse.json({ summary, generated: true });
    } else {
      // Fetch existing summary
      const summary = await prisma.workSummary.findUnique({
        where: {
          userId_month: {
            userId: targetUserId,
            month: targetMonth,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              department: true,
              jobTitle: true,
            },
          },
        },
      });

      if (!summary) {
        return NextResponse.json({ error: 'Summary not found. Set generate=true to create.' }, { status: 404 });
      }

      return NextResponse.json({ summary });
    }
  } catch (error) {
    console.error('Error fetching work summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/attendance/work-summary - Generate summaries for all users
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canViewAllSummaries(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { month, userIds } = body;

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 });
    }

    // Get all users if userIds not provided
    const targetUserIds = userIds || (await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    })).map(u => u.id);

    const summaries = [];
    for (const userId of targetUserIds) {
      try {
        const summaryData = await generateWorkSummary(userId, month);
        const summary = await prisma.workSummary.upsert({
          where: {
            userId_month: {
              userId,
              month,
            },
          },
          update: {
            ...summaryData,
            generatedAt: new Date(),
          },
          create: {
            ...summaryData,
          },
        });
        summaries.push(summary);
      } catch (error) {
        console.error(`Error generating summary for user ${userId}:`, error);
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'GENERATE',
        resource: 'work_summary',
        details: {
          month,
          count: summaries.length,
        },
      },
    });

    return NextResponse.json({ 
      message: 'Summaries generated successfully',
      count: summaries.length,
      summaries,
    });
  } catch (error) {
    console.error('Error generating work summaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
