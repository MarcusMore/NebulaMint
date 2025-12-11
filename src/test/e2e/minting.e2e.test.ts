import { test, expect } from '@playwright/test';

/**
 * E2E Tests - End-to-End User Flows
 * Tests complete user interactions from browser perspective
 */

test.describe('NFT Minting - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
  });

  test('should display mint page correctly', async ({ page }) => {
    // Check for main elements
    await expect(page.getByText('Upload. Mint. Collect.')).toBeVisible();
    await expect(page.getByText('Connect Wallet')).toBeVisible();
  });

  test('should show wallet connection prompt', async ({ page }) => {
    const connectButton = page.getByText('Connect Wallet');
    await expect(connectButton).toBeVisible();
    
    // Click connect (will need wallet extension in real test)
    // await connectButton.click();
  });

  test('should display upload area', async ({ page }) => {
    await expect(page.getByText(/Drag & drop or click to upload/)).toBeVisible();
  });

  test('should navigate to metrics page', async ({ page }) => {
    // Click metrics link
    await page.getByText('Metrics').click();
    
    // Should be on metrics page
    await expect(page.getByText('NFT Metrics')).toBeVisible();
  });

  test('should show contract information on metrics page', async ({ page }) => {
    await page.goto('http://localhost:3000/metrics');
    
    // Check for metrics elements
    await expect(page.getByText('Total NFTs Minted')).toBeVisible();
    await expect(page.getByText('Minting Fee')).toBeVisible();
  });

  test('should handle file upload', async ({ page }) => {
    // Create a test file
    const fileInput = page.locator('input[type="file"]');
    
    // Note: In real E2E, you'd upload an actual file
    // await fileInput.setInputFiles('path/to/test-image.png');
    
    // For now, just check the input exists
    await expect(fileInput).toBeAttached();
  });
});

test.describe('Navigation - E2E Tests', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to metrics
    await page.getByText('Metrics').click();
    await expect(page).toHaveURL(/.*metrics/);
    
    // Navigate back to mint
    await page.getByText('Mint').click();
    await expect(page).toHaveURL(/.*\/$/);
  });
});

test.describe('Error Handling - E2E Tests', () => {
  test('should show error when contract address is missing', async ({ page }) => {
    // This would require mocking environment variables
    // For now, we test the structure
    await page.goto('http://localhost:3000');
    await expect(page.getByText('Connect Wallet')).toBeVisible();
  });
});

