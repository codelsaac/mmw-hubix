// Production-safe logging utility
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, ...args)
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, ...args)
    }
    // In production, you might want to send to a logging service
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }
}

// Replace console.log usage
export function replaceConsoleLogs() {
  if (typeof window !== 'undefined') {
    // Client-side
    (window as any).console = {
      ...console,
      log: logger.log,
      error: logger.error,
      warn: logger.warn,
      info: logger.info
    }
  }
}