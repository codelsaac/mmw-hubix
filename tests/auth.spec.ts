import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login button when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Look for login/sign in button
    const loginButton = page.getByRole('button', { name: /login|sign in|登入/i })
    await expect(loginButton).toBeVisible({ timeout: 5000 })
  })

  test('should open login dialog on click', async ({ page }) => {
    await page.goto('/')
    
    // Click login button
    const loginButton = page.getByRole('button', { name: /login|sign in|登入/i }).first()
    await loginButton.click()
    
    // Check if dialog/modal appears
    await page.waitForTimeout(500)
    
    // Look for username or email input
    const usernameInput = page.locator('input[type="text"], input[name*="username"], input[name*="user"]').first()
    await expect(usernameInput).toBeVisible({ timeout: 5000 })
  })

  test('admin page should redirect when not authenticated', async ({ page }) => {
    // Try to access admin page
    const response = await page.goto('/admin')
    
    // Should either redirect or show unauthorized
    const url = page.url()
    const isRedirected = !url.includes('/admin') || url.includes('unauthorized')
    const hasUnauthorizedText = await page.locator('text=/unauthorized|forbidden|access denied/i').count() > 0
    
    expect(isRedirected || hasUnauthorizedText).toBeTruthy()
  })

  test('should accept username-based login', async ({ page }) => {
    await page.goto('/')
    
    // Open login dialog
    const loginButton = page.getByRole('button', { name: /login|sign in|登入/i }).first()
    await loginButton.click()
    await page.waitForTimeout(500)
    
    // Fill in username (not email)
    const usernameInput = page.locator('input[type="text"]').first()
    await usernameInput.fill('testuser')
    
    // Check that it accepts the input
    const value = await usernameInput.inputValue()
    expect(value).toBe('testuser')
  })
})
