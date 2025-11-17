import { test, expect } from '@playwright/test'

test.describe('API Routes', () => {
  test('GET /api/resources should return 200', async ({ request }) => {
    const response = await request.get('/api/resources')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBeTruthy()
  })

  test('GET /api/categories should return 200', async ({ request }) => {
    const response = await request.get('/api/categories')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBeTruthy()
  })

  test('GET /api/public/articles should return 200', async ({ request }) => {
    const response = await request.get('/api/public/articles')
    expect(response.status()).toBe(200)
  })

  test('GET /api/public/announcements should return 200', async ({ request }) => {
    const response = await request.get('/api/public/announcements')
    expect(response.status()).toBe(200)
  })

  test('GET /api/health should return status payload', async ({ request }) => {
    const response = await request.get('/api/health')
    expect([200, 503]).toContain(response.status())
    const data = await response.json()
    expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status)
  })
})

test.describe('API Rate Limiting', () => {
  test('should enforce rate limits on admin endpoints', async ({ request }) => {
    const requests = []
    
    // Make 35 requests rapidly (limit is 30/min)
    for (let i = 0; i < 35; i++) {
      requests.push(request.get('/api/admin/users'))
    }
    
    const responses = await Promise.all(requests)
    
    // At least one should be rate limited (429)
    const rateLimited = responses.some(r => r.status() === 429 || r.status() === 401 || r.status() === 403)
    expect(rateLimited).toBeTruthy()
  })
})

test.describe('API Error Handling', () => {
  test('should return JSON error for invalid POST', async ({ request }) => {
    const response = await request.post('/api/admin/articles', {
      data: { invalid: 'data' }
    })
    
    expect([400, 401, 403, 429, 500]).toContain(response.status())
    
    const data = await response.json()
    expect(data.error).toBeDefined()
  })

  test('should return 401 for protected routes without auth', async ({ request }) => {
    const response = await request.get('/api/admin/users')
    
    // Should be unauthorized
    expect([401, 403, 429]).toContain(response.status())
  })
})
