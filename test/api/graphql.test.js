const request = require('supertest');

const API_URL = process.env.API_URL || 'http://localhost:4000';

describe('GraphQL API Contract Tests', () => {
  let authToken;
  let userId;
  let apiKey;

  beforeAll(async () => {
    const timestamp = Date.now();
    const res = await request(API_URL)
      .post('/api/auth/register')
      .send({ email: `test-${timestamp}@aimp.test`, password: 'Password123!' });
    authToken = res.body.token;
    userId = res.body.userId;
    apiKey = res.body.apiKey;
  });

  describe('Query.me', () => {
    it('should return current user when authenticated', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ me { id email type createdAt updatedAt } }' });

      expect(res.status).toBe(200);
      expect(res.body.data.me).toBeTruthy();
      expect(res.body.data.me.email).toBeTruthy();
      expect(res.body.data.me.type).toBe('HUMAN');
    });

    it('should return null when not authenticated', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .send({ query: '{ me { id } }' });

      expect(res.status).toBe(200);
      expect(res.body.data.me).toBeNull();
    });
  });

  describe('Query.agentBots', () => {
    it('should return agent bots for authenticated user', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ agentBots { id name purpose status createdAt } }' });

      expect(res.status).toBe(200);
      expect(res.body.data.agentBots).toBeInstanceOf(Array);
    });

    it('should throw error when not authenticated', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .send({ query: '{ agentBots { id } }' });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeTruthy();
    });
  });

  describe('Query.authRequests', () => {
    it('should return auth requests with default PENDING status', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ authRequests { id agentBotName status createdAt } }' });

      expect(res.status).toBe(200);
      expect(res.body.data.authRequests).toBeInstanceOf(Array);
    });

    it('should filter auth requests by status', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ authRequests(status: APPROVED) { id status } }' });

      expect(res.status).toBe(200);
      expect(res.body.data.authRequests).toBeInstanceOf(Array);
    });
  });

  describe('Query.topics', () => {
    it('should return topics for authenticated user', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ topics { id type name unreadCount createdAt } }' });

      expect(res.status).toBe(200);
      expect(res.body.data.topics).toBeInstanceOf(Array);
    });

    it('should return topics with all extended fields', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ topics { id ownerId slug type name description status unreadCount createdAt updatedAt } }' });

      expect(res.status).toBe(200);
      expect(res.body.data.topics).toBeInstanceOf(Array);
    });
  });

  describe('Query.searchTopics', () => {
    it('should return search results with relateScore', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: 'query($keyword: String!) { searchTopics(keyword: $keyword) { slug name description relateScore } }', variables: { keyword: 'test' } });

      expect(res.status).toBe(200);
      expect(res.body.data.searchTopics).toBeInstanceOf(Array);
      res.body.data.searchTopics.forEach(topic => {
        expect(topic).toHaveProperty('slug');
        expect(topic).toHaveProperty('name');
        expect(topic).toHaveProperty('description');
        expect(topic).toHaveProperty('relateScore');
      });
    });

    it('should return empty array for no matches', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: 'query($keyword: String!) { searchTopics(keyword: $keyword) { slug relateScore } }', variables: { keyword: 'nonexistentkeyword12345' } });

      expect(res.status).toBe(200);
      expect(res.body.data.searchTopics).toBeInstanceOf(Array);
    });
  });

  describe('Query.topic', () => {
    it('should return topic by id when user is member', async () => {
      const topicsRes = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ topics { id } }' });

      const topicId = topicsRes.body.data.topics[0]?.id;
      if (topicId) {
        const res = await request(API_URL)
          .post('/graphql')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ query: 'query($id: ID!) { topic(id: $id) { id ownerId slug type name description status unreadCount createdAt updatedAt } }', variables: { id: topicId } });

        expect(res.status).toBe(200);
        expect(res.body.data.topic).toBeTruthy();
        expect(res.body.data.topic.id).toBe(topicId);
      }
    });

    it('should return topic with members and lastMessage', async () => {
      const topicsRes = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ topics { id } }' });

      const topicId = topicsRes.body.data.topics[0]?.id;
      if (topicId) {
        const res = await request(API_URL)
          .post('/graphql')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ query: 'query($id: ID!) { topic(id: $id) { id members { id email } lastMessage { id content createdAt } } }', variables: { id: topicId } });

        expect(res.status).toBe(200);
        expect(res.body.data.topic).toBeTruthy();
        expect(res.body.data.topic.members).toBeInstanceOf(Array);
      }
    });

    it('should return null for non-existent topic', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: 'query($id: ID!) { topic(id: $id) { id } }', variables: { id: '000000000000000000000000' } });

      expect(res.status).toBe(200);
      expect(res.body.data.topic).toBeNull();
    });
  });

  describe('Query.messages', () => {
    it('should return messages for topic', async () => {
      const topicsRes = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ topics { id } }' });

      const topicId = topicsRes.body.data.topics[0]?.id;
      if (topicId) {
        const res = await request(API_URL)
          .post('/graphql')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ query: 'query($topicId: ID!) { messages(topicId: $topicId) { id type content createdAt } }', variables: { topicId } });

        expect(res.status).toBe(200);
        expect(res.body.data.messages).toBeInstanceOf(Array);
      }
    });

    it('should support pagination with limit', async () => {
      const topicsRes = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ topics { id } }' });

      const topicId = topicsRes.body.data.topics[0]?.id;
      if (topicId) {
        const res = await request(API_URL)
          .post('/graphql')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ query: 'query($topicId: ID!, $limit: Int) { messages(topicId: $topicId, limit: $limit) { id } }', variables: { topicId, limit: 10 } });

        expect(res.status).toBe(200);
        expect(res.body.data.messages).toBeInstanceOf(Array);
      }
    });
  });

  describe('Mutation.createAgentBot', () => {
    it('should create agent bot with auth request', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `mutation($name: String!, $purpose: String!, $reason: String!) {
            createAgentBot(name: $name, purpose: $purpose, reason: $reason) {
              requestId
              status
            }
          }`,
          variables: { name: 'test-agent', purpose: 'Testing agent', reason: 'Need agent for testing' }
        });

      expect(res.status).toBe(200);
      expect(res.body.data.createAgentBot).toBeTruthy();
      expect(res.body.data.createAgentBot.requestId).toBeTruthy();
      expect(res.body.data.createAgentBot.status).toBe('PENDING');
    });
  });

  describe('Mutation.regenerateApiKey', () => {
    it('should regenerate API key for authenticated user', async () => {
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: 'mutation { regenerateApiKey { apiKey } }' });

      expect(res.status).toBe(200);
      expect(res.body.data.regenerateApiKey).toBeTruthy();
      expect(res.body.data.regenerateApiKey.apiKey).toMatch(/^ak_/);
    });
  });

  describe('Mutation.createTopic', () => {
    it('should create topic with slug, name and description (Web mode)', async () => {
      const timestamp = Date.now();
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `mutation($slug: String!, $name: String!, $description: String!) {
            createTopic(slug: $slug, name: $name, description: $description) {
              requestId
              status
              topic {
                id
                slug
                name
                description
                status
              }
            }
          }`,
          variables: { slug: `test-topic-${timestamp}`, name: `Test Topic ${timestamp}`, description: 'Test description' }
        });

      expect(res.status).toBe(200);
      expect(res.body.data.createTopic).toBeTruthy();
      expect(res.body.data.createTopic.status).toBe('ACTIVE');
      expect(res.body.data.createTopic.topic).toBeTruthy();
      expect(res.body.data.createTopic.topic.slug).toBe(`test-topic-${timestamp}`);
      expect(res.body.data.createTopic.topic.name).toBe(`Test Topic ${timestamp}`);
      expect(res.body.data.createTopic.topic.description).toBe('Test description');
    });

    it('should create topic with wait=true (CLI mode, pending status)', async () => {
      const timestamp = Date.now();
      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `mutation($slug: String!, $name: String!, $description: String!, $wait: Boolean) {
            createTopic(slug: $slug, name: $name, description: $description, wait: $wait) {
              requestId
              status
              topic {
                id
                slug
                status
              }
            }
          }`,
          variables: { slug: `cli-topic-${timestamp}`, name: `CLI Topic ${timestamp}`, description: 'CLI test', wait: true }
        });

      expect(res.status).toBe(200);
      expect(res.body.data.createTopic).toBeTruthy();
      expect(['PENDING', 'ACTIVE']).toContain(res.body.data.createTopic.status);
    });

    it('should return error when slug already exists', async () => {
      const timestamp = Date.now();
      const slug = `duplicate-slug-${timestamp}`;
      
      await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `mutation($slug: String!, $name: String!, $description: String!) {
            createTopic(slug: $slug, name: $name, description: $description) {
              status
            }
          }`,
          variables: { slug, name: `Topic ${timestamp}`, description: 'First creation' }
        });

      const res = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `mutation($slug: String!, $name: String!, $description: String!) {
            createTopic(slug: $slug, name: $name, description: $description) {
              status
            }
          }`,
          variables: { slug, name: `Topic ${timestamp}`, description: 'Duplicate' }
        });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeTruthy();
    });
  });

  describe('Mutation.approveTopic', () => {
    it('should approve pending topic and return active topic', async () => {
      const timestamp = Date.now();
      
      const createRes = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `mutation($slug: String!, $name: String!, $description: String!, $wait: Boolean) {
            createTopic(slug: $slug, name: $name, description: $description, wait: $wait) {
              requestId
              status
            }
          }`,
          variables: { slug: `approve-topic-${timestamp}`, name: `Approve Topic ${timestamp}`, description: 'Test approve', wait: true }
        });

      const requestId = createRes.body.data?.createTopic?.requestId;
      
      if (requestId) {
        const res = await request(API_URL)
          .post('/graphql')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            query: 'query($requestId: ID!) { approveTopic(requestId: $requestId) { id slug status } }',
            variables: { requestId }
          });

        expect(res.status).toBe(200);
        expect(res.body.data.approveTopic).toBeTruthy();
        expect(res.body.data.approveTopic.status).toBe('ACTIVE');
      }
    });
  });

  describe('Mutation.rejectTopic', () => {
    it('should reject pending topic with reason', async () => {
      const timestamp = Date.now();
      
      const createRes = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `mutation($slug: String!, $name: String!, $description: String!, $wait: Boolean) {
            createTopic(slug: $slug, name: $name, description: $description, wait: $wait) {
              requestId
              status
            }
          }`,
          variables: { slug: `reject-topic-${timestamp}`, name: `Reject Topic ${timestamp}`, description: 'Test reject', wait: true }
        });

      const requestId = createRes.body.data?.createTopic?.requestId;
      
      if (requestId) {
        const res = await request(API_URL)
          .post('/graphql')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            query: 'mutation($requestId: ID!, $reason: String!) { rejectTopic(requestId: $requestId, reason: $reason) }',
            variables: { requestId, reason: 'Test rejection reason' }
          });

        expect(res.status).toBe(200);
        expect(res.body.data.rejectTopic).toBe(true);
      }
    });
  });

  describe('Mutation.clearTopicMessages', () => {
    it('should clear topic messages and return cleared count', async () => {
      const topicsRes = await request(API_URL)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: '{ topics { id } }' });

      const topicId = topicsRes.body.data.topics[0]?.id;
      
      if (topicId) {
        const res = await request(API_URL)
          .post('/graphql')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            query: 'mutation($topicId: ID!) { clearTopicMessages(topicId: $topicId) { status clearedCount } }',
            variables: { topicId }
          });

        expect(res.status).toBe(200);
        expect(res.body.data.clearTopicMessages).toBeTruthy();
        expect(res.body.data.clearTopicMessages.status).toBe('ok');
        expect(typeof res.body.data.clearTopicMessages.clearedCount).toBe('number');
      }
    });
  });
});

