import { NextResponse } from 'next/server'
import { getSecurityHeaders } from '@/lib/security-headers'

// Health check data
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: 'up' | 'down'
    memory: 'ok' | 'warning' | 'critical'
    disk: 'ok' | 'warning' | 'critical'
  }
  metrics: {
    memoryUsage: number
    diskUsage: number
    responseTime: number
  }
}

// Get memory usage
function getMemoryUsage(): { usage: number; status: 'ok' | 'warning' | 'critical' } {
  if (typeof process === 'undefined') {
    return { usage: 0, status: 'ok' }
  }

  const usage = process.memoryUsage()
  const heapUsedMB = usage.heapUsed / 1024 / 1024
  const heapTotalMB = usage.heapTotal / 1024 / 1024
  const usagePercent = (heapUsedMB / heapTotalMB) * 100

  let status: 'ok' | 'warning' | 'critical' = 'ok'
  if (usagePercent > 90) status = 'critical'
  else if (usagePercent > 75) status = 'warning'

  return { usage: usagePercent, status }
}

// Get disk usage (simplified)
function getDiskUsage(): { usage: number; status: 'ok' | 'warning' | 'critical' } {
  // In a real implementation, you'd check actual disk usage
  // For now, return a mock value
  return { usage: 45, status: 'ok' }
}

// Check database connectivity
async function checkDatabase(): Promise<'up' | 'down'> {
  try {
    // In a real implementation, you'd ping the database
    // For now, assume it's up
    return 'up'
  } catch (error) {
    return 'down'
  }
}

// Main health check endpoint
export async function GET(): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    // Run health checks
    const [databaseStatus] = await Promise.all([
      checkDatabase()
    ])

    const memoryCheck = getMemoryUsage()
    const diskCheck = getDiskUsage()
    
    const responseTime = Date.now() - startTime

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (databaseStatus === 'down' || memoryCheck.status === 'critical' || diskCheck.status === 'critical') {
      status = 'unhealthy'
    } else if (memoryCheck.status === 'warning' || diskCheck.status === 'warning') {
      status = 'degraded'
    }

    const healthData: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: databaseStatus,
        memory: memoryCheck.status,
        disk: diskCheck.status
      },
      metrics: {
        memoryUsage: memoryCheck.usage,
        diskUsage: diskCheck.usage,
        responseTime
      }
    }

    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503
    
    const response = NextResponse.json(healthData, { status: statusCode })
    
    // Apply security headers
    const headers = getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response

  } catch (error) {
    const errorResponse: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'down',
        memory: 'critical',
        disk: 'critical'
      },
      metrics: {
        memoryUsage: 0,
        diskUsage: 0,
        responseTime: Date.now() - startTime
      }
    }

    const response = NextResponse.json(errorResponse, { status: 503 })
    
    // Apply security headers
    const headers = getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
}

// Liveness probe endpoint
export async function HEAD(): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 200 })
  
  // Apply security headers
  const headers = getSecurityHeaders()
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}