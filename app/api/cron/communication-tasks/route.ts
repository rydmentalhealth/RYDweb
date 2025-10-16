import { NextResponse } from "next/server";
import { 
  createDepartmentChannels,
  createBirthdayAnnouncements,
  cleanupCommunicationData
} from "@/lib/services/communication";

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
export async function POST() {
  try {
    console.log('Running communication maintenance tasks...');

    // Run all maintenance tasks
    const [
      departmentChannelsResult,
      birthdayAnnouncementsResult,
      cleanupResult
    ] = await Promise.all([
      createDepartmentChannels(),
      createBirthdayAnnouncements(),
      cleanupCommunicationData()
    ]);

    const results = {
      departmentChannels: departmentChannelsResult,
      birthdayAnnouncements: birthdayAnnouncementsResult,
      cleanup: cleanupResult,
      timestamp: new Date().toISOString()
    };

    console.log('Communication tasks completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Communication tasks completed successfully',
      results
    });
  } catch (error) {
    console.error('Error running communication tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run communication tasks',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}