import { randomBytes, createHmac } from 'crypto'

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>()

// CSRF configuration
const CSRF_CONFIG = {
  secret: process.env.CSRF_SECRET || 'your-csrf-secret-key',
  tokenLength: 32,
  tokenExpiry: 60 * 60 * 1000, // 1 hour
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
}

// Generate CSRF token
export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(CSRF_CONFIG.tokenLength).toString('hex')
  const expires = Date.now() + CSRF_CONFIG.tokenExpiry
  
  // Store token with session ID
  csrfTokens.set(sessionId, { token, expires })
  
  return token
}

// Verify CSRF token
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId)
  
  if (!stored) {
    return false
  }
  
  // Check if token expired
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId)
    return false
  }
  
  // Verify token matches
  return stored.token === token
}

// Generate CSRF token for response
export function generateCSRFTokenForResponse(sessionId: string): string {
  const token = generateCSRFToken(sessionId)
  
  // Create HMAC signature for additional security
  const hmac = createHmac('sha256', CSRF_CONFIG.secret)
  hmac.update(token)
  hmac.update(sessionId)
  
  return `${token}.${hmac.digest('hex')}`
}

// Verify CSRF token with HMAC
export function verifyCSRFTokenWithHMAC(sessionId: string, signedToken: string): boolean {
  const [token, signature] = signedToken.split('.')
  
  if (!token || !signature) {
    return false
  }
  
  // Verify HMAC signature
  const hmac = createHmac('sha256', CSRF_CONFIG.secret)
  hmac.update(token)
  hmac.update(sessionId)
  
  const expectedSignature = hmac.digest('hex')
  
  if (signature !== expectedSignature) {
    return false
  }
  
  // Verify the token itself
  return verifyCSRFToken(sessionId, token)
}

// Cleanup expired tokens
export function cleanupExpiredTokens(): void {
  const now = Date.now()
  
  for (const [sessionId, tokenData] of csrfTokens.entries()) {
    if (now > tokenData.expires) {
      csrfTokens.delete(sessionId)
    }
  }
}

// CSRF middleware for API routes
export async function csrfProtection(req: Request, sessionId: string): Promise<{
  valid: boolean
  error?: string
  token?: string
}> {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return { valid: true, token: generateCSRFTokenForResponse(sessionId) }
  }
  
  // Get CSRF token from headers
  const csrfToken = req.headers.get('x-csrf-token')
  
  if (!csrfToken) {
    return { 
      valid: false, 
      error: 'CSRF token missing. Please include X-CSRF-Token header.' 
    }
  }
  
  // Verify token
  if (!verifyCSRFTokenWithHMAC(sessionId, csrfToken)) {
    return { 
      valid: false, 
      error: 'Invalid CSRF token. Please refresh the page and try again.' 
    }
  }
  
  return { valid: true }
}

// Set up cleanup interval
if (typeof process !== 'undefined') {
  setInterval(cleanupExpiredTokens, CSRF_CONFIG.cleanupInterval)
}

// CSRF token endpoint
export async function getCSRFToken(sessionId: string): Promise<{ token: string }> {
  return {
    token: generateCSRFTokenForResponse(sessionId)
  }
}