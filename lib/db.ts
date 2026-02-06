import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use the Prisma Accelerate URL if available, otherwise fall back to DATABASE_URL
// Check for the accelerate URL first (it has the api_key parameter)
let databaseUrl = process.env.PRISMA_DATABASE_URL?.includes('accelerate.prisma-data.net') 
  ? process.env.PRISMA_DATABASE_URL 
  : process.env.DATABASE_URL;

// Clean up any whitespace or formatting issues in the URL
if (databaseUrl) {
  databaseUrl = databaseUrl.replace(/\s+/g, '').trim();
}

// Fallback URL for build time when DATABASE_URL is not available
const fallbackUrl = 'postgresql://user:password@localhost:5432/ryd_dev';

// Debug logging for database URL selection
if (process.env.NODE_ENV === 'production') {
  console.log('[Database] URL Selection:', {
    hasAccelerateUrl: !!process.env.PRISMA_DATABASE_URL?.includes('accelerate.prisma-data.net'),
    selectedUrl: databaseUrl?.substring(0, 50) + '...',
    urlType: databaseUrl?.startsWith('prisma://accelerate') ? 'Accelerate' : 
             databaseUrl?.startsWith('prisma+postgres://accelerate') ? 'Accelerate (Wrong Format)' : 'Standard'
  });
  
  // Warn about incorrect Accelerate URL format
  if (process.env.PRISMA_DATABASE_URL?.includes('prisma+postgres://')) {
    console.warn('[Database] WARNING: Prisma Accelerate URL uses incorrect protocol. Use "prisma://" instead of "prisma+postgres://"');
  }
}

// Create a single PrismaClient instance and conditionally enable Accelerate
const baseClient = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl || fallbackUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Enable Accelerate via either PRISMA_DATABASE_URL (preferred) or POSTGRES_URL
const rawAccelerateUrl = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || databaseUrl;
export const isAccelerateEnabled = Boolean(
  rawAccelerateUrl &&
  (rawAccelerateUrl.includes('accelerate.prisma-data.net') || rawAccelerateUrl.startsWith('prisma://'))
);

export const prisma = (globalForPrisma.prisma || (isAccelerateEnabled ? baseClient.$extends(withAccelerate()) : baseClient)) as typeof baseClient;

// Export db as an alias for prisma to maintain backward compatibility
export const db = prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 