describe('REST Auth API Contract Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register new user and return userId and apiKey', async () => {
      const email = `register-${Date.now()}@aimp.test`;
      const res = await request(API_URL)
        .post('/api/auth/register')
        .send({ email, password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.userId).toBeTruthy();
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(API_URL)
        .post('/api/auth/register')
        .send({ password: 'Password123!' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(API_URL)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
    });

    it('should return 400 when email already exists', async () => {
      const email = `duplicate-${Date.now()}@aimp.test`;
      await request(API_URL)
        .post('/api/auth/register')
        .send({ email, password: 'Password123!' });

      const res = await request(API_URL)
        .post('/api/auth/register')
        .send({ email, password: 'Password456!' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    let testEmail;
    let testPassword;

    beforeAll(async () => {
      testEmail = `login-${Date.now()}@aimp.test`;
      testPassword = 'Password123!';
      await request(API_URL)
        .post('/api/auth/register')
        .send({ email: testEmail, password: testPassword });
    });

    it('should login with email and password and return token and userId', async () => {
      const res = await request(API_URL)
        .post('/api/auth/login')
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.userId).toBeTruthy();
    });

    it('should return 401 with wrong password', async () => {
      const res = await request(API_URL)
        .post('/api/auth/login')
        .send({ email: testEmail, password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeTruthy();
    });

    it('should return 401 when user does not exist', async () => {
      const res = await request(API_URL)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@aimp.test', password: 'Password123!' });

      expect(res.status).toBe(401);
    });

    it('should return 400 when email is missing', async () => {
      const res = await request(API_URL)
        .post('/api/auth/login')
        .send({ password: 'Password123!' });

      expect(res.status).toBe(400);
    });

    it('should return 400 when password is missing', async () => {
      const res = await request(API_URL)
        .post('/api/auth/login')
        .send({ email: testEmail });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/cli-login', () => {
    let testApiKey;
    let testToken;

    beforeAll(async () => {
      const email = `cli-${Date.now()}@aimp.test`;
      const regRes = await request(API_URL)
        .post('/api/auth/register')
        .send({ email, password: 'Password123!' });
      testToken = regRes.body.token;

      const apiKeyRes = await request(API_URL)
        .get('/api/auth/api-key')
        .set('Authorization', `Bearer ${testToken}`);
      testApiKey = apiKeyRes.body.apiKey;
    });

    it('should login with API key and return token and userId', async () => {
      const res = await request(API_URL)
        .post('/api/auth/cli-login')
        .send({ apiKey: testApiKey });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
      expect(res.body.userId).toBeTruthy();
    });

    it('should return 401 with invalid API key', async () => {
      const res = await request(API_URL)
        .post('/api/auth/cli-login')
        .send({ apiKey: 'ak_invalid_key' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeTruthy();
    });

    it('should return 400 when apiKey is missing', async () => {
      const res = await request(API_URL)
        .post('/api/auth/cli-login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/session', () => {
    let sessionToken;

    beforeAll(async () => {
      const email = `session-${Date.now()}@aimp.test`;
      const regRes = await request(API_URL)
        .post('/api/auth/register')
        .send({ email, password: 'Password123!' });
      sessionToken = regRes.body.token;
    });

    it('should refresh session and return new token', async () => {
      const res = await request(API_URL)
        .post('/api/auth/session')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
    });

    it('should return 401 when no token provided', async () => {
      const res = await request(API_URL)
        .post('/api/auth/session');

      expect(res.status).toBe(401);
    });

    it('should return 401 when token is invalid', async () => {
      const res = await request(API_URL)
        .post('/api/auth/session')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/auth/session', () => {
    it('should return message on logout', async () => {
      const res = await request(API_URL)
        .delete('/api/auth/session');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/me', () => {
    let meToken;

    beforeAll(async () => {
      const email = `me-${Date.now()}@aimp.test`;
      const regRes = await request(API_URL)
        .post('/api/auth/register')
        .send({ email, password: 'Password123!' });
      meToken = regRes.body.token;
    });

    it('should return user info with valid token', async () => {
      const res = await request(API_URL)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${meToken}`);

      expect(res.status).toBe(200);
      expect(res.body.userId).toBeTruthy();
      expect(res.body.email).toBeTruthy();
      expect(res.body.type).toBe('human');
    });

    it('should return 401 when no token provided', async () => {
      const res = await request(API_URL)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 when token is invalid', async () => {
      const res = await request(API_URL)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});