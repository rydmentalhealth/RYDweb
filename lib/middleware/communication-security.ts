import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Rate limiting for communication endpoints
 */
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, endpoint: string, limit: number = 60, windowMs: number = 60000): boolean {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const userLimit = rateLimits.get(key);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Content moderation - basic profanity and spam detection
 */
export function moderateContent(content: string): { allowed: boolean; reason?: string } {
  // Basic profanity filter (extend as needed)
  const profanityWords = [
    // Add inappropriate words here
    'spam', 'scam', 'fake'
  ];

  const lowerContent = content.toLowerCase();
  
  // Check for profanity
  for (const word of profanityWords) {
    if (lowerContent.includes(word)) {
      return { allowed: false, reason: 'Contains inappropriate content' };
    }
  }

  // Check for excessive caps (more than 70% uppercase)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.7 && content.length > 10) {
    return { allowed: false, reason: 'Excessive use of capital letters' };
  }

  // Check for excessive repetition
  const words = content.split(/\s+/);
  const wordCount = new Map<string, number>();
  for (const word of words) {
    wordCount.set(word.toLowerCase(), (wordCount.get(word.toLowerCase()) || 0) + 1);
  }

  for (const [word, count] of wordCount.entries()) {
    if (count > 5 && word.length > 2) {
      return { allowed: false, reason: 'Excessive repetition detected' };
    }
  }

  return { allowed: true };
}

/**
 * Check if user has permission to access a channel
 */
export async function checkChannelAccess(userId: string, channelId: string): Promise<boolean> {
  try {
    const membership = await prisma.chatMember.findFirst({
      where: {
        channelId,
        userId,
        leftAt: null,
      },
    });

    return !!membership;
  } catch (error) {
    console.error('Error checking channel access:', error);
    return false;
  }
}

/**
 * Check if user can create announcements
 */
export async function checkAnnouncementPermissions(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) return false;

    return [
      'SUPER_ADMIN', 'CEO', 'CFO', 'ADMIN', 'DIRECTOR', 'HR_OFFICER', 'TEAM_LEAD'
    ].includes(user.role);
  } catch (error) {
    console.error('Error checking announcement permissions:', error);
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate file uploads
 */
export function validateFileUpload(file: { 
  fileName: string; 
  fileType: string; 
  fileSize?: number; 
}): { valid: boolean; reason?: string } {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv',
    'audio/mpeg', 'audio/wav', 'audio/ogg'
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.fileType)) {
    return { valid: false, reason: 'File type not allowed' };
  }

  if (file.fileSize && file.fileSize > maxSize) {
    return { valid: false, reason: 'File size too large (max 10MB)' };
  }

  // Check file name for malicious patterns
  const dangerousPatterns = /\.(exe|bat|cmd|scr|pif|com|jar|js|vbs|ps1)$/i;
  if (dangerousPatterns.test(file.fileName)) {
    return { valid: false, reason: 'Potentially dangerous file type' };
  }

  return { valid: true };
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  userId: string, 
  event: string, 
  details: any, 
  severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action: `SECURITY_${event}`,
        resource: 'communication',
        details: {
          event,
          severity,
          timestamp: new Date().toISOString(),
          ...details,
        },
      },
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

/**
 * Comprehensive security middleware for communication endpoints
 */
export async function communicationSecurityMiddleware(
  request: NextRequest,
  endpoint: string,
  options: {
    requireAuth?: boolean;
    rateLimit?: { limit: number; windowMs: number };
    requireChannelAccess?: string;
    requireAnnouncementPermissions?: boolean;
    moderateContent?: boolean;
  } = {}
) {
  const {
    requireAuth = true,
    rateLimit,
    requireChannelAccess,
    requireAnnouncementPermissions = false,
    moderateContent = false,
  } = options;

  // Authentication check
  if (requireAuth) {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }

    // Rate limiting
    if (rateLimit) {
      const allowed = checkRateLimit(
        session.user.id, 
        endpoint, 
        rateLimit.limit, 
        rateLimit.windowMs
      );
      
      if (!allowed) {
        await logSecurityEvent(session.user.id, 'RATE_LIMIT_EXCEEDED', {
          endpoint,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        }, 'MEDIUM');
        
        return { error: "Rate limit exceeded", status: 429 };
      }
    }

    // Channel access check
    if (requireChannelAccess) {
      const hasAccess = await checkChannelAccess(session.user.id, requireChannelAccess);
      if (!hasAccess) {
        await logSecurityEvent(session.user.id, 'UNAUTHORIZED_CHANNEL_ACCESS', {
          channelId: requireChannelAccess,
          endpoint,
        }, 'HIGH');
        
        return { error: "Channel access denied", status: 403 };
      }
    }

    // Announcement permissions check
    if (requireAnnouncementPermissions) {
      const hasPermission = await checkAnnouncementPermissions(session.user.id);
      if (!hasPermission) {
        await logSecurityEvent(session.user.id, 'UNAUTHORIZED_ANNOUNCEMENT_ATTEMPT', {
          endpoint,
        }, 'MEDIUM');
        
        return { error: "Insufficient permissions", status: 403 };
      }
    }

    return { userId: session.user.id };
  }

  return {};
}