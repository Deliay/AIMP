import { chromium } from '@playwright/test';

const baseURL = 'http://localhost:44019';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const failedRequests: { url: string; status: number; response?: string }[] = [];
  
  page.on('response', async response => {
    if (response.status() >= 400) {
      const url = response.url();
      let responseBody = '';
      try {
        responseBody = await response.text();
      } catch {}
      failedRequests.push({ url, status: response.status(), response: responseBody });
    }
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
  
  console.log('Failed requests:');
  failedRequests.forEach(req => {
    console.log(`\nURL: ${req.url}`);
    console.log(`Status: ${req.status}`);
    console.log(`Response: ${req.response}`);
  });
  
  await browser.close();
}

main().catch(console.error);
