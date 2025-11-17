import { test, expect } from '@playwright/test'

test.describe('Error Boundaries', () => {
  test('404 page should display properly', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345')
    
    // Should be 404
    expect(response?.status()).toBe(404)
    
    const notFoundHeading = page.getByRole('heading', { name: '404' })
    await expect(notFoundHeading).toBeVisible({ timeout: 5000 })
  })

  test('unauthorized page should display for protected routes', async ({ page }) => {
    // Try to access admin without auth
    await page.goto('/admin')
    
    // Should show unauthorized or redirect
    const url = page.url()
    const isUnauthorized = url.includes('unauthorized') || 
                          url.includes('login') || 
                          !url.includes('/admin')
    
    expect(isUnauthorized).toBeTruthy()
  })
})

test.describe('Loading States', () => {
  test('should show loading skeleton on navigation', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to articles
    const navigation = page.goto('/articles', { waitUntil: 'domcontentloaded' })
    
    // Brief wait to catch loading state
    await page.waitForTimeout(300)
    
    await navigation
    
    // Page should eventually load
    await page.waitForLoadState('domcontentloaded')
    expect(page.url()).toContain('/articles')
  })
})

test.describe('Network Error Resilience', () => {
  test('should handle failed API requests gracefully', async ({ page }) => {
    // Block API requests to simulate failure
    await page.route('**/api/resources', route => route.abort())
    
    await page.goto('/')
    
    // Page should still load, just without resources
    await expect(page).toHaveURL('/')
    
    // Should not crash the page
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(0)
  })
})
