import { NextRequest, NextResponse } from 'next/server';

/**
 * Database Error Handler Middleware
 * Provides graceful error handling for database connection issues
 */

export interface DatabaseError extends Error {
  code?: string;
  meta?: any;
}

export function isDatabaseConnectionError(error: any): boolean {
  if (!error) return false;
  
  // Prisma connection errors
  const connectionErrorCodes = [
    'P1001', // Can't reach database server
    'P1002', // Database server timeout
    'P1003', // Database does not exist
    'P1008', // Operations timed out
    'P1009', // Database already exists
    'P1010', // User denied access
    'P1011', // Error opening TLS connection
    'P1012', // Schema validation error
    'P1013', // Invalid database string
    'P1014', // Underlying kind for type does not exist
    'P1015', // Unsupported features
    'P1016', // Incorrect number of parameters
    'P1017', // Server closed connection
  ];
  
  return connectionErrorCodes.includes(error.code) || 
         error.message?.includes('ECONNREFUSED') ||
         error.message?.includes('ENOTFOUND') ||
         error.message?.includes('ETIMEDOUT') ||
         error.message?.includes('Connection terminated') ||
         error.message?.includes('Environment variable not found: DATABASE_URL');
}

export function isQueryTimeoutError(error: any): boolean {
  return error?.code === 'P1008' || 
         error?.message?.includes('timeout') ||
         error?.message?.includes('Query timeout');
}

export function handleDatabaseError(error: DatabaseError, context: string = 'Database operation'): NextResponse {
  console.error(`[Database Error Handler] ${context}:`, {
    code: error.code,
    message: error.message,
    meta: error.meta,
    stack: error.stack
  });

  if (isDatabaseConnectionError(error)) {
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        code: 'INTERNAL_FUNCTION_INVOCATION_FAILED',
        message: 'Database connection is currently unavailable. Please try again in a few moments.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString(),
        retryAfter: 30 // seconds
      },
      { 
        status: 503, // Service Unavailable
        headers: {
          'Retry-After': '30',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }

  if (isQueryTimeoutError(error)) {
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        code: 'QUERY_TIMEOUT',
        message: 'The request took too long to process. Please try again.',
        timestamp: new Date().toISOString(),
        retryAfter: 10
      },
      { 
        status: 504, // Gateway Timeout
        headers: {
          'Retry-After': '10',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }

  // Generic database error
  return NextResponse.json(
    {
      error: 'INTERNAL_SERVER_ERROR',
      code: 'DATABASE_ERROR',
      message: 'An unexpected database error occurred. Please try again.',
      timestamp: new Date().toISOString()
    },
    { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
}

/**
 * Wrapper function for API routes to handle database errors consistently
 */
export function withDatabaseErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleDatabaseError(error as DatabaseError, 'API Route');
    }
  };
}

/**
 * Enhanced error response for authentication failures
 */
export function handleAuthenticationError(error: DatabaseError): NextResponse {
  console.error('[Auth Error Handler] Authentication failed:', {
    code: error.code,
    message: error.message,
    timestamp: new Date().toISOString()
  });

  if (isDatabaseConnectionError(error)) {
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        code: 'INTERNAL_FUNCTION_INVOCATION_FAILED',
        message: 'Authentication service is temporarily unavailable. Please try again shortly.',
        timestamp: new Date().toISOString(),
        retryAfter: 30
      },
      { 
        status: 503,
        headers: {
          'Retry-After': '30',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }

  return NextResponse.json(
    {
      error: 'AUTHENTICATION_FAILED',
      message: 'Authentication failed. Please check your credentials and try again.',
      timestamp: new Date().toISOString()
    },
    { status: 401 }
  );
}