import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { IntegrationService } from "@/lib/services/integration-service";

// POST /api/integrations/notion - Create Notion page for project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId, projectName, projectDescription, parentPageId, accessToken } = await request.json();

    if (!projectId || !projectName || !accessToken) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create Notion page
    const page = await IntegrationService.createNotionPage(
      projectName, 
      projectDescription || '', 
      parentPageId || process.env.NOTION_DEFAULT_PARENT_PAGE_ID || '',
      accessToken
    );

    // TODO: Update project with Notion page ID
    // await db.project.update({
    //   where: { id: projectId },
    //   data: { notionPageId: page.id }
    // });

    return NextResponse.json({
      success: true,
      page,
      message: "Notion page created successfully"
    });
  } catch (error) {
    console.error("Error creating Notion page:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to create Notion page",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/integrations/notion/auth-url - Get Notion OAuth URL
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    
    const authUrl = IntegrationService.getNotionAuthUrl(projectId || undefined);

    return NextResponse.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error("Error generating Notion auth URL:", error);
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