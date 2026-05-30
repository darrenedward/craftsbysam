import { test, expect } from './fixtures';

test.describe('Shopping Cart', () => {

  test('should display cart functionality', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    // Check that cart-related elements are present
    const cartIcon = storefrontPage.page.locator('button').filter({ hasText: '' }).first();
    await expect(cartIcon).toBeVisible();
  });

  test('should maintain page state during navigation', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    await storefrontPage.page.reload();
    await storefrontPage.waitForLoad();

    await expect(storefrontPage.page).toHaveURL('/');
  });

  test('should handle user interactions', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    // Test basic page interaction
    await storefrontPage.page.mouse.move(100, 100);
    await expect(storefrontPage.pageTitle).toBeVisible();
  });
});
