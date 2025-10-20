import { prisma, checkDatabaseConnection } from '@/lib/db';

/**
 * Database Health Monitoring Service
 * Monitors database connection health and provides recovery mechanisms
 */

interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
  timestamp: Date;
}

interface DatabaseMetrics {
  connectionCount: number;
  activeQueries: number;
  avgResponseTime: number;
  errorRate: number;
  lastHealthCheck: Date;
}

class DatabaseHealthMonitor {
  private healthHistory: HealthCheckResult[] = [];
  private maxHistorySize = 100;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  /**
   * Perform a comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test basic connection
      await prisma.$connect();
      
      // Test a simple query
      await prisma.$queryRaw`SELECT 1 as health_check`;
      
      // Test user table accessibility (critical for auth)
      await prisma.user.count({ take: 1 });
      
      const responseTime = Date.now() - startTime;
      
      const result: HealthCheckResult = {
        isHealthy: true,
        responseTime,
        timestamp: new Date()
      };
      
      this.addToHistory(result);
      console.log(`[Database Health] ✅ Health check passed (${responseTime}ms)`);
      
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: HealthCheckResult = {
        isHealthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
      
      this.addToHistory(result);
      console.error(`[Database Health] ❌ Health check failed (${responseTime}ms):`, error);
      
      return result;
    }
  }

  /**
   * Get current database metrics
   */
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    const recentChecks = this.healthHistory.slice(-10);
    const healthyChecks = recentChecks.filter(check => check.isHealthy);
    
    const avgResponseTime = recentChecks.length > 0 
      ? recentChecks.reduce((sum, check) => sum + check.responseTime, 0) / recentChecks.length
      : 0;
    
    const errorRate = recentChecks.length > 0 
      ? ((recentChecks.length - healthyChecks.length) / recentChecks.length) * 100
      : 0;

    return {
      connectionCount: 0, // Would need database-specific query
      activeQueries: 0,   // Would need database-specific query
      avgResponseTime,
      errorRate,
      lastHealthCheck: this.healthHistory[this.healthHistory.length - 1]?.timestamp || new Date()
    };
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.isMonitoring) {
      console.warn('[Database Health] Monitoring already started');
      return;
    }

    console.log(`[Database Health] Starting health monitoring (interval: ${intervalMs}ms)`);
    this.isMonitoring = true;
    
    // Perform initial health check
    this.performHealthCheck();
    
    // Set up periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.isMonitoring = false;
    console.log('[Database Health] Health monitoring stopped');
  }

  /**
   * Get health status summary
   */
  getHealthSummary(): {
    isHealthy: boolean;
    recentErrors: number;
    avgResponseTime: number;
    uptime: number;
  } {
    const recentChecks = this.healthHistory.slice(-10);
    const recentErrors = recentChecks.filter(check => !check.isHealthy).length;
    const avgResponseTime = recentChecks.length > 0 
      ? recentChecks.reduce((sum, check) => sum + check.responseTime, 0) / recentChecks.length
      : 0;
    
    const totalChecks = this.healthHistory.length;
    const healthyChecks = this.healthHistory.filter(check => check.isHealthy).length;
    const uptime = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100;

    return {
      isHealthy: recentErrors === 0 && recentChecks.length > 0,
      recentErrors,
      avgResponseTime,
      uptime
    };
  }

  /**
   * Attempt to recover from database connection issues
   */
  async attemptRecovery(): Promise<boolean> {
    console.log('[Database Health] Attempting database recovery...');
    
    try {
      // Disconnect and reconnect
      await prisma.$disconnect();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      await prisma.$connect();
      
      // Test the connection
      const healthCheck = await this.performHealthCheck();
      
      if (healthCheck.isHealthy) {
        console.log('[Database Health] ✅ Recovery successful');
        return true;
      } else {
        console.log('[Database Health] ❌ Recovery failed');
        return false;
      }
    } catch (error) {
      console.error('[Database Health] Recovery attempt failed:', error);
      return false;
    }
  }

  private addToHistory(result: HealthCheckResult): void {
    this.healthHistory.push(result);
    
    // Keep only the most recent results
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(-this.maxHistorySize);
    }
  }
}

// Export singleton instance
export const databaseHealthMonitor = new DatabaseHealthMonitor();

/**
 * Quick health check function for API routes
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[Database Health] Quick health check failed:', error);
    return false;
  }
}

/**
 * Enhanced connection wrapper with automatic recovery
 */
export async function withHealthyConnection<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Quick health check before operation
      if (attempt > 1) {
        const isHealthy = await quickHealthCheck();
        if (!isHealthy) {
          console.log(`[Database Health] Connection unhealthy, attempting recovery...`);
          await databaseHealthMonitor.attemptRecovery();
        }
      }
      
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Database Health] Operation attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`[Database Health] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}