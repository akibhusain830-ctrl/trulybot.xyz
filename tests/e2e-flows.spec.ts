/**
 * End-to-End Tests
 * Playwright tests for complete user flows: chat, lead submission, payment, settings, knowledge base
 */

import { test, expect } from '@playwright/test';

test.describe('Complete Chat Flow', () => {
  test('should open widget and send message', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for widget to load
    await page.waitForSelector('[data-testid="chat-widget-button"]', { timeout: 10000 });
    
    // Click chat button
    await page.click('[data-testid="chat-widget-button"]');
    
    // Widget should be visible
    await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();
    
    // Type message
    await page.fill('[data-testid="chat-input"]', 'Hello, I need help');
    
    // Send message
    await page.click('[data-testid="send-button"]');
    
    // Should see user message
    await expect(page.locator('text=Hello, I need help')).toBeVisible();
    
    // Should see bot response (wait up to 10 seconds)
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 10000 });
  });

  test('should handle streaming responses', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.click('[data-testid="chat-widget-button"]');
    await page.fill('[data-testid="chat-input"]', 'What is your pricing?');
    await page.click('[data-testid="send-button"]');
    
    // Should show typing indicator
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
    
    // Wait for response to complete
    await page.waitForSelector('[data-testid="bot-message"]', { timeout: 15000 });
  });

  test('should enforce rate limiting', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.click('[data-testid="chat-widget-button"]');
    
    // Send first message
    await page.fill('[data-testid="chat-input"]', 'Message 1');
    await page.click('[data-testid="send-button"]');
    
    // Try to send second message immediately
    await page.fill('[data-testid="chat-input"]', 'Message 2');
    await page.click('[data-testid="send-button"]');
    
    // Should show rate limit warning
    await expect(page.locator('text=/rate limit|wait|too fast/i')).toBeVisible({ timeout: 5000 });
  });

  test('should close and reopen widget maintaining state', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Open widget
    await page.click('[data-testid="chat-widget-button"]');
    
    // Send message
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.click('[data-testid="send-button"]');
    
    // Close widget
    await page.click('[data-testid="close-button"]');
    
    // Reopen widget
    await page.click('[data-testid="chat-widget-button"]');
    
    // Should still see previous message
    await expect(page.locator('text=Test message')).toBeVisible();
  });
});

test.describe('Lead Submission Flow', () => {
  test('should collect email from conversation', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.click('[data-testid="chat-widget-button"]');
    
    // User provides email
    await page.fill('[data-testid="chat-input"]', 'My email is john@example.com');
    await page.click('[data-testid="send-button"]');
    
    await page.waitForTimeout(2000);
    
    // Bot should acknowledge
    await page.waitForSelector('[data-testid="bot-message"]');
  });

  test('should handle explicit lead form', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.click('[data-testid="chat-widget-button"]');
    
    // Trigger lead form (if available)
    const leadFormTrigger = page.locator('[data-testid="lead-form-button"]');
    if (await leadFormTrigger.isVisible()) {
      await leadFormTrigger.click();
      
      // Fill lead form
      await page.fill('[data-testid="lead-email"]', 'lead@example.com');
      await page.fill('[data-testid="lead-name"]', 'John Doe');
      
      // Submit
      await page.click('[data-testid="lead-submit"]');
      
      // Should show success message
      await expect(page.locator('text=/thank you|success|submitted/i')).toBeVisible();
    }
  });
});

test.describe('Authentication Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Submit
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Should see dashboard
    await expect(page.locator('text=/dashboard|welcome/i')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    await page.click('[data-testid="login-button"]');
    
    // Should show error
    await expect(page.locator('text=/invalid|error|incorrect/i')).toBeVisible();
  });

  test('should register new user', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
    
    await page.click('[data-testid="register-button"]');
    
    // Should redirect to dashboard or verification page
    await page.waitForURL(/dashboard|verify/, { timeout: 10000 });
  });
});

test.describe('Payment Flow', () => {
  test.skip('should initiate payment for starter plan', async ({ page }) => {
    // Note: Skip actual payment tests in CI/CD
    await page.goto('http://localhost:3000/pricing');
    
    // Click on Starter plan
    await page.click('[data-testid="plan-starter-button"]');
    
    // Should redirect to checkout
    await page.waitForURL('**/checkout', { timeout: 10000 });
    
    // Should see Razorpay checkout
    await expect(page.locator('text=/razorpay|payment|checkout/i')).toBeVisible({ timeout: 15000 });
  });

  test('should display all pricing plans', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');
    
    // Should see all 4 plans
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=Starter')).toBeVisible();
    await expect(page.locator('text=Professional')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
  });

  test('should show feature comparison', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');
    
    // Should see features
    await expect(page.locator('text=/bots|messages|leads/i')).toBeVisible();
  });
});

