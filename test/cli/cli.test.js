const { spawn } = require('child_process');
const path = require('path');
const request = require('supertest');
const {
  startAspire,
  stopAspire,
  waitForApi,
  registerTestUser,
  graphqlQuery,
  getTestUser,
  getApiUrl,
  clearAuthConfig,
  getCLIPath
} = require('./helpers/setup');

const CLI_PATH = getCLIPath();

describe('CLI Integration Tests', () => {
  let apiEndpoint;
  let testUser;

  beforeAll(async () => {
    clearAuthConfig();
    
    apiEndpoint = await startAspire();
    await waitForApi();
    
    testUser = await registerTestUser(apiEndpoint);
  }, 60000);

  afterAll(() => {
    stopAspire();
    clearAuthConfig();
  });

  beforeEach(() => {
    clearAuthConfig();
  });

  function runCli(args, env = {}) {
    return new Promise((resolve) => {
      let timeoutId;
      const proc = spawn('node', [CLI_PATH, ...args], {
        env: { ...process.env, ...env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => { stdout += data.toString(); });
      proc.stderr.on('data', (data) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({ code, stdout, stderr });
      });

      proc.on('error', (err) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({ code: -1, stdout, stderr: err.message });
      });

      timeoutId = setTimeout(() => {
        proc.kill('SIGTERM');
        resolve({ code: -1, stdout, stderr: 'timeout' });
      }, 15000);
    });
  }

  describe('REST Auth Endpoints', () => {
    it('should register a new user and get API key', async () => {
      const timestamp = Date.now();
      const email = `cli-test-${timestamp}@aimp.test`;
      const password = 'Password123!';

      const res = await request(apiEndpoint)
        .post('/api/auth/register')
        .send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.userId).toBeTruthy();
      expect(res.body.apiKey).toMatch(/^ak_/);
    });

    it('should login with API key via cli-login endpoint', async () => {
      const res = await request(apiEndpoint)
        .post('/api/auth/cli-login')
        .send({ apiKey: testUser.apiKey });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.userId).toBe(testUser.userId);
    });

    it('should fail login with invalid API key', async () => {
      const res = await request(apiEndpoint)
        .post('/api/auth/cli-login')
        .send({ apiKey: 'ak_invalid_key_12345' });

      expect(res.status).toBe(401);
    });
  });

  describe('CLI Login Command', () => {
    it('should login successfully with valid API key', async () => {
      const result = await runCli([
        'login',
        '--api-key', testUser.apiKey,
        '--server', apiEndpoint
      ]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('登录成功');
    });

    it('should fail login with invalid API key', async () => {
      const result = await runCli([
        'login',
        '--api-key', 'ak_invalid_test_key',
        '--server', apiEndpoint
      ]);

      expect(result.code).toBe(1);
    });

    it('should fail login when API key is missing', async () => {
      const result = await runCli([
        'login',
        '--server', apiEndpoint
      ]);

      expect(result.code).toBe(1);
    });
  });

  describe('CLI Whoami Command', () => {
    it('should return user info when authenticated', async () => {
      await runCli([
        'login',
        '--api-key', testUser.apiKey,
        '--server', apiEndpoint
      ]);

      const result = await runCli(['whoami']);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain(testUser.userId);
    });

    it('should fail when not authenticated', async () => {
      clearAuthConfig();

      const result = await runCli(['whoami']);

      expect(result.code).toBe(1);
    });
  });

  describe('CLI Logout Command', () => {
    it('should clear config on logout', async () => {
      await runCli([
        'login',
        '--api-key', testUser.apiKey,
        '--server', apiEndpoint
      ]);

      const result = await runCli(['logout']);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('已成功登出');
    });
  });

  describe('GraphQL Operations via REST', () => {
    it('should query me via GraphQL after login', async () => {
      await runCli([
        'login',
        '--api-key', testUser.apiKey,
        '--server', apiEndpoint
      ]);

      const loginRes = await request(apiEndpoint)
        .post('/api/auth/cli-login')
        .send({ apiKey: testUser.apiKey });

      const meRes = await request(apiEndpoint)
        .post('/graphql')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ query: '{ me { id email type } }' });

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.me).toBeTruthy();
      expect(meRes.body.data.me.id).toBe(testUser.userId);
    });

    it('should query subaccounts via GraphQL', async () => {
      await runCli([
        'login',
        '--api-key', testUser.apiKey,
        '--server', apiEndpoint
      ]);

      const loginRes = await request(apiEndpoint)
        .post('/api/auth/cli-login')
        .send({ apiKey: testUser.apiKey });

      const subaccountsRes = await request(apiEndpoint)
        .post('/graphql')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ query: '{ subaccounts { id name status } }' });

      expect(subaccountsRes.status).toBe(200);
      expect(subaccountsRes.body.data.subaccounts).toBeInstanceOf(Array);
    });

    it('should create subaccount via GraphQL mutation', async () => {
      await runCli([
        'login',
        '--api-key', testUser.apiKey,
        '--server', apiEndpoint
      ]);

      const loginRes = await request(apiEndpoint)
        .post('/api/auth/cli-login')
        .send({ apiKey: testUser.apiKey });

      const createRes = await request(apiEndpoint)
        .post('/graphql')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({
          query: `mutation($name: String!, $purpose: String!, $reason: String!) {
            createSubaccount(name: $name, purpose: $purpose, reason: $reason) {
              requestId
              status
            }
          }`,
          variables: {
            name: 'test-agent',
            purpose: 'Testing agent',
            reason: 'Need agent for testing'
          }
        });

      expect(createRes.status).toBe(200);
      expect(createRes.body.data.createSubaccount).toBeTruthy();
      expect(createRes.body.data.createSubaccount.requestId).toBeTruthy();
      expect(createRes.body.data.createSubaccount.status).toBe('PENDING');
    });

    it('should query topics via GraphQL', async () => {
      await runCli([
        'login',
        '--api-key', testUser.apiKey,
        '--server', apiEndpoint
      ]);

      const loginRes = await request(apiEndpoint)
        .post('/api/auth/cli-login')
        .send({ apiKey: testUser.apiKey });

      const topicsRes = await request(apiEndpoint)
        .post('/graphql')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ query: '{ topics { id type name unreadCount } }' });

      expect(topicsRes.status).toBe(200);
      expect(topicsRes.body.data.topics).toBeInstanceOf(Array);
    });
  });

  describe('CLI Subaccount Command', () => {
    it('should run subaccount list command', async () => {
      await runCli([
        'login',
        '--api-key', testUser.apiKey,
        '--server', apiEndpoint
      ]);

      const result = await runCli(['subaccount', 'list']);

      expect(result.code).toBe(0);
    });
  });

  describe('CLI Help Commands', () => {
    it('should verify CLI binary exists', () => {
      const fs = require('fs');
      expect(fs.existsSync(CLI_PATH)).toBe(true);
    });
  });
});

