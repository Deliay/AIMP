import { test, expect, Page } from '@playwright/test';
import { execSync as execSyncOriginal } from 'child_process';
import path from 'path';

const FE_URL = process.env.FE_URL || 'http://localhost:39591';
const API_URL = process.env.API_URL || 'http://localhost:3000';
const CLI_SERVER_URL = process.env.CLI_SERVER_URL || API_URL;
const CLI_DIR = '/home/ash/Repositories/AIMP/cli';

function execCli(cmd: string): { stdout: string; stderr: string; status: number } {
  try {
    const result = execSyncOriginal(cmd, { cwd: CLI_DIR, env: { ...process.env, FORCE_COLOR: '0' } });
    const stdout = result?.toString() || '';
    return { stdout, stderr: '', status: 0 };
  } catch (e: any) {
    const stdout = e.stdout?.toString() || '';
    const stderr = e.stderr?.toString() || '';
    return { stdout, stderr, status: e.status || 1 };
  }
}

function stripAnsi(input: string): string {
  const escCode = 27;
  const esc = String.fromCharCode(escCode);
  return input.replace(new RegExp(esc + '\\[([0-9;]*)[a-zA-Z]', 'g'), '');
}

async function createSubaccountViaCli(name: string, purpose: string, reason: string): Promise<{ requestId: string }> {
  const result = execCli(`node dist/index.js --server-url ${CLI_SERVER_URL} subaccount create --name "${name}" --purpose "${purpose}" --reason "${reason}"`);
  const clean = stripAnsi(result.stdout);
  const match = clean.match(/申请ID:\s*([a-f0-9]+)/);
  return { requestId: match ? match[1] : '' };
}

async function loginUser(page: Page, email: string, password: string): Promise<{ token: string; apiKey: string; userId: string }> {
  const response = await fetch(`${FE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`);
  }
  
  const data = await response.json() as { token: string; apiKey: string; userId: string };
  
  await page.goto(`${FE_URL}/login`);
  await page.evaluate((token: string) => {
    sessionStorage.setItem('token', token);
  }, data.token);
  await page.goto(`${FE_URL}/chats`);
  await page.waitForLoadState('networkidle');
  
  return data;
}

function clearCliConfig(): void {
  try {
    execSyncOriginal('node dist/index.js logout', { cwd: CLI_DIR });
  } catch {
    // ignore
  }
}

async function rejectRequestViaGraphQL(requestId: string, token: string): Promise<void> {
  await fetch(`${CLI_SERVER_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `mutation RejectSubaccount($requestId: ID!, $reason: String!) { rejectSubaccount(requestId: $requestId, reason: $reason) { status } }`,
      variables: { requestId, reason: 'E2E test rejection' }
    }),
  });
}

async function approveRequestViaGraphQL(requestId: string, token: string): Promise<void> {
  await fetch(`${CLI_SERVER_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `mutation ApproveSubaccount($requestId: ID!) { approveSubaccount(requestId: $requestId) { status subaccount { apiKey } } }`,
      variables: { requestId }
    }),
  });
}

