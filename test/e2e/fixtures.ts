import { test as base, Page } from '@playwright/test';

const baseURL = process.env.FE_URL || 'http://localhost:39591';

async function loginUser(page: Page, email: string, password: string): Promise<void> {
  const response = await fetch(`${baseURL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`);
  }
  
  const data = await response.json() as { token: string };
  
  await page.goto(`${baseURL}/login`);
  await page.evaluate((token: string) => {
    sessionStorage.setItem('token', token);
  }, data.token);
  await page.goto(`${baseURL}/chats`);
  await page.waitForLoadState('networkidle');
}

export const test = base.extend<{ authenticated: void }>({
  authenticated: [
    async ({ page }, use) => {
      await loginUser(page, `test-${Date.now()}@aimp.test`, 'Password123!');
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';