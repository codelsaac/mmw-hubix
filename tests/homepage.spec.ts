import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    await expect(page).toHaveTitle(/MMW Hubix/)
    
    // Check main heading exists
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('should display resource hub', async ({ page }) => {
    await page.goto('/')
    
    // Wait for resources to load
    await page.waitForLoadState('networkidle')
    
    // Check if resource cards are visible
    const resourceCards = page.locator('[class*="resource"]').first()
    await expect(resourceCards).toBeVisible({ timeout: 10000 })
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation exists
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
    
    // Check for navigation links
    const links = nav.locator('a')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display footer', async ({ page }) => {
    await page.goto('/')
    
    // Check footer exists
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('Hydration')
    )
    
    expect(criticalErrors.length).toBe(0)
  })
})
