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
    
    await page.waitForLoadState('domcontentloaded')
    
    const resourceHubHeading = page.getByRole('heading', { level: 2, name: /Resource Hub/i })
    await expect(resourceHubHeading).toBeVisible({ timeout: 10000 })
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    const navs = page.getByRole('navigation')
    const count = await navs.count()
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
    await page.waitForLoadState('domcontentloaded')
    
    // Filter out known/acceptable errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') &&
      !err.includes('Hydration') &&
      !err.includes('/api/admin/settings') &&
      !err.includes('Unauthorized') &&
      !err.includes('Insufficient permissions')
    )
    
    expect(criticalErrors.length).toBe(0)
  })
})
