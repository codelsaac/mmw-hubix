// Rate limiting implementation
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: Request) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  private getKey(req: Request, keyGenerator?: (req: Request) => string): string {
    if (keyGenerator) {
      return keyGenerator(req)
    }
    
    // Default: use IP address
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return ip
  }

  async checkLimit(req: Request, config: RateLimitConfig): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    const key = this.getKey(req, config.keyGenerator)
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Get or create entry for this key
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }

    const entry = this.store[key]
    
    // Reset if window has passed
    if (entry.resetTime < now) {
      entry.count = 0
      entry.resetTime = now + config.windowMs
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }

    // Increment counter
    entry.count++

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter()

// Rate limit configurations
export const RATE_LIMITS = {
  // General API requests (public endpoints)
  GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  },
  
  // Authenticated user requests (dashboard, profile, etc)
  AUTH: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60
  },
  
  // File uploads
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10
  },
  
  // Chat API
  CHAT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20
  },
  
  // Admin operations
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30
  }
}

// Rate limiting middleware
export async function rateLimit(
  req: Request, 
  config: RateLimitConfig,
  customKeyGenerator?: (req: Request) => string
) {
  const result = await rateLimiter.checkLimit(req, {
    ...config,
    keyGenerator: customKeyGenerator
  })

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: result.retryAfter,
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
        }
      }
    )
  }

  return null // No rate limit exceeded
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    rateLimiter.destroy()
  })
}