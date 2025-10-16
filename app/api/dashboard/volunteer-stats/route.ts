import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Get user's assigned projects count
    const assignedProjects = await prisma.projectMember.count({
      where: {
        userId,
        project: {
          status: {
            in: ['PLANNING', 'ACTIVE']
          }
        }
      }
    });

    // Get tasks due this week
    const tasksDueThisWeek = await prisma.taskAssignee.count({
      where: {
        userId,
        task: {
          endDate: {
            gte: weekStart,
            lte: weekEnd
          },
          status: {
            in: ['NOT_STARTED', 'IN_PROGRESS']
          }
        }
      }
    });

    // Get completed tasks this month
    const completedTasks = await prisma.taskAssignee.count({
      where: {
        userId,
        task: {
          status: 'COMPLETED',
          completedAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }
    });

    // Get pending tasks
    const pendingTasks = await prisma.taskAssignee.count({
      where: {
        userId,
        task: {
          status: {
            in: ['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE']
          }
        }
      }
    });

    // Calculate weekly hours from daily logs (volunteers might not use check-in system)
    const dailyLogs = await prisma.dailyTaskLog.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    });

    const weeklyHoursFromLogs = dailyLogs.reduce((total, log) => {
      return total + (log.hoursSpent || 0);
    }, 0);

    // Also check check-ins for volunteers who use the system
    const checkIns = await prisma.checkIn.findMany({
      where: {
        userId,
        checkInTime: {
          gte: weekStart,
          lte: weekEnd
        },
        status: 'CHECKED_OUT'
      }
    });

    const weeklyHoursFromCheckIns = checkIns.reduce((total, checkIn) => {
      return total + (checkIn.workingHours || 0);
    }, 0);

    // Use the higher of the two (in case volunteer uses both systems)
    const weeklyHours = Math.max(weeklyHoursFromLogs, weeklyHoursFromCheckIns);

    // Calculate total hours served (lifetime)
    const totalDailyLogs = await prisma.dailyTaskLog.findMany({
      where: { userId },
      select: { hoursSpent: true }
    });

    const totalCheckIns = await prisma.checkIn.findMany({
      where: { 
        userId,
        status: 'CHECKED_OUT'
      },
      select: { workingHours: true }
    });

    const totalHoursFromLogs = totalDailyLogs.reduce((total, log) => total + (log.hoursSpent || 0), 0);
    const totalHoursFromCheckIns = totalCheckIns.reduce((total, checkIn) => total + (checkIn.workingHours || 0), 0);
    const totalHoursServed = Math.max(totalHoursFromLogs, totalHoursFromCheckIns);

    // Calculate communities reached (based on projects and tasks)
    const projectsWithCommunityImpact = await prisma.projectMember.count({
      where: {
        userId,
        project: {
          status: {
            in: ['ACTIVE', 'COMPLETED']
          },
          // Assuming projects with certain departments reach communities
          department: {
            in: ['Outreach', 'Community Engagement', 'Therapy', 'Youth Programs']
          }
        }
      }
    });

    // Estimate communities reached based on projects and completed tasks
    const communitiesReached = Math.max(1, projectsWithCommunityImpact * 2 + Math.floor(completedTasks / 3));

    // Calculate months active (from first activity)
    const firstActivity = await prisma.dailyTaskLog.findFirst({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    const firstCheckIn = await prisma.checkIn.findFirst({
      where: { userId },
      orderBy: { checkInTime: 'asc' }
    });

    let monthsActive = 1;
    if (firstActivity || firstCheckIn) {
      const startDate = firstActivity && firstCheckIn 
        ? (firstActivity.date < firstCheckIn.checkInTime ? firstActivity.date : firstCheckIn.checkInTime)
        : (firstActivity ? firstActivity.date : firstCheckIn!.checkInTime);
      
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      monthsActive = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)));
    }

    // Get all completed tasks (lifetime)
    const totalCompletedTasks = await prisma.taskAssignee.count({
      where: {
        userId,
        task: {
          status: 'COMPLETED'
        }
      }
    });

    const stats = {
      activeAssignments: assignedProjects,
      hoursLoggedThisWeek: Math.round(weeklyHours * 10) / 10,
      pendingTasks,
      teamLeadFeedback: 'Excellent', // This could be calculated from performance reviews
      totalTasksCompleted: totalCompletedTasks,
      totalHoursServed: Math.round(totalHoursServed * 10) / 10,
      communitiesReached,
      monthsActive,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      tasksDueThisWeek
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}