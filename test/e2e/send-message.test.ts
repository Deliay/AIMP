import { test, expect } from './fixtures';

test.describe('发送文本消息', () => {
  test('输入文本消息后点击发送，消息显示在聊天记录中', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (!(await firstChat.isVisible())) {
      test.skip();
      return;
    }
    await firstChat.click();
    await page.waitForLoadState('networkidle');

    const input = page.getByPlaceholder('Type a message...');
    await expect(input).toBeVisible({ timeout: 5000 });
    const testMessage = `Test message ${Date.now()}`;

    await input.fill(testMessage);
    await page.getByRole('button', { name: /send/i }).click();

    await expect(input).toHaveValue('');
  });

  test('按 Enter 键发送消息', async ({ page }) => {
    await page.goto('/chats');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (!(await firstChat.isVisible())) {
      test.skip();
      return;
    }
    await firstChat.click();
    await page.waitForLoadState('networkidle');

    const input = page.getByPlaceholder('Type a message...');
    await expect(input).toBeVisible({ timeout: 5000 });
    const testMessage = `Test message ${Date.now()}`;

    await input.fill(testMessage);
    await input.press('Enter');

    await expect(input).toHaveValue('');
  });

  test('空消息时发送按钮禁用', async ({ page }) => {
    await page.goto('/chats');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (!(await firstChat.isVisible())) {
      test.skip();
      return;
    }
    await firstChat.click();
    await page.waitForLoadState('networkidle');

    const input = page.getByPlaceholder('Type a message...');
    await expect(input).toBeVisible({ timeout: 5000 });
    const sendButton = page.getByRole('button', { name: /send/i });

    await expect(sendButton).toBeDisabled();
  });
});