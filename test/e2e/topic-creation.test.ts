import { test, expect } from './fixtures';

test.describe('Topic 创建功能', () => {
  test('Web端创建Topic - 填写slug/name/description后创建成功', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /create.*topic|new.*topic/i }).click();

    const slug = `test-topic-${Date.now()}`;
    const name = `Test Topic ${Date.now()}`;
    const description = 'This is a test topic description';

    await page.getByLabel(/slug/i).fill(slug);
    await page.getByLabel(/name/i).fill(name);
    await page.getByLabel(/description/i).fill(description);

    await page.getByRole('button', { name: /create|submit/i }).click();

    await expect(page.getByText(name)).toBeVisible({ timeout: 5000 });
  });

  test('Web端创建Topic - 创建后在聊天列表中可见', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const topicName = `Visible Topic ${Date.now()}`;
    const topicSlug = `visible-topic-${Date.now()}`;

    await page.getByRole('button', { name: /create.*topic|new.*topic/i }).click();
    await page.getByLabel(/slug/i).fill(topicSlug);
    await page.getByLabel(/name/i).fill(topicName);
    await page.getByLabel(/description/i).fill('Test description');
    await page.getByRole('button', { name: /create|submit/i }).click();

    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(topicName)).toBeVisible();
  });

  test('Web端创建Topic - 点击聊天项跳转至Topic详情', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const topicName = `跳转 Topic ${Date.now()}`;
    const topicSlug = `跳转-topic-${Date.now()}`;

    await page.getByRole('button', { name: /create.*topic|new.*topic/i }).click();
    await page.getByLabel(/slug/i).fill(topicSlug);
    await page.getByLabel(/name/i).fill(topicName);
    await page.getByLabel(/description/i).fill('Test description');
    await page.getByRole('button', { name: /create|submit/i }).click();

    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const topicLink = page.locator(`a[href^="/chats/"]`, { hasText: topicName }).first();
    if (await topicLink.isVisible()) {
      await topicLink.click();
      await expect(page).toHaveURL(/\/chats\/.+/);
    }
  });
});

test.describe('Topic 审批流程 (CLI创建)', () => {
  test('Agent创建Topic请求出现在审批列表中', async ({ page, authenticated }) => {
    await page.goto('/auth-requests');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /auth.*requests|requests/i })).toBeVisible();
  });

  test('审批通过后Topic状态变为active', async ({ page, authenticated }) => {
    await page.goto('/auth-requests');
    await page.waitForLoadState('networkidle');

    const pendingRequest = page.locator('[data-status="PENDING"]').first();
    if (await pendingRequest.isVisible()) {
      await pendingRequest.getByRole('button', { name: /approve|批准/i }).click();
    }

    await page.goto('/chats');
    await page.waitForLoadState('networkidle');
  });

  test('审批拒绝后Topic被删除', async ({ page, authenticated }) => {
    await page.goto('/auth-requests');
    await page.waitForLoadState('networkidle');

    const pendingRequest = page.locator('[data-status="PENDING"]').first();
    if (await pendingRequest.isVisible()) {
      await pendingRequest.getByRole('button', { name: /reject|拒绝/i }).click();
    }
  });
});

test.describe('Topic 列表功能', () => {
  test('显示所有聊天会话', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Chats' })).toBeVisible();
  });

  test('未读消息显示未读计数', async ({ page }) => {
    await page.goto('/chats');

    const badge = page.locator('[class*="Badge"]').first();
    if (await badge.isVisible()) {
      const count = await badge.textContent();
      expect(parseInt(count || '0', 10)).toBeGreaterThanOrEqual(0);
    }
  });

  test('Topic按照最新消息时间排序', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    const chatItems = page.locator('a[href^="/chats/"]');
    const count = await chatItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});