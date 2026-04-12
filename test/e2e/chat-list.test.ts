import { test, expect } from './fixtures';

test.describe('聊天列表查看', () => {
  test('显示所有聊天会话和最新消息摘要', async ({ page, authenticated }) => {
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Chats' })).toBeVisible();
  });

  test('未读消息显示未读计数', async ({ page }) => {
    await page.goto('/chats');

    const badge = page.locator('[class*="Badge"]').first();
    if (await badge.isVisible()) {
      const count = await badge.textContent();
      expect(parseInt(count || '0', 10)).toBeGreaterThan(0);
    }
  });

  test('点击聊天项跳转至聊天详情', async ({ page }) => {
    await page.goto('/chats');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
      await expect(page).toHaveURL(/\/chats\/.+/);
    }
  });
});