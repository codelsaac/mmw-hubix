// Caching utilities for better performance

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheConfig {
  defaultTTL: number // Time to live in milliseconds
  maxSize: number // Maximum number of entries
  cleanupInterval: number // Cleanup interval in milliseconds
}

class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: CacheConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    }

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    }

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, entry)
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }
}

// Global cache instances
export const caches = {
  // API response cache
  api: new MemoryCache({ defaultTTL: 5 * 60 * 1000, maxSize: 500 }),
  
  // User session cache
  session: new MemoryCache({ defaultTTL: 30 * 60 * 1000, maxSize: 100 }),
  
  // Static data cache
  static: new MemoryCache({ defaultTTL: 60 * 60 * 1000, maxSize: 200 }),
  
  // File cache
  files: new MemoryCache({ defaultTTL: 10 * 60 * 1000, maxSize: 100 })
}

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    // Try to get from cache
    const cached = caches.api.get(key)
    if (cached !== null) {
      return cached
    }
    
    // Execute function and cache result
    const result = fn(...args)
    
    // Handle promises
    if (result instanceof Promise) {
      return result.then(resolved => {
        caches.api.set(key, resolved, ttl)
        return resolved
      })
    }
    
    caches.api.set(key, result, ttl)
    return result
  }) as T
}

// Cache middleware for API routes
export function withCache<T>(
  keyGenerator: (req: Request) => string,
  ttl?: number
) {
  return (handler: (req: Request) => Promise<T>) => {
    return async (req: Request): Promise<T> => {
      const key = keyGenerator(req)
      
      // Try to get from cache
      const cached = caches.api.get(key)
      if (cached !== null) {
        return cached
      }
      
      // Execute handler and cache result
      const result = await handler(req)
      caches.api.set(key, result, ttl)
      
      return result
    }
  }
}

// Cache invalidation
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    caches.api.clear()
    return
  }
  
  // Simple pattern matching (in production, use more sophisticated matching)
  for (const key of caches.api['cache'].keys()) {
    if (key.includes(pattern)) {
      caches.api.delete(key)
    }
  }
}

// Cache statistics
export function getCacheStats() {
  return {
    api: {
      size: caches.api.size(),
      maxSize: caches.api['config'].maxSize
    },
    session: {
      size: caches.session.size(),
      maxSize: caches.session['config'].maxSize
    },
    static: {
      size: caches.static.size(),
      maxSize: caches.static['config'].maxSize
    },
    files: {
      size: caches.files.size(),
      maxSize: caches.files['config'].maxSize
    }
  }
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    Object.values(caches).forEach(cache => cache.destroy())
  })
}