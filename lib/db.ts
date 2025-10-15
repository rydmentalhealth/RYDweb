import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use the Prisma Accelerate URL if available, otherwise fall back to DATABASE_URL
// Check for the accelerate URL first (it has the api_key parameter)
const databaseUrl = process.env.PRISMA_DATABASE_URL?.includes('accelerate.prisma-data.net') 
  ? process.env.PRISMA_DATABASE_URL 
  : process.env.DATABASE_URL;

// Debug logging for database URL selection
if (process.env.NODE_ENV === 'production') {
  console.log('[Database] URL Selection:', {
    hasAccelerateUrl: !!process.env.PRISMA_DATABASE_URL?.includes('accelerate.prisma-data.net'),
    selectedUrl: databaseUrl?.substring(0, 50) + '...',
    urlType: databaseUrl?.startsWith('prisma+postgres://accelerate') ? 'Accelerate' : 'Standard'
  });
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Export db as an alias for prisma to maintain backward compatibility
export const db = prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 