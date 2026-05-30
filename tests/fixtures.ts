import { test as base } from '@playwright/test';
import { StorefrontPage } from './pages/StorefrontPage';
import { AuthPage } from './pages/AuthPage';
import { AdminPanelPage } from './pages/AdminPanelPage';

type Fixtures = {
  storefrontPage: StorefrontPage;
  authPage: AuthPage;
  adminPanelPage: AdminPanelPage;
};

export const test = base.extend<Fixtures>({
  storefrontPage: async ({ page }, use) => {
    const storefrontPage = new StorefrontPage(page);
    await use(storefrontPage);
  },

  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  adminPanelPage: async ({ page }, use) => {
    const adminPanelPage = new AdminPanelPage(page);
    await use(adminPanelPage);
  },
});

export { expect } from '@playwright/test';
