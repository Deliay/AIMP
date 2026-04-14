import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const testEmail = `test-human-${Date.now()}@aimp.test`;
  const testPassword = 'Password123!';
  const baseURL = process.env.FE_URL || 'http://localhost:39591';
  
  const registerResponse = await fetch(`${baseURL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  
  if (!registerResponse.ok) {
    throw new Error(`Registration failed: ${registerResponse.status}`);
  }
  
  const data = await registerResponse.json() as { token: string; userId: string };
  
  await page.goto(`${baseURL}/login`);
  await page.evaluate((token: string) => {
    sessionStorage.setItem('token', token);
  }, data.token);
  
  await page.goto(`${baseURL}/chats`);
  await page.waitForLoadState('networkidle');
  
  await page.context().storageState({ path: 'e2e/.auth/human.json' });
  
  await browser.close();
}

export default globalSetup;