import { NextRequest, NextResponse } from 'next/server';
import { databaseHealthMonitor, quickHealthCheck } from '@/lib/services/database-health';
import { checkDatabaseConnection } from '@/lib/db';
import { withDatabaseErrorHandler } from '@/lib/middleware/database-error-handler';

/**
 * Database Health Check API
 * GET /api/health/database - Get current database health status
 * POST /api/health/database - Perform comprehensive health check
 */

export const GET = withDatabaseErrorHandler(async (request: NextRequest) => {
  try {
    const healthSummary = databaseHealthMonitor.getHealthSummary();
    const metrics = await databaseHealthMonitor.getDatabaseMetrics();
    const quickCheck = await quickHealthCheck();

    const response = {
      status: healthSummary.isHealthy && quickCheck ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      quickCheck: {
        passed: quickCheck,
        responseTime: Date.now() // This would be measured in quickHealthCheck
      },
      summary: healthSummary,
      metrics,
      recommendations: generateRecommendations(healthSummary, metrics)
    };

    const statusCode = response.status === 'healthy' ? 200 : 503;

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[Health API] Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
});

export const POST = withDatabaseErrorHandler(async (request: NextRequest) => {
  try {
    console.log('[Health API] Performing comprehensive database health check...');
    
    const healthCheck = await databaseHealthMonitor.performHealthCheck();
    const connectionTest = await checkDatabaseConnection();
    const metrics = await databaseHealthMonitor.getDatabaseMetrics();

    const response = {
      status: healthCheck.isHealthy && connectionTest ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      comprehensiveCheck: {
        ...healthCheck,
        connectionTest
      },
      metrics,
      recommendations: generateRecommendations(
        databaseHealthMonitor.getHealthSummary(), 
        metrics
      )
    };

    const statusCode = response.status === 'healthy' ? 200 : 503;

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[Health API] Comprehensive health check failed:', error);
    
    return NextResponse.json({
      status: 'critical',
      error: 'Comprehensive health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      action: 'immediate_attention_required'
    }, { status: 503 });
  }
});

function generateRecommendations(
  healthSummary: any, 
  metrics: any
): string[] {
  const recommendations: string[] = [];

  if (healthSummary.recentErrors > 0) {
    recommendations.push('Recent database errors detected. Check database connectivity and server status.');
  }

  if (healthSummary.avgResponseTime > 5000) {
    recommendations.push('High database response times detected. Consider optimizing queries or scaling database resources.');
  }

  if (healthSummary.uptime < 95) {
    recommendations.push('Database uptime is below 95%. Investigate recurring connection issues.');
  }

  if (metrics.errorRate > 10) {
    recommendations.push('Error rate is above 10%. Review database logs and connection pool settings.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Database is operating normally. Continue monitoring.');
  }

  return recommendations;
}