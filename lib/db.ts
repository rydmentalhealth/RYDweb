import { PrismaClient } from "@/lib/generated/prisma";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create Prisma client with proper configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Initialize Prisma client with error handling
let prisma: PrismaClient;
try {
  prisma = globalForPrisma.prisma || createPrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  // Don't throw during build, just log the error
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
    console.warn('Prisma client initialization failed during Vercel build, continuing...');
    // Create a minimal client for build purposes
    prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
        },
      },
    });
  } else {
    throw new Error('Database connection failed');
  }
}

// Export db as an alias for prisma to maintain backward compatibility
export const db = prisma;

// Also export prisma directly for backward compatibility
export { prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 