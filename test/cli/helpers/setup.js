process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { execSync, spawn } = require('child_process');
const request = require('supertest');

const ASPIRE_HOST_PATH = '../../infra/aspire-local-dev/apphost.ts';
const API_URL = process.env.API_URL || 'http://localhost:4000';

let apiEndpoint = null;
let aspireProcess = null;
let testUser = null;
let aspireWasStartedByUs = false;

function execAspire(args, options = {}) {
  try {
    const output = execSync(`aspire ${args} --apphost ${ASPIRE_HOST_PATH}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
      ...options
    });
    return output;
  } catch (error) {
    if (error.stdout) return error.stdout;
    if (error.stderr) return error.stderr;
    throw error;
  }
}

function getAspireEndpoint() {
  if (apiEndpoint) return apiEndpoint;

  try {
    const output = execAspire('describe api');
    
    const httpMatch = output.match(/https?:\/\/localhost:\d+/);
    if (httpMatch) {
      apiEndpoint = httpMatch[0];
      return apiEndpoint;
    }
  } catch (error) {
    console.warn('Failed to get Aspire endpoint:', error.message);
  }

  apiEndpoint = API_URL;
  return apiEndpoint;
}

function startAspire() {
  return new Promise((resolve) => {
    const existingEndpoint = getAspireEndpoint();
    if (existingEndpoint !== API_URL) {
      apiEndpoint = existingEndpoint;
      resolve(apiEndpoint);
      return;
    }

    try {
      aspireProcess = spawn('npm', ['run', 'aspire:start'], {
        cwd: '..',
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: true
      });

      let output = '';
      let resolved = false;

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          apiEndpoint = API_URL;
          resolve(apiEndpoint);
        }
      }, 30000);

      aspireProcess.stdout.on('data', (data) => {
        output += data.toString();
        const match = output.match(/https?:\/\/localhost:\d+/);
        if (match && !resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          apiEndpoint = match[0];
          aspireWasStartedByUs = true;
          setTimeout(() => resolve(apiEndpoint), 3000);
        }
      });

      aspireProcess.stderr.on('data', (data) => {
        output += data.toString();
      });

    } catch (error) {
      console.warn('Failed to start Aspire:', error.message);
      apiEndpoint = API_URL;
      resolve(apiEndpoint);
    }
  });
}

function stopAspire() {
  if (aspireWasStartedByUs && aspireProcess) {
    try {
      process.kill(-aspireProcess.pid, 'SIGTERM');
    } catch (e) {
      try {
        execSync('pkill -f "aspire" || true', { stdio: 'ignore' });
      } catch (e2) {}
    }
    aspireProcess = null;
    aspireWasStartedByUs = false;
  }
}

async function waitForApi(maxWaitMs = 30000) {
  const startTime = Date.now();
  const endpoint = getAspireEndpoint();
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      const res = await request(endpoint).get('/api/auth/me').catch(() => null);
      if (res && res.status !== 404) {
        return true;
      }
    } catch (e) {
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function registerTestUser(endpoint) {
  const targetEndpoint = endpoint || getAspireEndpoint();
  const timestamp = Date.now();
  const email = `cli-test-${timestamp}@aimp.test`;
  const password = 'Password123!';

  const res = await request(targetEndpoint)
    .post('/api/auth/register')
    .send({ email, password })
    .redirects(1);

  if (res.status !== 200) {
    throw new Error(`Failed to register: ${res.status} ${JSON.stringify(res.body)}`);
  }

  testUser = {
    email,
    password,
    token: res.body.token,
    userId: res.body.userId,
    apiKey: res.body.apiKey
  };

  return testUser;
}

async function graphqlQuery(endpoint, query, variables = {}) {
  const targetEndpoint = endpoint || getAspireEndpoint();
  
  const res = await request(targetEndpoint)
    .post('/graphql')
    .set('Authorization', `Bearer ${testUser?.token}`)
    .send({ query, variables });

  return res.body;
}

function getTestUser() {
  return testUser;
}

function getApiUrl() {
  return apiEndpoint || API_URL;
}

function clearAuthConfig() {
  try {
    const Conf = require('conf');
    const store = new Conf({ projectName: 'aimp' });
    store.clear();
  } catch (error) {
    console.warn('Failed to clear auth config:', error.message);
  }
}

function getCLIPath() {
  return require('path').resolve(__dirname, '../../../cli/dist/index.js');
}

module.exports = {
  getAspireEndpoint,
  startAspire,
  stopAspire,
  waitForApi,
  registerTestUser,
  graphqlQuery,
  getTestUser,
  getApiUrl,
  clearAuthConfig,
  getCLIPath
};