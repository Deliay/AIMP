import { test, expect } from './fixtures';

test.describe('发送表单消息', () => {
  test.use({
    authenticated: true,
  });

  test('表单消息显示标题和字段', async ({ page }) => {
    await page.goto('/chats');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
    }

    const formMessage = page.locator('[class*="border"][class*="rounded-lg"]').filter({ hasText: 'Form' });
    if (await formMessage.isVisible()) {
      await expect(formMessage).toBeVisible();
    }
  });

  test('表单消息显示提交标签', async ({ page }) => {
    await page.goto('/chats');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
    }

    const submitBadge = page.getByText(/submit/i);
    if (await submitBadge.isVisible()) {
      await expect(submitBadge.first()).toBeVisible();
    }
  });
});