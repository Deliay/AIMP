import { generateJwt, verifyJwt, JwtPayload } from '../auth/jwtAuth';
import { apiKeyAuth } from '../auth/apiKeyAuth';
import { buildContext, Context } from '../auth/context';
import { authService } from '../services/AuthService';
import { UserModel } from '../models/User';

describe('Auth Middleware', () => {
  describe('JWT Auth', () => {
    describe('generateJwt', () => {
      it('should generate a valid JWT token', () => {
        const token = generateJwt({ userId: 'user123', type: 'human' });
        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);
      });
    });

    describe('verifyJwt', () => {
      it('should verify a valid JWT token', () => {
        const token = generateJwt({ userId: 'user123', type: 'human' });
        const payload = verifyJwt(token);

        expect(payload.userId).toBe('user123');
        expect(payload.type).toBe('human');
      });

      it('should throw error for invalid token', () => {
        expect(() => verifyJwt('invalid-token')).toThrow('Invalid or expired token');
      });

      it('should throw error for malformed token', () => {
        expect(() => verifyJwt('eyJhbGciOiJIUzI1NiJ9.malformed')).toThrow('Invalid or expired token');
      });
    });
  });

  describe('API Key Auth', () => {
    let humanUserId: string;
    let agentUserId: string;
    let humanApiKey: string;
    let agentApiKey: string;

    beforeEach(async () => {
      const human = await authService.register({
        email: 'human@example.com',
        password: 'password123',
      });
      humanUserId = human.userId;
      const humanUser = await UserModel.findById(humanUserId);
      humanApiKey = humanUser!.apiKey;

      const { userId } = await authService.register({
        email: 'agent@example.com',
        password: 'password123',
      });
      agentUserId = userId;
      const agentUser = await UserModel.findById(agentUserId);
      agentApiKey = agentUser!.apiKey;
    });

    it('should authenticate human user with valid API key', async () => {
      const result = await apiKeyAuth(humanApiKey);

      expect(result.userId).toBe(humanUserId);
      expect(result.type).toBe('human');
    });

    it('should authenticate agent user with valid API key', async () => {
      await UserModel.findByIdAndUpdate(agentUserId, { type: 'agent' });
      const agentUser = await UserModel.findById(agentUserId);
      const result = await apiKeyAuth(agentUser!.apiKey);

      expect(result.userId).toBe(agentUserId);
      expect(result.type).toBe('agent');
    });

    it('should throw error for invalid API key', async () => {
      await expect(apiKeyAuth('ak_invalid_key')).rejects.toThrow('Invalid API key');
    });
  });

  describe('buildContext', () => {
    let token: string;
    let apiKey: string;
    let userId: string;

    beforeEach(async () => {
      const { userId: id, token: t } = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });
      userId = id;
      token = t;

      const user = await UserModel.findById(userId);
      apiKey = user!.apiKey;
    });

    it('should return empty context when no authorization header', async () => {
      const context = await buildContext({});
      expect(context).toEqual({});
    });

    it('should return user context with valid Bearer token', async () => {
      const context = await buildContext({ authorization: `Bearer ${token}` });

      expect(context.user).toBeTruthy();
      expect(context.user!.userId).toBe(userId);
    });

    it('should return user context with valid API key', async () => {
      const context = await buildContext({ authorization: apiKey });

      expect(context.user).toBeTruthy();
      expect(context.user!.userId).toBe(userId);
    });

    it('should return empty context for invalid Bearer token', async () => {
      const context = await buildContext({ authorization: 'Bearer invalid-token' });
      expect(context).toEqual({});
    });

    it('should return empty context for invalid API key', async () => {
      const context = await buildContext({ authorization: 'ak_invalid_key' });
      expect(context).toEqual({});
    });

    it('should return empty context for unrecognized auth format', async () => {
      const context = await buildContext({ authorization: 'Basic abc123' });
      expect(context).toEqual({});
    });
  });
});