import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly mockModeBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mockModeBanner = page.getByText(/Running in Demo Mode|Mock Data/);
  }

  async goto() {
    await this.page.goto('/');
  }

  async isMockMode(): Promise<boolean> {
    const count = await this.mockModeBanner.count();
    return count > 0;
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(description: string) {
    await this.page.screenshot({ path: `screenshots/${description}-${Date.now()}.png` });
  }
}
