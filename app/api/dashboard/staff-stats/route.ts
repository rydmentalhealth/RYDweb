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

    // Calculate weekly hours from check-ins
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

    const weeklyHours = checkIns.reduce((total, checkIn) => {
      return total + (checkIn.workingHours || 0);
    }, 0);

    // Calculate attendance rate this month
    const totalWorkDays = 22; // Approximate work days in a month
    const attendanceDays = await prisma.checkIn.count({
      where: {
        userId,
        checkInTime: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });

    const attendanceRate = Math.round((attendanceDays / totalWorkDays) * 100);

    // Get recent stipends (this month)
    const stipends = await prisma.stipend.findMany({
      where: {
        employeeId: userId,
        status: 'PAID',
        paymentDate: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });

    const recentStipends = stipends.reduce((total, stipend) => total + stipend.amount, 0);

    // Calculate communities reached (based on projects and tasks)
    // This is a simplified calculation - you may want to implement more sophisticated logic
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
    const communitiesReached = Math.max(1, projectsWithCommunityImpact * 2 + Math.floor(completedTasks / 5));

    const stats = {
      assignedProjects,
      tasksDueThisWeek,
      completedTasks,
      attendanceRate,
      recentStipends,
      weeklyHours: Math.round(weeklyHours * 10) / 10, // Round to 1 decimal place
      communitiesReached,
      pendingTasks
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}