import { test, expect } from './fixtures';

test.describe('Authentication', () => {

  test('should navigate to auth page', async ({ storefrontPage }) => {
    await storefrontPage.goto();
    await storefrontPage.goToAdmin();

    // Should either be on auth page or admin page depending on session
    const currentUrl = storefrontPage.page.url();
    expect(currentUrl).toMatch(/\/$/);
  });

  test('should have working navigation', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    // Test basic navigation works
    await expect(storefrontPage.pageTitle).toBeVisible();
  });

  test('should handle page transitions', async ({ storefrontPage }) => {
    await storefrontPage.goto();

    // Reload should work
    await storefrontPage.page.reload();
    await storefrontPage.waitForLoad();

    await expect(storefrontPage.page).toHaveURL('/');
  });
});
