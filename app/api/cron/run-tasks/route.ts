import { NextRequest, NextResponse } from "next/server";
import { CronService } from "@/lib/services/cron-service";

// POST /api/cron/run-tasks - Run all scheduled tasks
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a valid source (e.g., Vercel Cron, GitHub Actions, etc.)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log('[Cron API] Starting scheduled tasks...');
    
    const results = await CronService.runAllTasks();
    
    console.log('[Cron API] Tasks completed:', results);
    
    return NextResponse.json({
      success: true,
      message: "Scheduled tasks completed successfully",
      results
    });
  } catch (error) {
    console.error('[Cron API] Error running scheduled tasks:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error running scheduled tasks",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/cron/run-tasks - Health check for cron jobs
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Cron service is running",
    timestamp: new Date().toISOString()
  });
}