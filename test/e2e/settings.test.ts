import { test, expect } from './fixtures';

test.describe('设置页面', () => {
  test('进入设置页面左侧边栏正常显示', async ({ page, authenticated }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Menu')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chats' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Auth Requests' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
  });

  test('点击设置按钮跳转至设置页面', async ({ page, authenticated }) => {
    await page.goto('/chats');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Settings' }).click();

    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('设置页面进入时拉取用户信息', async ({ page, authenticated }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Account Type')).toBeVisible();
    await expect(page.getByText('API Key', { exact: true })).toBeVisible();
  });

  test('设置页面显示API Key', async ({ page, authenticated }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('API Key', { exact: true })).toBeVisible();
    await expect(page.getByText(/ak_/)).toBeVisible();
  });

  test('设置页面显示账户类型', async ({ page, authenticated }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Account Type')).toBeVisible();
    await expect(page.getByText('Human User')).toBeVisible();
  });

  test('设置页面显示邮箱', async ({ page, authenticated }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText(/@aimp\.test/)).toBeVisible();
  });

  test('复制API Key按钮存在', async ({ page, authenticated }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
  });
});