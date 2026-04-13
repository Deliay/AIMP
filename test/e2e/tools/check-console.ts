import { chromium } from '@playwright/test';

const baseURL = 'http://localhost:44019';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push(`[ERROR] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    consoleMessages.push(`[PAGE ERROR] ${err.message}`);
  });

  const email = `test-${Date.now()}@aimp.test`;
  const password = 'Password123!';
  
  const response = await fetch(`${baseURL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json() as { token: string };
  
  await page.goto(`${baseURL}/login`);
  await page.evaluate((token: string) => {
    sessionStorage.setItem('token', token);
  }, data.token);
  await page.goto(`${baseURL}/chats`);
  await page.waitForLoadState('networkidle');
  
  console.log('Console messages:');
  consoleMessages.forEach(msg => console.log(msg));
  
  if (consoleMessages.length === 0) {
    console.log('No console errors found');
  }
  
  await browser.close();
}

main().catch(console.error);
