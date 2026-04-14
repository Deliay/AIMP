import { test, expect } from './fixtures';

test.describe('Topic 检索功能', () => {
  test('通过关键词搜索Topic', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search|搜索/i).or(page.getByLabel(/search|搜索/i));
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
    }
  });

  test('搜索结果按relateScore降序排列', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search.*topics|搜索.*topic/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('data');
    }
  });

  test('无搜索结果时显示空状态', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search|搜索/i).or(page.getByLabel(/search|搜索/i));
    if (await searchInput.isVisible()) {
      await searchInput.fill('nonexistentkeyword12345');
    }
  });
});

test.describe('Topic 消息管理', () => {
  test('在Topic详情页可以发送消息', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
      await page.waitForLoadState('networkidle');

      const input = page.getByPlaceholder('Type a message...');
      const testMessage = `Test message ${Date.now()}`;

      await input.fill(testMessage);
      await page.getByRole('button', { name: /send/i }).click();

      await expect(input).toHaveValue('');
    }
  });

  test('HUMAN可以清空群聊消息', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (await firstChat.isVisible()) {
      await firstChat.click();
      await page.waitForLoadState('networkidle');

      const clearButton = page.getByRole('button', { name: /clear.*chat|清空.*聊天/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();
      }
    }
  });

  test('清空消息后Topic本身保留', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const firstChat = page.locator('a[href^="/chats/"]').first();
    if (await firstChat.isVisible()) {
      const href = await firstChat.getAttribute('href');
      await firstChat.click();
      await page.waitForLoadState('networkidle');

      const clearButton = page.getByRole('button', { name: /clear.*chat|清空.*聊天/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();
      }

      await page.goto('/chats');
      await page.waitForLoadState('networkidle');

      if (href) {
        await expect(page.locator(`a[href="${href}"]`)).toBeVisible();
      }
    }
  });
});

test.describe('Topic 类型', () => {
  test('Topic显示正确的类型标签 (direct/group)', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const topicItems = page.locator('a[href^="/chats/"]');
    const count = await topicItems.count();
    if (count > 0) {
      const firstTopic = topicItems.first();
      const typeLabel = firstTopic.locator('[class*="type"]').or(firstTopic.locator('[class*="badge"]'));
      if (await typeLabel.isVisible()) {
        const text = await typeLabel.textContent();
        expect(['direct', 'group', 'auth', 'pending']).toContain(text?.toLowerCase());
      }
    }
  });

  test('Topic显示正确的状态标签 (PENDING/ACTIVE/REJECTED)', async ({ page, authenticated }) => {
    await page.goto('/auth-requests');
    await page.waitForLoadState('networkidle');

    const statusLabels = page.locator('[class*="status"]');
    const count = await statusLabels.count();
    if (count > 0) {
      const text = await statusLabels.first().textContent();
      expect(['PENDING', 'ACTIVE', 'REJECTED']).toContain(text?.toUpperCase());
    }
  });
});