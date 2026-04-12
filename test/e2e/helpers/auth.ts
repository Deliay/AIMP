import { test as base, Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async register(email: string, password: string): Promise<{ userId: string; apiKey: string }> {
    await this.page.goto('/register');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByLabel('Confirm Password').fill(password);
    await this.page.getByRole('button', { name: 'Register' }).click();
    await this.page.waitForURL('/login');

    return { userId: '', apiKey: '' };
  }

  async login(apiKey: string): Promise<void> {
    await this.page.goto('/login');
    await this.page.getByLabel('API Key').fill(apiKey);
    await this.page.getByRole('button', { name: 'Login' }).click();
    await this.page.waitForURL('/chats');
  }
}

export const test = base.extend<{ auth: AuthHelper }>({
  auth: async ({ page }, use) => {
    await use(new AuthHelper(page));
  },
});

export { expect } from '@playwright/test';