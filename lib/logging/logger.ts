export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  [key: string]: any;
}

export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      ...meta,
    };

    // Format output based on environment
    if (process.env.NODE_ENV === 'development') {
      // Pretty print in development
      this.prettyPrint(logEntry);
    } else {
      // JSON format for production (easier to parse by log aggregators)
      console.log(JSON.stringify(logEntry));
    }
  }

  private prettyPrint(logEntry: LogEntry) {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m',
    };

    const color = colors[logEntry.level];
    const levelUpper = logEntry.level.toUpperCase().padEnd(5);
    
    console.log(
      `${color}[${levelUpper}]${colors.reset} ${logEntry.timestamp} - ${logEntry.message}`
    );

    if (logEntry.context && Object.keys(logEntry.context).length > 0) {
      console.log('  Context:', logEntry.context);
    }

    if (logEntry.error) {
      console.log('  Error:', logEntry.error.message);
      if (logEntry.error.stack) {
        console.log('  Stack:', logEntry.error.stack);
      }
    }

    if (logEntry.meta) {
      console.log('  Meta:', logEntry.meta);
    }
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  info(message: string, meta?: any) {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, error?: Error, meta?: any) {
    this.log(LogLevel.ERROR, message, {
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
      ...meta,
    });
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, meta?: any) {
    this.info(`${method} ${path}`, { type: 'request', ...meta });
  }

  /**
   * Log API response
   */
  logResponse(method: string, path: string, statusCode: number, duration: number, meta?: any) {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(
      level,
      `${method} ${path} - ${statusCode} (${duration}ms)`,
      { type: 'response', statusCode, duration, ...meta }
    );
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, meta?: any) {
    this.debug(`Database query executed (${duration}ms)`, {
      type: 'database',
      query: query.length > 200 ? query.substring(0, 200) + '...' : query,
      duration,
      ...meta,
    });
  }
}

/**
 * Create a logger instance with optional context
 */
export function createLogger(context?: LogContext): Logger {
  return new Logger(context);
}

/**
 * Global logger instance
 */
export const logger = createLogger();

/**
 * Create request-specific logger from Next.js request
 */
export function createRequestLogger(request: Request, additionalContext?: LogContext): Logger {
  const url = new URL(request.url);
  
  return createLogger({
    path: url.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent') || undefined,
    ...additionalContext,
  });
}
