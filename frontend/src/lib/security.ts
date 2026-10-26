/**
 * Sanitizes input strings by stripping HTML tags, scripts, and potential XSS vectors.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    // Strip script and style blocks entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip any HTML tags
    .replace(/<[^>]+>/g, '')
    // Strip javascript: pseudo-protocols
    .replace(/javascript:/gi, '')
    // Strip event handler patterns like onload= or onclick=
    .replace(/on\w+=/gi, '')
    // Normalize extra whitespace
    .trim();
}

/**
 * In-memory sliding-window rate limiter per user/token.
 * Default: Maximum 1 review submission per user per 60 seconds (60,000 ms).
 */
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale memory records every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      const active = record.timestamps.filter((ts) => now - ts < 60000);
      if (active.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, { timestamps: active });
      }
    }
  }, 600000);
}

export interface RateLimitResult {
  isAllowed: boolean;
  retryAfterSeconds?: number;
}

export function checkReviewRateLimit(
  userId: string,
  maxRequests = 1,
  windowMs = 60000
): RateLimitResult {
  const now = Date.now();
  const userRecord = rateLimitStore.get(userId) || { timestamps: [] };

  // Keep only timestamps within the current sliding window
  const recentTimestamps = userRecord.timestamps.filter((ts) => now - ts < windowMs);

  if (recentTimestamps.length >= maxRequests) {
    const oldestTimestamp = recentTimestamps[0];
    const retryAfterMs = windowMs - (now - oldestTimestamp);
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return {
      isAllowed: false,
      retryAfterSeconds,
    };
  }

  // Record this attempt
  recentTimestamps.push(now);
  rateLimitStore.set(userId, { timestamps: recentTimestamps });

  return { isAllowed: true };
}
