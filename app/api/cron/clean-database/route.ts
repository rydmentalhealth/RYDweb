import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// This API route is used as a cron job to perform regular database maintenance
// It runs once a day to clean up expired sessions and temporary data
export async function GET() {
  try {
    const now = new Date();
    
    // Clean up expired sessions (older than 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Delete expired sessions
    const deletedSessions = await db.session.deleteMany({
      where: {
        expires: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    // Delete expired verification tokens
    const deletedTokens = await db.verificationToken.deleteMany({
      where: {
        expires: {
          lt: now
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Database cleanup completed successfully",
      deletedSessions: deletedSessions.count,
      deletedTokens: deletedTokens.count,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error("Database cleanup error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Database cleanup failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 