import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    console.log("[Chrome Test] Testing Chrome authentication compatibility");
    
    // Get user agent to identify browser
    const userAgent = request.headers.get("user-agent") || "";
    const isChrome = userAgent.includes("Chrome") && !userAgent.includes("Edg");
    const isFirefox = userAgent.includes("Firefox");
    
    console.log("[Chrome Test] Browser detection:", {
      userAgent: userAgent.substring(0, 100) + "...",
      isChrome,
      isFirefox
    });
    
    // Test token retrieval
    const token = await getToken({ 
      req: request, 
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });
    
    console.log("[Chrome Test] Token status:", {
      hasToken: !!token,
      tokenEmail: token?.email,
      tokenRole: token?.role,
      tokenStatus: token?.status
    });
    
    // Check cookies
    const cookies = request.cookies.getAll();
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes("next-auth") || 
      cookie.name.includes("auth")
    );
    
    console.log("[Chrome Test] Auth cookies found:", authCookies.length);
    authCookies.forEach(cookie => {
      console.log(`[Chrome Test] Cookie: ${cookie.name} = ${cookie.value.substring(0, 20)}...`);
    });
    
    return NextResponse.json({
      browser: {
        isChrome,
        isFirefox,
        userAgent: userAgent.substring(0, 100)
      },
      authentication: {
        hasToken: !!token,
        tokenData: token ? {
          email: token.email,
          role: token.role,
          status: token.status,
          lastRefresh: token.lastRefresh
        } : null
      },
      cookies: {
        total: cookies.length,
        authCookies: authCookies.length,
        authCookieNames: authCookies.map(c => c.name)
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasAuthUrl: !!process.env.AUTH_URL,
        hasTrustHost: !!process.env.AUTH_TRUST_HOST
      }
    });
    
  } catch (error) {
    console.error("[Chrome Test] Error:", error);
    return NextResponse.json(
      { 
        error: "Test failed", 
        message: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
} 