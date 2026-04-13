import { chromium } from '@playwright/test';

const baseURL = 'http://localhost:44019';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const email = `test-${Date.now()}@aimp.test`;
  const password = 'Password123!';
  
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
  
  // Take chat-list screenshot
  await page.goto(`${baseURL}/chats`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'chat-list-screenshot.png', fullPage: true });
  console.log('Chat list screenshot saved');
  
  // Take auth-requests screenshot
  await page.goto(`${baseURL}/auth-requests`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'auth-requests-screenshot.png', fullPage: true });
  console.log('Auth requests screenshot saved');
  
  // Take settings screenshot
  await page.goto(`${baseURL}/settings`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'settings-screenshot.png', fullPage: true });
  console.log('Settings screenshot saved');
  
  await browser.close();
}

main().catch(console.error);
