import { test, expect } from './fixtures';

test.describe('Admin Panel', () => {

  test('should show admin access option', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    // Check for admin-related buttons or links
    const adminElements = storefrontPage.page.getByText(/admin|login/i);
    const count = await adminElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle admin navigation', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    // Try to navigate to admin
    await storefrontPage.goToAdmin();

    // Should either navigate to auth or stay on page
    await expect(storefrontPage.page).not.toHaveURL('about:blank');
  });

  test('should have functional navigation elements', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    // Check for basic navigation
    await expect(storefrontPage.pageTitle).toBeVisible();
  });
});
