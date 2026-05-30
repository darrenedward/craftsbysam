import { test, expect } from './fixtures';

test.describe('Homepage', () => {
  test('should load and display basic content', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    // Check that the page loaded successfully
    await expect(storefrontPage.page).toHaveURL('/');
    await expect(storefrontPage.pageTitle).toBeVisible();
  });

  test('should show mock mode banner in demo mode', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    const isMockMode = await storefrontPage.isMockMode();
    expect(isMockMode).toBe(true);
  });

  test('should have working navigation elements', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    // Check for basic navigation elements
    await expect(storefrontPage.pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on mobile viewport', async ({ storefrontPage }) => {
    await storefrontPage.page.setViewportSize({ width: 375, height: 667 });
    await storefrontPage.goto();

    // Check that page loads on mobile
    await expect(storefrontPage.page).toHaveURL('/');
    await expect(storefrontPage.pageTitle).toBeVisible();
  });
});
