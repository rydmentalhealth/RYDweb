import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ReportService } from "@/lib/services/report-service";
import { hasPermission } from "@/lib/auth/rbac";

// GET /api/reports/project/[projectId] - Generate project report
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId } = await context.params;
    
    const user = await db.user.findUnique({
      where: { email: session.user?.email || "" },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check permissions
    if (!hasPermission(user.role, 'VIEW_PROJECT_ANALYTICS')) {
      return NextResponse.json({ 
        message: "Insufficient permissions to generate project reports" 
      }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Generate report
    const report = await ReportService.generateProjectReport(projectId, start, end);

    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error("Error generating project report:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to generate project report",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}