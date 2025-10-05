// Monitoring and analytics utilities

interface Metric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

interface Event {
  name: string
  data: Record<string, any>
  timestamp: number
  userId?: string
  sessionId?: string
}

class MonitoringService {
  private metrics: Metric[] = []
  private events: Event[] = []
  private maxMetrics = 1000
  private maxEvents = 1000

  // Track a metric
  trackMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  // Track an event
  trackEvent(name: string, data: Record<string, any>, userId?: string, sessionId?: string): void {
    const event: Event = {
      name,
      data,
      timestamp: Date.now(),
      userId,
      sessionId
    }

    this.events.push(event)

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
  }

  // Get metrics by name
  getMetrics(name: string, timeRange?: { start: number; end: number }): Metric[] {
    let filtered = this.metrics.filter(m => m.name === name)

    if (timeRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      )
    }

    return filtered
  }

  // Get events by name
  getEvents(name: string, timeRange?: { start: number; end: number }): Event[] {
    let filtered = this.events.filter(e => e.name === name)

    if (timeRange) {
      filtered = filtered.filter(e => 
        e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
      )
    }

    return filtered
  }

  // Get all metrics
  getAllMetrics(): Metric[] {
    return [...this.metrics]
  }

  // Get all events
  getAllEvents(): Event[] {
    return [...this.events]
  }

  // Clear old data
  clearOldData(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
    this.events = this.events.filter(e => e.timestamp > cutoff)
  }

  // Get summary statistics
  getSummary(): {
    totalMetrics: number
    totalEvents: number
    metricsByType: Record<string, number>
    eventsByType: Record<string, number>
  } {
    const metricsByType: Record<string, number> = {}
    const eventsByType: Record<string, number> = {}

    this.metrics.forEach(m => {
      metricsByType[m.name] = (metricsByType[m.name] || 0) + 1
    })

    this.events.forEach(e => {
      eventsByType[e.name] = (eventsByType[e.name] || 0) + 1
    })

    return {
      totalMetrics: this.metrics.length,
      totalEvents: this.events.length,
      metricsByType,
      eventsByType
    }
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService()

// Performance monitoring decorator
export function trackPerformance(name: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = Date.now()
      
      try {
        const result = await method.apply(this, args)
        const duration = Date.now() - start
        
        monitoring.trackMetric(`performance.${name}`, duration, {
          status: 'success',
          method: propertyName
        })
        
        return result
      } catch (error) {
        const duration = Date.now() - start
        
        monitoring.trackMetric(`performance.${name}`, duration, {
          status: 'error',
          method: propertyName,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        throw error
      }
    }
  }
}

// API request monitoring
export function trackApiRequest(req: Request, response: Response, duration: number): void {
  const method = req.method
  const url = new URL(req.url)
  const path = url.pathname
  const status = response.status

  monitoring.trackMetric('api.request.duration', duration, {
    method,
    path,
    status: status.toString()
  })

  monitoring.trackEvent('api.request', {
    method,
    path,
    status,
    duration,
    userAgent: req.headers.get('user-agent') || 'unknown'
  })
}

// User action tracking
export function trackUserAction(action: string, data: Record<string, any>, userId?: string): void {
  monitoring.trackEvent('user.action', {
    action,
    ...data
  }, userId)
}

// Error tracking
export function trackError(error: Error, context?: Record<string, any>): void {
  monitoring.trackEvent('error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context
  })

  monitoring.trackMetric('error.count', 1, {
    type: error.name,
    message: error.message.substring(0, 100)
  })
}

// Database operation tracking
export function trackDatabaseOperation(operation: string, table: string, duration: number, success: boolean): void {
  monitoring.trackMetric('database.operation.duration', duration, {
    operation,
    table,
    success: success.toString()
  })

  monitoring.trackEvent('database.operation', {
    operation,
    table,
    duration,
    success
  })
}

// Memory usage tracking
export function trackMemoryUsage(): void {
  if (typeof process === 'undefined') return

  const usage = process.memoryUsage()
  const heapUsedMB = usage.heapUsed / 1024 / 1024
  const heapTotalMB = usage.heapTotal / 1024 / 1024
  const externalMB = usage.external / 1024 / 1024

  monitoring.trackMetric('memory.heap.used', heapUsedMB)
  monitoring.trackMetric('memory.heap.total', heapTotalMB)
  monitoring.trackMetric('memory.external', externalMB)
  monitoring.trackMetric('memory.heap.usage_percent', (heapUsedMB / heapTotalMB) * 100)
}

// Set up periodic monitoring
if (typeof process !== 'undefined') {
  // Track memory usage every 30 seconds
  setInterval(trackMemoryUsage, 30 * 1000)

  // Clear old data every hour
  setInterval(() => {
    monitoring.clearOldData()
  }, 60 * 60 * 1000)
}

// Export monitoring instance
export default monitoring