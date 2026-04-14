import { agentBotService } from '../services/AgentBotService';
import { authService } from '../services/AuthService';
import { AgentBotModel } from '../models/AgentBot';
import { AuthRequestModel } from '../models/AuthRequest';
import { UserModel } from '../models/User';

describe('AgentBotService', () => {
  let parentUserId: string;

  beforeEach(async () => {
    const result = await authService.register({
      email: 'parent@example.com',
      password: 'password123',
    });
    parentUserId = result.userId;
  });

  describe('createAgentBotWithAuthRequest', () => {
    it('should create auth request for agent bot', async () => {
      const result = await agentBotService.createAgentBotWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need to collect data from external sources',
      });

      expect(result).toHaveProperty('requestId');
      expect(result).toHaveProperty('status');

      const authRequest = await AuthRequestModel.findById(result.requestId);
      expect(authRequest).toBeTruthy();
      expect(authRequest?.agentBotName).toBe('data-collector');
      expect(authRequest?.agentBotPurpose).toBe('Data collection agent');
      expect(authRequest?.status).toBe('PENDING');
    });
  });

  describe('approveAgentBot', () => {
    it('should approve pending agent bot request', async () => {
      const { requestId } = await agentBotService.createAgentBotWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need it',
      });

      const agentBot = await agentBotService.approveAgentBot(requestId);

      expect(agentBot).toHaveProperty('_id');
      expect(agentBot.name).toBe('data-collector');
      expect(agentBot.purpose).toBe('Data collection agent');
      expect(agentBot.status).toBe('APPROVED');
      expect(agentBot.apiKey).toMatch(/^ak_/);

      const authRequest = await AuthRequestModel.findById(requestId);
      expect(authRequest?.status).toBe('APPROVED');
    });

    it('should throw error for non-existent auth request', async () => {
      await expect(
        agentBotService.approveAgentBot('nonexistent-id')
      ).rejects.toThrow('Auth request not found');
    });

    it('should throw error if request is not pending', async () => {
      const { requestId } = await agentBotService.createAgentBotWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need it',
      });

      await agentBotService.approveAgentBot(requestId);

      await expect(
        agentBotService.approveAgentBot(requestId)
      ).rejects.toThrow('Auth request is not pending');
    });
  });

  describe('rejectAgentBot', () => {
    it('should reject pending agent bot request', async () => {
      const { requestId } = await agentBotService.createAgentBotWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need it',
      });

      await agentBotService.rejectAgentBot(requestId, 'Insufficient justification');

      const authRequest = await AuthRequestModel.findById(requestId);
      expect(authRequest?.status).toBe('REJECTED');
      expect(authRequest?.rejectReason).toBe('Insufficient justification');
    });

    it('should throw error for non-existent auth request', async () => {
      await expect(
        agentBotService.rejectAgentBot('nonexistent-id', 'reason')
      ).rejects.toThrow('Auth request not found');
    });
  });

  describe('getAgentBotsByParent', () => {
    it('should return approved agent bots for parent', async () => {
      const { requestId: ar1 } = await agentBotService.createAgentBotWithAuthRequest({
        parentId: parentUserId,
        name: 'agentbot-1',
        purpose: 'Purpose 1',
        reason: 'Reason 1',
      });

      const { requestId: ar2 } = await agentBotService.createAgentBotWithAuthRequest({
        parentId: parentUserId,
        name: 'agentbot-2',
        purpose: 'Purpose 2',
        reason: 'Reason 2',
      });

      await agentBotService.approveAgentBot(ar1);

      const agentBots = await agentBotService.getAgentBotsByParent(parentUserId);
      expect(agentBots).toHaveLength(1);
      expect(agentBots[0].name).toBe('agentbot-1');
    });

    it('should return empty array for parent with no agent bots', async () => {
      const agentBots = await agentBotService.getAgentBotsByParent(parentUserId);
      expect(agentBots).toHaveLength(0);
    });
  });

  describe('getAgentBotById', () => {
    it('should return agent bot by id', async () => {
      const { requestId } = await agentBotService.createAgentBotWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need it',
      });

      const agentBot = await agentBotService.approveAgentBot(requestId);
      const found = await agentBotService.getAgentBotById(agentBot._id.toString());

      expect(found).toBeTruthy();
      expect(found?.name).toBe('data-collector');
    });

    it('should return null for non-existent id', async () => {
      const found = await agentBotService.getAgentBotById('nonexistent-id');
      expect(found).toBeNull();
    });
  });

  describe('approveAgentBot - user creation', () => {
    it('should create User with type=agent when approving', async () => {
      const { requestId } = await agentBotService.createAgentBotWithAuthRequest({
        parentId: parentUserId,
        name: 'agent-agentbot',
        purpose: 'Test agent',
        reason: 'Testing',
      });

      const agentBot = await agentBotService.approveAgentBot(requestId);

      const agentUser = await UserModel.findOne({ email: `agentbot_${agentBot._id}@aimp.local` });
      expect(agentUser).toBeTruthy();
      expect(agentUser?.type).toBe('agent');
      expect(agentUser?.apiKey).toBe(agentBot.apiKey);
    });
  });
});