test.describe('Dashboard Operations', () => {
  test('should create new chatbot', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Click create bot button
    await page.click('[data-testid="create-bot-button"]');
    
    // Fill bot details
    await page.fill('[data-testid="bot-name"]', 'Test Bot');
    await page.fill('[data-testid="welcome-message"]', 'Hello! How can I help?');
    
    // Submit
    await page.click('[data-testid="save-bot-button"]');
    
    // Should see new bot in list
    await expect(page.locator('text=Test Bot')).toBeVisible();
  });

  test('should view bot analytics', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Should see statistics
    await expect(page.locator('[data-testid="total-conversations"]')).toBeVisible();
    await expect(page.locator('[data-testid="leads-collected"]')).toBeVisible();
    await expect(page.locator('[data-testid="response-time"]')).toBeVisible();
  });

  test('should update bot configuration', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Click on first bot
    await page.click('[data-testid="bot-config-button"]');
    
    // Update settings
    await page.fill('[data-testid="bot-name"]', 'Updated Bot Name');
    await page.click('[data-testid="theme-dark"]');
    
    // Save
    await page.click('[data-testid="save-settings-button"]');
    
    // Should show success
    await expect(page.locator('text=/saved|updated|success/i')).toBeVisible();
  });
});

test.describe('Knowledge Base Upload', () => {
  test('should upload text file', async ({ page }) => {
    await page.goto('http://localhost:3000/knowledge-base');
    
    // Set file input
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    
    // Create test file
    await fileInput.setInputFiles({
      name: 'test-document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is test content for the knowledge base.')
    });
    
    // Click upload
    await page.click('[data-testid="upload-button"]');
    
    // Should show upload progress
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('text=/uploaded|success|complete/i')).toBeVisible({ timeout: 15000 });
  });

  test('should reject invalid file types', async ({ page }) => {
    await page.goto('http://localhost:3000/knowledge-base');
    
    const fileInput = page.locator('[data-testid="file-upload-input"]');
    
    await fileInput.setInputFiles({
      name: 'script.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('fake executable')
    });
    
    // Should show error
    await expect(page.locator('text=/invalid|unsupported|error/i')).toBeVisible();
  });

  test('should list uploaded documents', async ({ page }) => {
    await page.goto('http://localhost:3000/knowledge-base');
    
    // Should see document list
    await expect(page.locator('[data-testid="documents-list"]')).toBeVisible();
  });

  test('should delete document', async ({ page }) => {
    await page.goto('http://localhost:3000/knowledge-base');
    
    // Click delete on first document
    const deleteButton = page.locator('[data-testid="delete-document"]').first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete"]');
      
      // Should show success
      await expect(page.locator('text=/deleted|removed|success/i')).toBeVisible();
    }
  });
});

test.describe('Settings Management', () => {
  test('should update notification preferences', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    
    // Toggle notifications
    await page.click('[data-testid="notifications-toggle"]');
    
    // Change email digest
    await page.selectOption('[data-testid="email-digest-select"]', 'weekly');
    
    // Save
    await page.click('[data-testid="save-settings-button"]');
    
    // Should show success
    await expect(page.locator('text=/saved|updated|success/i')).toBeVisible();
  });

  test('should generate API key', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    
    // Click generate API key
    await page.click('[data-testid="generate-api-key-button"]');
    
    // Should show new API key
    await expect(page.locator('[data-testid="api-key-display"]')).toBeVisible();
    
    // Should start with sk_live_
    const apiKeyText = await page.locator('[data-testid="api-key-display"]').textContent();
    expect(apiKeyText).toContain('sk_');
  });

  test('should copy embed code', async ({ page }) => {
    await page.goto('http://localhost:3000/settings');
    
    // Click copy embed code
    await page.click('[data-testid="copy-embed-button"]');
    
    // Should show success
    await expect(page.locator('text=/copied|clipboard/i')).toBeVisible();
  });
});

test.describe('Lead Management', () => {
  test('should display all collected leads', async ({ page }) => {
    await page.goto('http://localhost:3000/leads');
    
    // Should see leads table
    await expect(page.locator('[data-testid="leads-table"]')).toBeVisible();
  });

  test('should filter leads by score', async ({ page }) => {
    await page.goto('http://localhost:3000/leads');
    
    // Apply high-quality filter
    await page.click('[data-testid="filter-high-quality"]');
    
    // Should see filtered results
    await page.waitForTimeout(1000);
  });

  test('should export leads to CSV', async ({ page }) => {
    await page.goto('http://localhost:3000/leads');
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv-button"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should mark lead as contacted', async ({ page }) => {
    await page.goto('http://localhost:3000/leads');
    
    // Click on first lead
    const markContactedButton = page.locator('[data-testid="mark-contacted"]').first();
    
    if (await markContactedButton.isVisible()) {
      await markContactedButton.click();
      
      // Should show success
      await expect(page.locator('text=/contacted|updated/i')).toBeVisible();
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000');
    
    // Widget should be responsive
    await page.click('[data-testid="chat-widget-button"]');
    
    // Chat window should be fullscreen on mobile
    const chatWindow = page.locator('[data-testid="chat-window"]');
    const boundingBox = await chatWindow.boundingBox();
    
    expect(boundingBox?.width).toBeGreaterThan(300);
  });

  test('should navigate mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000');
    
    // Open mobile menu if exists
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Should see navigation links
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    }
  });
});

test.describe('Error Handling', () => {
  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto('http://localhost:3000/non-existent-page');
    
    await expect(page.locator('text=/404|not found|page.*not.*exist/i')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);
    
    await page.goto('http://localhost:3000');
    
    // Try to send message
    await page.click('[data-testid="chat-widget-button"]');
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.click('[data-testid="send-button"]');
    
    // Should show error
    await expect(page.locator('text=/network|offline|error/i')).toBeVisible({ timeout: 5000 });
    
    // Restore network
    await page.context().setOffline(false);
  });
});
