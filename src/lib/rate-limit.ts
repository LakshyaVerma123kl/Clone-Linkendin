// src/lib/rate-limit.ts

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export default async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);

    return {
      success: true,
      remaining: limit - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment existing entry
  entry.count++;
  rateLimitStore.set(key, entry);

  const success = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    success,
    remaining,
    resetTime: entry.resetTime,
  };
}

// Rate limiting for specific actions
export const rateLimiters = {
  // Authentication attempts
  auth: (identifier: string) => rateLimit(identifier, 5, 15 * 60 * 1000), // 5 attempts per 15 minutes

  // Post creation
  createPost: (identifier: string) => rateLimit(identifier, 10, 60 * 1000), // 10 posts per minute

  // Comment creation
  createComment: (identifier: string) => rateLimit(identifier, 20, 60 * 1000), // 20 comments per minute

  // Like/unlike actions
  toggleLike: (identifier: string) => rateLimit(identifier, 100, 60 * 1000), // 100 likes per minute

  // General API requests
  general: (identifier: string) => rateLimit(identifier, 100, 60 * 1000), // 100 requests per minute

  // Password reset requests
  passwordReset: (identifier: string) =>
    rateLimit(identifier, 3, 60 * 60 * 1000), // 3 attempts per hour

  // Search requests
  search: (identifier: string) => rateLimit(identifier, 50, 60 * 1000), // 50 searches per minute
};

// Advanced rate limiting with different tiers
export async function tieredRateLimit(
  identifier: string,
  tier: "free" | "premium" | "enterprise"
): Promise<RateLimitResult> {
  const limits = {
    free: { requests: 100, window: 60 * 60 * 1000 }, // 100 per hour
    premium: { requests: 1000, window: 60 * 60 * 1000 }, // 1000 per hour
    enterprise: { requests: 10000, window: 60 * 60 * 1000 }, // 10000 per hour
  };

  const config = limits[tier];
  return rateLimit(identifier, config.requests, config.window);
}

// Sliding window rate limiter (more accurate)
export class SlidingWindowRateLimit {
  private windows = new Map<string, number[]>();

  async checkLimit(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create window for this identifier
    let timestamps = this.windows.get(identifier) || [];

    // Remove timestamps outside the window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    // Check if limit would be exceeded
    if (timestamps.length >= limit) {
      const oldestTimestamp = Math.min(...timestamps);
      const resetTime = oldestTimestamp + windowMs;

      return {
        success: false,
        remaining: 0,
        resetTime,
      };
    }

    // Add current timestamp
    timestamps.push(now);
    this.windows.set(identifier, timestamps);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      // 1% chance
      this.cleanup();
    }

    return {
      success: true,
      remaining: limit - timestamps.length,
      resetTime: now + windowMs,
    };
  }

  private cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, timestamps] of this.windows.entries()) {
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < maxAge
      );

      if (validTimestamps.length === 0) {
        this.windows.delete(key);
      } else {
        this.windows.set(key, validTimestamps);
      }
    }
  }
}

// Global sliding window instance
export const slidingWindowLimiter = new SlidingWindowRateLimit();

// Rate limit middleware for Next.js API routes
export function withRateLimit(
  limit: number,
  windowMs: number,
  keyGenerator?: (req: any) => string
) {
  return async function (req: any, res: any, next: () => void) {
    const identifier = keyGenerator
      ? keyGenerator(req)
      : req.ip || req.connection.remoteAddress || "anonymous";

    const result = await rateLimit(identifier, limit, windowMs);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000));

    if (!result.success) {
      return res.status(429).json({
        success: false,
        error: "Too many requests",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
    }

    next();
  };
}
