import { test as base, expect } from '@playwright/test';

const test = base;

test.describe('帐号注册', () => {
  const testEmail = `test-${Date.now()}@aimp.test`;
  const testPassword = 'Password123!';

  test('注册成功后跳转至登录页', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    await page.getByLabel('Confirm Password').fill(testPassword);

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL('/login');
  });

  test('密码不匹配时显示错误', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    await page.getByLabel('Confirm Password').fill('DifferentPassword123!');

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test('邮箱格式错误时表单验证失败', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('invalid-email');
    await page.locator('#password').fill(testPassword);
    await page.getByLabel('Confirm Password').fill(testPassword);

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/register/);
  });
});