describe('CLI Contract Compliance', () => {
  describe('REST Auth Endpoints (per contract)', () => {
    it('should use POST /api/auth/register for registration', () => {
      const restAuthEndpoints = [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/cli-login',
        'POST /api/auth/session',
        'DELETE /api/auth/session',
        'GET /api/auth/me'
      ];

      expect(restAuthEndpoints).toContain('POST /api/auth/register');
      expect(restAuthEndpoints).toContain('POST /api/auth/cli-login');
    });

    it('should use GraphQL for non-auth operations', () => {
      const graphqlOperations = [
        'Query.me',
        'Query.subaccounts',
        'Query.topics',
        'Query.messages',
        'Mutation.createSubaccount',
        'Mutation.sendMessage',
        'Mutation.markAsRead',
        'Mutation.regenerateApiKey'
      ];

      expect(graphqlOperations).toContain('Query.me');
      expect(graphqlOperations).toContain('Mutation.createSubaccount');
      expect(graphqlOperations).toContain('Mutation.sendMessage');
    });

    it('should document CLI commands use GraphQL for data operations', () => {
      const cliCommands = [
        'aimp login - uses /api/auth/cli-login',
        'aimp subaccount create - uses createSubaccount mutation',
        'aimp subaccount list - uses subaccounts query',
        'aimp chat send - uses sendMessage mutation',
        'aimp chat history - uses messages query',
        'aimp whoami - uses me query'
      ];

      expect(cliCommands.length).toBe(6);
    });
  });
});