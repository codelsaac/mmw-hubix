// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for Next.js
    "style-src 'self' 'unsafe-inline'", // Allow inline styles
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://openrouter.ai",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self' data: blob:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "frame-src 'self' https://www.youtube.com https://youtube.com",
  ].join('; '),
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),
  
  // HSTS (HTTP Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// Development headers (less restrictive)
export const DEV_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://openrouter.ai ws://localhost:* wss://localhost:*",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self' data: blob:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "frame-src 'self' https://www.youtube.com https://youtube.com",
  ].join('; '),
}

// Get appropriate headers based on environment
export function getSecurityHeaders(): Record<string, string> {
  return process.env.NODE_ENV === 'production' 
    ? SECURITY_HEADERS 
    : DEV_SECURITY_HEADERS
}

// Apply security headers to response
export function applySecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders()
  
  // Add security headers to response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Security headers middleware for Next.js
export function withSecurityHeaders(handler: (req: Request, ...args: any[]) => Promise<Response>) {
  return async (req: Request, ...args: any[]) => {
    const response = await handler(req, ...args)
    
    if (response instanceof Response) {
      return applySecurityHeaders(response)
    }
    
    return response
  }
}