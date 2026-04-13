import { test, expect } from './fixtures';

test.describe('审批 Agent 子帐号申请', () => {
  test.use({
    authenticated: true,
  });

  test('进入审批页面左侧边栏正常显示', async ({ page }) => {
    await page.goto('/auth-requests');

    await expect(page.getByText('Menu')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chats' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Auth Requests' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
  });

  test('进入审批页面查看申请详情', async ({ page }) => {
    await page.goto('/auth-requests');

    await expect(page.getByRole('heading', { name: 'Authorization Requests' })).toBeVisible();
  });

  test('显示待审批申请', async ({ page }) => {
    await page.goto('/auth-requests');

    await page.getByRole('button', { name: 'Pending' }).click();

    const pendingBadge = page.getByText('PENDING').first();
    if (await pendingBadge.isVisible()) {
      await expect(pendingBadge).toBeVisible();
    }
  });

  test('点击批准更新申请状态为 APPROVED', async ({ page }) => {
    await page.goto('/auth-requests');

    await page.getByRole('button', { name: 'Pending' }).click();

    const approveButton = page.getByRole('button', { name: 'Approve' }).first();
    if (await approveButton.isVisible()) {
      await approveButton.click();

      await expect(page.getByText('APPROVED').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('点击拒绝显示拒绝理由输入框', async ({ page }) => {
    await page.goto('/auth-requests');

    await page.getByRole('button', { name: 'Pending' }).click();

    const rejectButton = page.getByRole('button', { name: 'Reject' }).first();
    if (await rejectButton.isVisible()) {
      await rejectButton.click();

      await expect(page.getByPlaceholder('Enter rejection reason...')).toBeVisible();
    }
  });

  test('填写拒绝理由后确认拒绝', async ({ page }) => {
    await page.goto('/auth-requests');

    await page.getByRole('button', { name: 'Pending' }).click();

    const rejectButton = page.getByRole('button', { name: 'Reject' }).first();
    if (await rejectButton.isVisible()) {
      await rejectButton.click();

      const reasonInput = page.getByPlaceholder('Enter rejection reason...');
      await reasonInput.fill('用途不明确');

      await page.getByRole('button', { name: 'Confirm Reject' }).click();

      await expect(page.getByText('REJECTED').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('显示申请详情包括申请人、名称、用途、原因', async ({ page }) => {
    await page.goto('/auth-requests');

    await page.getByRole('button', { name: 'Pending' }).click();

    const requestCard = page.locator('[class*="Card"]').filter({ hasText: 'Purpose' }).first();
    if (await requestCard.isVisible()) {
      await expect(requestCard.getByText('Purpose')).toBeVisible();
      await expect(requestCard.getByText('Reason')).toBeVisible();
    }
  });
});