test.describe('CLI 创建子帐号申请并验证 Web 端显示', () => {
  test.beforeEach(() => {
    clearCliConfig();
  });
  
  test('通过 CLI 创建子帐号申请后 Web 端能正确显示', async ({ page }) => {
    const uniqueSubaccountName = `cli-test-subaccount-${Date.now()}`;
    const { apiKey } = await loginUser(page, `test-cli-${Date.now()}@aimp.test`, 'Password123!');
    
    await page.goto(`${FE_URL}/auth-requests`);
    await expect(page.getByRole('heading', { name: 'Authorization Requests' })).toBeVisible();

    await page.getByRole('button', { name: 'Pending' }).click();
    await page.waitForTimeout(500);

    execCli(`node dist/index.js --server-url ${CLI_SERVER_URL} login --api-key ${apiKey}`);
    
    const { requestId } = await createSubaccountViaCli(uniqueSubaccountName, 'E2E test subaccount', 'Testing CLI subaccount creation flow');
    expect(requestId).toBeTruthy();

    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Pending' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText(uniqueSubaccountName)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('E2E test subaccount')).toBeVisible();
    await expect(page.getByText('PENDING', { exact: true })).toBeVisible();
  });

  test('CLI 创建子帐号申请包含完整的申请人、名称、用途、原因信息', async ({ page }) => {
    const uniqueSubaccountName = `cli-test-subaccount-${Date.now()}`;
    const { apiKey } = await loginUser(page, `test-cli-${Date.now()}@aimp.test`, 'Password123!');
    
    await page.goto(`${FE_URL}/auth-requests`);
    await page.getByRole('button', { name: 'Pending' }).click();
    await page.waitForTimeout(500);

    execCli(`node dist/index.js --server-url ${CLI_SERVER_URL} login --api-key ${apiKey}`);
    createSubaccountViaCli(uniqueSubaccountName, 'E2E test subaccount', 'Testing CLI subaccount creation flow');

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Pending' }).click();
    await page.waitForTimeout(2000);

    await expect(page.getByText(uniqueSubaccountName)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Purpose')).toBeVisible();
    await expect(page.getByText('Reason')).toBeVisible();
  });

  test('前端拒绝申请后 CLI 创建请求成功', async ({ page }) => {
    const uniqueSubaccountName = `cli-reject-${Date.now()}`;
    const { apiKey, token } = await loginUser(page, `test-cli-${Date.now()}@aimp.test`, 'Password123!');
    
    execCli(`node dist/index.js --server-url ${CLI_SERVER_URL} login --api-key ${apiKey}`);
    
    const { requestId } = await createSubaccountViaCli(uniqueSubaccountName, 'E2E reject test', 'Testing reject flow');
    expect(requestId).toBeTruthy();

    await rejectRequestViaGraphQL(requestId, token);

    const createResult = execCli(`node dist/index.js --server-url ${CLI_SERVER_URL} subaccount create --name "second-subaccount" --purpose "p" --reason "r"`);
    expect(createResult.stdout).toContain('申请ID:');
  });

  test('前端批准申请后 CLI 能正确显示审批通过', async ({ page }) => {
    const uniqueSubaccountName = `cli-approve-${Date.now()}`;
    const { apiKey, token } = await loginUser(page, `test-cli-${Date.now()}@aimp.test`, 'Password123!');
    
    execCli(`node dist/index.js --server-url ${CLI_SERVER_URL} login --api-key ${apiKey}`);
    
    const { requestId } = await createSubaccountViaCli(uniqueSubaccountName, 'E2E approve test', 'Testing approve flow');
    expect(requestId).toBeTruthy();

    await approveRequestViaGraphQL(requestId, token);

    const createResult = execCli(`node dist/index.js --server-url ${CLI_SERVER_URL} subaccount create --name "second-subaccount" --purpose "p" --reason "r"`);
    expect(createResult.stdout).toContain('申请ID:');
  });

  test('创建 subaccount 后 CLI list 能看到已批准的帐号', async ({ page }) => {
    const uniqueSubaccountName = `cli-list-${Date.now()}`;
    const { apiKey, token } = await loginUser(page, `test-cli-${Date.now()}@aimp.test`, 'Password123!');
    
    execCli(`node dist/index.js --server-url ${CLI_SERVER_URL} login --api-key ${apiKey}`);
    
    const { requestId } = await createSubaccountViaCli(uniqueSubaccountName, 'E2E list test', 'Testing list flow');
    expect(requestId).toBeTruthy();

    await approveRequestViaGraphQL(requestId, token);

    const listResult = execCli(`node dist/index.js --server-url ${CLI_SERVER_URL} subaccount list`);
    expect(listResult.stdout).toContain(uniqueSubaccountName);
  });
});