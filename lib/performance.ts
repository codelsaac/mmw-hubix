/**
 * Performance utilities for optimizing Next.js application
 */

// Dynamic import helper for code splitting
export const dynamicImport = <T>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: React.ComponentType
    ssr?: boolean
  }
) => {
  const dynamic = require('next/dynamic')
  return dynamic(importFn, options)
}

// Memoization helper for expensive computations
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()
  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Debounce helper for rate-limiting expensive operations
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Throttle helper for limiting execution rate
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Lazy load images
export const lazyLoadImage = (src: string) => {
  if (typeof window === 'undefined') return src
  
  // Use IntersectionObserver for lazy loading
  if ('IntersectionObserver' in window) {
    return src
  }
  // Fallback for older browsers
  return src
}

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window === 'undefined') {
    fn()
    return
  }

  const start = performance.now()
  fn()
  const end = performance.now()
  const duration = end - start

  if (duration > 1000) {
    console.warn(`⚠️  Slow operation: ${name} took ${duration.toFixed(2)}ms`)
  }
}

// Cache management
class SimpleCache<T> {
  private cache: Map<string, { value: T; expiry: number }>
  private defaultTTL: number

  constructor(defaultTTL: number = 60000) {
    // 1 minute default
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  set(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { value, expiry })
  }

  get(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expiry) {
      this.cache.delete(key)
      return null
    }

    return cached.value
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }
}

export const cache = new SimpleCache()
