import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { IntegrationService } from "@/lib/services/integration-service";

// POST /api/integrations/google-drive - Create Google Drive folder for project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId, projectName, accessToken } = await request.json();

    if (!projectId || !projectName || !accessToken) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create Google Drive folder
    const folder = await IntegrationService.createGoogleDriveFolder(projectName, accessToken);

    // TODO: Update project with Google Drive folder ID
    // await db.project.update({
    //   where: { id: projectId },
    //   data: { googleDriveFolderId: folder.id }
    // });

    return NextResponse.json({
      success: true,
      folder,
      message: "Google Drive folder created successfully"
    });
  } catch (error) {
    console.error("Error creating Google Drive folder:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to create Google Drive folder",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/integrations/google-drive/auth-url - Get Google Drive OAuth URL
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    
    const authUrl = IntegrationService.getGoogleDriveAuthUrl(projectId || undefined);

    return NextResponse.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error("Error generating Google Drive auth URL:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to generate auth URL",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}