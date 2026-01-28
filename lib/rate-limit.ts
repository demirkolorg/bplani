import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Redis client - environment variables'dan yapılandırılacak
// Not: Upstash Redis kullanmak istemiyorsanız, alternatif olarak
// memory-based rate limiting de kullanabilirsiniz
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Memory-based fallback for development without Upstash
class MemoryRatelimit {
  private requests: Map<string, { count: number; resetAt: number }> = new Map()
  private limit: number
  private window: number

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.window = windowMs
  }

  async limit(identifier: string) {
    const now = Date.now()
    const key = identifier
    const record = this.requests.get(key)

    // Clean expired entries periodically
    if (Math.random() < 0.01) {
      for (const [k, v] of this.requests.entries()) {
        if (v.resetAt < now) {
          this.requests.delete(k)
        }
      }
    }

    if (!record || record.resetAt < now) {
      // New window
      this.requests.set(key, {
        count: 1,
        resetAt: now + this.window,
      })
      return {
        success: true,
        limit: this.limit,
        remaining: this.limit - 1,
        reset: now + this.window,
      }
    }

    // Within existing window
    if (record.count >= this.limit) {
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        reset: record.resetAt,
      }
    }

    record.count++
    return {
      success: true,
      limit: this.limit,
      remaining: this.limit - record.count,
      reset: record.resetAt,
    }
  }
}

// Login rate limit: 5 attempts per 15 minutes
export const loginRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "ratelimit:login",
    })
  : new MemoryRatelimit(5, 15 * 60 * 1000)

// General API rate limit: 100 requests per minute
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      prefix: "ratelimit:api",
    })
  : new MemoryRatelimit(100, 60 * 1000)

// Heavy API rate limit (search, export): 10 requests per minute
export const heavyApiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "ratelimit:heavy",
    })
  : new MemoryRatelimit(10, 60 * 1000)

// Mutation API rate limit: 30 requests per minute
export const mutationRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "ratelimit:mutation",
    })
  : new MemoryRatelimit(30, 60 * 1000)

/**
 * Get client identifier (IP address or fallback)
 */
export function getClientIdentifier(request: { headers: Headers }): string {
  // Try multiple headers for IP address
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // Fallback to a generic identifier
  return "anonymous"
}
