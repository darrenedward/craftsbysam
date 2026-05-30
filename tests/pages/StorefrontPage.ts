import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class StorefrontPage extends BasePage {
  readonly productGrid: Locator;
  readonly addToCartButtons: Locator;
  readonly cartButton: Locator;
  readonly adminButton: Locator;
  readonly accountButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    // Use actual selectors from the code
    this.productGrid = page.locator('main').filter({ hasText: 'item' }).getByRole('heading');
    this.addToCartButtons = page.getByRole('button').filter({ hasText: /add|cart|buy/i });
    this.cartButton = page.locator('button svg').filter({ hasText: '' }).first();
    this.adminButton = page.getByRole('button', { name: /admin|login/i });
    this.accountButton = page.locator('button').filter({ hasText: /account|my account/i });
    this.pageTitle = page.locator('h1, h2').first();
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async getProductCount(): Promise<number> {
    // Wait for the page to load and count product-related elements
    await this.page.waitForLoadState('networkidle');
    const itemsText = await this.page.getByText(/item|items/).first().textContent();
    const count = itemsText?.match(/\d+/)?.[0] || '0';
    return parseInt(count);
  }

  async addProductToCart(index: number = 0) {
    const buttons = await this.addToCartButtons.all();
    if (buttons.length > index) {
      await buttons[index].click();
    }
  }

  async openCart() {
    const cartButtons = await this.cartButton.all();
    if (cartButtons.length > 0) {
      await cartButtons[0].click();
    }
  }

  async goToAdmin() {
    await this.adminButton.click();
  }

  async goToAccount() {
    if (await this.accountButton.isVisible()) {
      await this.accountButton.click();
    } else {
      await this.adminButton.click();
    }
  }

  async searchProducts(query: string) {
    const searchInput = this.page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill(query);
      await searchInput.press('Enter');
    }
  }
}
