import { logger } from './logger'

export interface AppError extends Error {
  code?: string
  statusCode?: number
  isOperational?: boolean
}

export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR'
  statusCode = 400
  isOperational = true

  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error implements AppError {
  code = 'AUTHENTICATION_ERROR'
  statusCode = 401
  isOperational = true

  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error implements AppError {
  code = 'AUTHORIZATION_ERROR'
  statusCode = 403
  isOperational = true

  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error implements AppError {
  code = 'NOT_FOUND'
  statusCode = 404
  isOperational = true

  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error implements AppError {
  code = 'CONFLICT'
  statusCode = 409
  isOperational = true

  constructor(message: string = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error implements AppError {
  code = 'RATE_LIMIT'
  statusCode = 429
  isOperational = true

  constructor(message: string = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class InternalServerError extends Error implements AppError {
  code = 'INTERNAL_SERVER_ERROR'
  statusCode = 500
  isOperational = false

  constructor(message: string = 'Internal server error') {
    super(message)
    this.name = 'InternalServerError'
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): { message: string; statusCode: number } {
  if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof AuthorizationError || error instanceof NotFoundError) {
    logger.error(`API Error [${error.code}]:`, error.message)
    return {
      message: error.message,
      statusCode: error.statusCode || 500
    }
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> }
    const message = zodError.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')
    
    logger.error('Validation Error:', message)
    return {
      message: `Validation failed: ${message}`,
      statusCode: 400
    }
  }

  // Handle unknown errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  logger.error('Unknown Error:', error)
  
  return {
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : message,
    statusCode: 500
  }
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    // Client-side error handling
    window.addEventListener('error', (event) => {
      logger.error('Global Error:', event.error)
    })

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled Promise Rejection:', event.reason)
      event.preventDefault() // Prevent the default browser behavior
    })
  }

  if (typeof process !== 'undefined') {
    // Server-side error handling
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection:', reason)
    })

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error)
      process.exit(1) // Exit the process for uncaught exceptions
    })
  }
}