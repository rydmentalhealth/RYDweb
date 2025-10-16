import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema
const checkInSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  deviceInfo: z.string().optional(),
});

// GET /api/attendance/check-in - Get user's check-in status for today
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        userId: session.user.id,
        checkInTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { checkInTime: 'desc' },
    });

    return NextResponse.json({ checkIn });
  } catch (error) {
    console.error('Error fetching check-in status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/attendance/check-in - Check in or check out
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;
    
    if (!action || !['check-in', 'check-out'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get client IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (action === 'check-in') {
      // Check if user already checked in today
      const existingCheckIn = await prisma.checkIn.findFirst({
        where: {
          userId: session.user.id,
          checkInTime: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (existingCheckIn) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
      }

      const validatedData = checkInSchema.parse(data);

      const checkIn = await prisma.checkIn.create({
        data: {
          userId: session.user.id,
          checkInTime: new Date(),
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          location: validatedData.location,
          notes: validatedData.notes,
          deviceInfo: validatedData.deviceInfo,
          ipAddress,
          status: 'CHECKED_IN',
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'CHECK_IN',
          resource: 'attendance',
          resourceId: checkIn.id,
          ipAddress,
        },
      });

      return NextResponse.json(checkIn, { status: 201 });
    } else {
      // Check out
      const existingCheckIn = await prisma.checkIn.findFirst({
        where: {
          userId: session.user.id,
          checkInTime: {
            gte: today,
            lt: tomorrow,
          },
          checkOutTime: null,
        },
      });

      if (!existingCheckIn) {
        return NextResponse.json({ error: 'No active check-in found' }, { status: 400 });
      }

      const checkOutTime = new Date();
      const workingHours = (checkOutTime.getTime() - existingCheckIn.checkInTime.getTime()) / (1000 * 60 * 60);

      const updatedCheckIn = await prisma.checkIn.update({
        where: { id: existingCheckIn.id },
        data: {
          checkOutTime,
          workingHours: Math.round(workingHours * 100) / 100,
          status: 'CHECKED_OUT',
          notes: data.notes || existingCheckIn.notes,
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'CHECK_OUT',
          resource: 'attendance',
          resourceId: updatedCheckIn.id,
          ipAddress,
          details: {
            workingHours: updatedCheckIn.workingHours,
          },
        },
      });

      return NextResponse.json(updatedCheckIn);
    }
  } catch (error) {
    console.error('Error processing check-in/out:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
