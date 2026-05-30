import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  readonly loginTab: Locator;
  readonly registerTab: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly backButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.loginTab = page.getByText(/login/i);
    this.registerTab = page.getByText(/register|sign up/i);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.submitButton = page.getByRole('button', { name: /login|register|sign up/i });
    this.backButton = page.getByRole('button', { name: /back|go back/i });
    this.errorMessage = page.locator('.error, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async switchToRegister() {
    await this.registerTab.click();
  }

  async switchToLogin() {
    await this.loginTab.click();
  }

  async register(email: string, password: string, confirmPassword?: string) {
    await this.switchToRegister();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (confirmPassword && await this.confirmPasswordInput.isVisible()) {
      await this.confirmPasswordInput.fill(confirmPassword);
    }
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.switchToLogin();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor();
    return await this.errorMessage.textContent() || '';
  }
}
