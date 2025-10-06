import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load and display main elements', async ({ page }) => {
    await page.goto('/')
    
    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Check for navigation
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Check for CTA buttons
    await expect(page.getByText('Get Started')).toBeVisible()
    await expect(page.getByText('See Live Demo')).toBeVisible()
  })

  test('should navigate to sign-up when clicking Get Started', async ({ page }) => {
    await page.goto('/')
    
    await page.getByText('Get Started').first().click()
    await expect(page).toHaveURL(/.*sign-up/)
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')
    
    // Scroll to features
    await page.getByText('Features').click()
    
    // Check that features are visible
    await expect(page.getByText('Create Your AI Expert')).toBeVisible()
    await expect(page.getByText('Capture Qualified Leads')).toBeVisible()
  })

  test('should display pricing section', async ({ page }) => {
    await page.goto('/')
    
    await page.getByText('Pricing').click()
    await expect(page.getByText('Basic')).toBeVisible()
    await expect(page.getByText('Pro')).toBeVisible()
    await expect(page.getByText('Ultra')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/')
      
      // Check mobile menu trigger is visible
      await expect(page.locator('button[aria-label*="menu"]')).toBeVisible()
      
      // Check that content is properly displayed on mobile
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    }
  })
})