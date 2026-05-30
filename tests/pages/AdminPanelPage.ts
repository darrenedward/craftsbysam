import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPanelPage extends BasePage {
  readonly sidebar: Locator;
  readonly productManagerButton: Locator;
  readonly categoryManagerButton: Locator;
  readonly orderManagerButton: Locator;
  readonly clientManagerButton: Locator;
  readonly settingsButton: Locator;
  readonly dashboardButton: Locator;
  readonly homeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.locator('[data-testid="admin-sidebar"]');
    this.productManagerButton = page.getByText(/products/i);
    this.categoryManagerButton = page.getByText(/categories/i);
    this.orderManagerButton = page.getByText(/orders/i);
    this.clientManagerButton = page.getByText(/customers|clients/i);
    this.settingsButton = page.getByText(/settings/i);
    this.dashboardButton = page.getByText(/dashboard|overview/i);
    this.homeButton = page.getByTestId('home-button');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
    // Navigate to admin if not already there
    if (await this.homeButton.isVisible()) {
      await this.homeButton.click();
    }
  }

  async goToProducts() {
    await this.productManagerButton.click();
  }

  async goToCategories() {
    await this.categoryManagerButton.click();
  }

  async goToOrders() {
    await this.orderManagerButton.click();
  }

  async goToCustomers() {
    await this.clientManagerButton.click();
  }

  async goToSettings() {
    await this.settingsButton.click();
  }

  async goToDashboard() {
    await this.dashboardButton.click();
  }

  async goHome() {
    await this.homeButton.click();
  }

  async isInAdmin(): Promise<boolean> {
    return await this.sidebar.isVisible();
  }
}
