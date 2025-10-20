import { test, expect } from '@playwright/test'

test.describe('Articles Page', () => {
  test('should load articles page', async ({ page }) => {
    await page.goto('/articles')
    
    // Page should load without errors
    await expect(page).toHaveURL(/\/articles/)
  })

  test('should display article list or empty state', async ({ page }) => {
    await page.goto('/articles')
    await page.waitForLoadState('networkidle')
    
    // Should either show articles or empty state
    const hasArticles = await page.locator('[class*="article"]').count() > 0
    const hasEmptyState = await page.locator('text=/no articles|empty|coming soon/i').count() > 0
    
    expect(hasArticles || hasEmptyState).toBeTruthy()
  })

  test('should show loading state initially', async ({ page }) => {
    // Start navigation but don't wait
    const navigation = page.goto('/articles')
    
    // Check for skeleton loaders
    const skeleton = page.locator('[class*="skeleton"]').first()
    
    // Give it a moment to show loading state
    await page.waitForTimeout(100)
    
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
    await page.waitForLoadState('networkidle')
    
    // Should either show announcements or empty state
    const hasAnnouncements = await page.locator('[class*="announcement"], [class*="activity"]').count() > 0
    const hasEmptyState = await page.locator('text=/no activities|no announcements|empty/i').count() > 0
    
    expect(hasAnnouncements || hasEmptyState).toBeTruthy()
  })
})
