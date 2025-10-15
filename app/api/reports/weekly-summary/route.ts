import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReportService } from "@/lib/services/report-service";
import { hasPermission } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

// GET /api/reports/weekly-summary - Generate weekly summary report
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const user = await db.user.findUnique({
      where: { email: session.user?.email || "" },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check permissions
    if (!hasPermission(user.role, 'VIEW_ANALYTICS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to generate weekly summary" 
      }, { status: 403 });
    }

    // Generate weekly summary
    const summary = await ReportService.generateWeeklySummary();

    return NextResponse.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to generate weekly summary",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}