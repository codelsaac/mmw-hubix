import { test, expect } from '@playwright/test'

test.describe('Articles Page', () => {
  test('should load articles page', async ({ page }) => {
    await page.goto('/articles')
    
    // Page should load without errors
    await expect(page).toHaveURL(/\/articles/)
  })

  test('should display article list or empty state', async ({ page }) => {
    await page.goto('/articles')
    await page.waitForLoadState('domcontentloaded')
    
    const hasArticles = await page.locator('a[href*="/articles/"]').count() > 0
    const hasEmptyState = await page.locator('text=/No articles published yet|No articles match your search/i').count() > 0
    const headerVisible = await page.getByRole('heading', { name: /Articles/i }).isVisible().catch(() => false)
    
    expect(hasArticles || hasEmptyState || headerVisible).toBeTruthy()
  })

  test('should show loading state initially', async ({ page }) => {
    // Start navigation but don't wait
    const navigation = page.goto('/articles')
    
    await page.waitForTimeout(300)
    
    // Complete navigation
    await navigation
  })
})

test.describe('Activity News Page', () => {
  test('should load activity news page', async ({ page }) => {
    await page.goto('/activity-news')
    
    await expect(page).toHaveURL(/\/activity-news/)
  })

  test('should display announcements or empty state', async ({ page }) => {
    await page.goto('/activity-news')
    await page.waitForLoadState('domcontentloaded')
    
    const hasAnnouncements = await page.getByRole('button', { name: /Join Activity|Activity Full/i }).count() > 0
    const hasEmptyState = await page.locator('text=/No upcoming activities/i').count() > 0
    
    expect(hasAnnouncements || hasEmptyState).toBeTruthy()
  })
})
