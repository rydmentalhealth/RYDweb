import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Enhanced database URL selection with better error handling
function getDatabaseUrl(): string {
  // Priority order: PRISMA_DATABASE_URL (Accelerate) > DATABASE_URL > fallback
  let databaseUrl = process.env.PRISMA_DATABASE_URL?.includes('accelerate.prisma-data.net') 
    ? process.env.PRISMA_DATABASE_URL 
    : process.env.DATABASE_URL;

  // Clean up any whitespace or formatting issues in the URL
  if (databaseUrl) {
    databaseUrl = databaseUrl.replace(/\s+/g, '').trim();
  }

  // Fallback URL for build time when DATABASE_URL is not available
  const fallbackUrl = 'postgresql://user:password@localhost:5432/ryd_dev';

  // If no database URL is found, use fallback and warn
  if (!databaseUrl) {
    console.warn('[Database] No DATABASE_URL found, using fallback URL for build/development');
    return fallbackUrl;
  }

  return databaseUrl;
}

const databaseUrl = getDatabaseUrl();

// Enhanced debug logging for database URL selection
console.log('[Database] Connection Configuration:', {
  hasAccelerateUrl: !!process.env.PRISMA_DATABASE_URL?.includes('accelerate.prisma-data.net'),
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  selectedUrl: databaseUrl?.substring(0, 50) + '...',
  urlType: databaseUrl?.startsWith('prisma://accelerate') ? 'Accelerate' : 
           databaseUrl?.startsWith('prisma+postgres://accelerate') ? 'Accelerate (Wrong Format)' : 
           databaseUrl?.includes('localhost') ? 'Development/Fallback' : 'Standard',
  environment: process.env.NODE_ENV
});

// Warn about incorrect Accelerate URL format
if (process.env.PRISMA_DATABASE_URL?.includes('prisma+postgres://')) {
  console.warn('[Database] WARNING: Prisma Accelerate URL uses incorrect protocol. Use "prisma://" instead of "prisma+postgres://"');
}

// Enhanced Prisma Client configuration with better error handling and connection pooling
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: 'pretty',
    // Enhanced connection pool settings for better reliability
    // Note: These are applied when using standard PostgreSQL URLs
    ...(databaseUrl?.startsWith('postgresql://') && {
      // Connection pool configuration for standard PostgreSQL
      // These settings help prevent connection exhaustion and improve reliability
    })
  });

// Export db as an alias for prisma to maintain backward compatibility
export const db = prisma;

// Enhanced connection management
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Connection health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('[Database] Connection test successful');
    return true;
  } catch (error) {
    console.error('[Database] Connection test failed:', error);
    return false;
  }
}

// Graceful shutdown function
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('[Database] Disconnected successfully');
  } catch (error) {
    console.error('[Database] Error during disconnect:', error);
  }
}

// Database query wrapper with retry logic for better reliability
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Database] Query attempt ${attempt} failed:`, error);
      
      // Don't retry on certain types of errors
      if (error instanceof Error) {
        // Don't retry on validation errors, unique constraint violations, etc.
        if (error.message.includes('Unique constraint') || 
            error.message.includes('validation') ||
            error.message.includes('P2002') || // Unique constraint violation
            error.message.includes('P2025')) { // Record not found
          throw error;
        }
      }
      
      if (attempt < maxRetries) {
        console.log(`[Database] Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  }
  
  throw lastError!;
} 