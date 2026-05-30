import { Page } from '@playwright/test';

export class TestHelpers {
  static async generateTestEmail(): Promise<string> {
    return `test-${Date.now()}@example.com`;
  }

  static async generateTestPassword(): Promise<string> {
    return `TestPass123!${Date.now()}`;
  }

  static async waitForNetworkIdle(page: Page, timeout = 30000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async clearLocalStorage(page: Page) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  static mockPaymentSuccess(page: Page) {
    return page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('mock-payment-success'));
    });
  }

  static mockPaymentFailure(page: Page) {
    return page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('mock-payment-failure'));
    });
  }
}
