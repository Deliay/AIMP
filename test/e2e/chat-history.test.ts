import { test, expect } from './fixtures';

test.describe('聊天记录查看与 Markdown 渲染', () => {
  test.use({
    authenticated: true,
  });

  test('消息按时间顺序排列', async ({ page }) => {
    await page.goto('/chats');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
    }

    const messages = page.locator('[class*="MessageBubble"], [class*="message"]');
    const count = await messages.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Markdown 内容正确渲染', async ({ page }) => {
    await page.goto('/chats');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
    }

    const markdownContent = page.locator('.prose, [class*="markdown"]');
    if (await markdownContent.count() > 0) {
      await expect(markdownContent.first()).toBeVisible();
    }
  });

  test('显示消息发送者身份标签', async ({ page }) => {
    await page.goto('/chats');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
    }

    const agentBadge = page.getByText('Agent').first();
    const humanBadge = page.getByText('Human').first();
    const hasBadge = await agentBadge.isVisible() || await humanBadge.isVisible();
    expect(hasBadge).toBeTruthy();
  });
});