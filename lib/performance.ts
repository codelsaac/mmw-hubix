// Performance optimization utilities

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memoization for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// Lazy loading utility
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc)
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  
  React.useEffect(() => {
    if (!elementRef.current) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      options
    )
    
    observer.observe(elementRef.current)
    
    return () => {
      observer.disconnect()
    }
  }, [elementRef, options])
  
  return isIntersecting
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private marks: Map<string, number> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  mark(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      this.marks.set(name, performance.now())
    }
  }
  
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = this.marks.get(startMark)
      const endTime = endMark ? this.marks.get(endMark) : performance.now()
      
      if (startTime !== undefined && endTime !== undefined) {
        const duration = endTime - startTime
        performance.mark(`${name}-start`)
        performance.mark(`${name}-end`)
        performance.measure(name, `${name}-start`, `${name}-end`)
        return duration
      }
    }
    return null
  }
  
  getMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {}
    
    if (typeof window !== 'undefined' && window.performance) {
      const entries = performance.getEntriesByType('measure')
      entries.forEach(entry => {
        metrics[entry.name] = entry.duration
      })
    }
    
    return metrics
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()