import { resolvers } from '../resolvers';
import { authService } from '../services/AuthService';
import { subaccountService } from '../services/SubaccountService';
import { topicService } from '../services/TopicService';
import { messageService } from '../services/MessageService';

describe('Resolvers', () => {
  describe('Auth Resolvers', () => {
    describe('Query.me', () => {
      it('should return user when authenticated', async () => {
        const { userId } = await authService.register({
          email: 'test@example.com',
          password: 'password123',
        });

        const context = { user: { userId, type: 'human' } };
        const result = await (resolvers.Query as any).me(null, null, context);

        expect(result).toBeTruthy();
        expect(result.email).toBe('test@example.com');
      });

      it('should throw error when not authenticated', async () => {
        const context = {};
        await expect(
          (resolvers.Query as any).me(null, null, context)
        ).rejects.toThrow('Not authenticated');
      });
    });
  });

  describe('Subaccount Resolvers', () => {
    let humanUserId: string;
    let humanContext: { user?: { userId: string; type: string } };

    beforeEach(async () => {
      const { userId } = await authService.register({
        email: 'human@example.com',
        password: 'password123',
      });
      humanUserId = userId;
      humanContext = { user: { userId, type: 'human' } };
    });

    describe('Query.subaccounts', () => {
      it('should return subaccounts for parent', async () => {
        const { authRequestId } = await subaccountService.createSubaccountWithAuthRequest({
          parentId: humanUserId,
          name: 'test-subaccount',
          purpose: 'Testing',
          reason: 'Test',
        });
        await subaccountService.approveSubaccount(authRequestId);

        const result = await (resolvers.Query as any).subaccounts(null, null, humanContext);
        expect(result).toHaveLength(1);
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          (resolvers.Query as any).subaccounts(null, null, {})
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('Mutation.createSubaccount', () => {
      it('should create subaccount with auth topic', async () => {
        const result = await (resolvers.Mutation as any).createSubaccount(
          null,
          { name: 'new-subaccount', purpose: 'Testing', reason: 'Test reason' },
          humanContext
        );

        expect(result).toHaveProperty('authRequestId');
        expect(result).toHaveProperty('subaccountId');

        const topics = await topicService.getTopicsByUser(humanUserId);
        expect(topics.some(t => t.type === 'auth')).toBe(true);
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          (resolvers.Mutation as any).createSubaccount(
            null,
            { name: 'new-subaccount', purpose: 'Testing', reason: 'Test reason' },
            {}
          )
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('Mutation.approveSubaccount', () => {
      it('should approve subaccount when user is human', async () => {
        const { authRequestId } = await subaccountService.createSubaccountWithAuthRequest({
          parentId: humanUserId,
          name: 'test-subaccount',
          purpose: 'Testing',
          reason: 'Test',
        });

        const result = await (resolvers.Mutation as any).approveSubaccount(
          null,
          { authRequestId },
          humanContext
        );

        expect(result).toHaveProperty('_id');
        expect(result.status).toBe('approved');
      });

      it('should throw error when user is not human', async () => {
        const agentContext = { user: { userId: humanUserId, type: 'agent' } };

        await expect(
          (resolvers.Mutation as any).approveSubaccount(
            null,
            { authRequestId: 'some-id' },
            agentContext
          )
        ).rejects.toThrow('Only human users can approve subaccounts');
      });
    });

    describe('Mutation.rejectSubaccount', () => {
      it('should reject subaccount when user is human', async () => {
        const { authRequestId } = await subaccountService.createSubaccountWithAuthRequest({
          parentId: humanUserId,
          name: 'test-subaccount',
          purpose: 'Testing',
          reason: 'Test',
        });

        const result = await (resolvers.Mutation as any).rejectSubaccount(
          null,
          { authRequestId, reason: 'Not justified' },
          humanContext
        );

        expect(result).toBe(true);
      });

      it('should throw error when user is not human', async () => {
        const agentContext = { user: { userId: humanUserId, type: 'agent' } };

        await expect(
          (resolvers.Mutation as any).rejectSubaccount(
            null,
            { authRequestId: 'some-id', reason: 'reason' },
            agentContext
          )
        ).rejects.toThrow('Only human users can reject subaccounts');
      });
    });
  });

  describe('Topic Resolvers', () => {
    let userId: string;
    let context: { user?: { userId: string; type: string } };

    beforeEach(async () => {
      const { userId: id } = await authService.register({
        email: 'user@example.com',
        password: 'password123',
      });
      userId = id;
      context = { user: { userId: id, type: 'human' } };
    });

    describe('Query.topics', () => {
      it('should return topics for user', async () => {
        await topicService.createTopic({
          type: 'direct',
          name: 'Test Topic',
          ownerId: userId,
        });

        const result = await (resolvers.Query as any).topics(null, null, context);
        expect(result).toHaveLength(1);
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          (resolvers.Query as any).topics(null, null, {})
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('Query.topic', () => {
      it('should return topic when user is member', async () => {
        const topic = await topicService.createTopic({
          type: 'direct',
          name: 'Test Topic',
          ownerId: userId,
        });

        const result = await (resolvers.Query as any).topic(
          null,
          { id: topic._id.toString() },
          context
        );

        expect(result).toBeTruthy();
        expect(result.name).toBe('Test Topic');
      });

      it('should throw error when user is not member', async () => {
        const otherResult = await authService.register({
          email: 'other@example.com',
          password: 'password123',
        });

        const topic = await topicService.createTopic({
          type: 'direct',
          name: 'Private Topic',
          ownerId: otherResult.userId,
        });

        await expect(
          (resolvers.Query as any).topic(null, { id: topic._id.toString() }, context)
        ).rejects.toThrow('Not authorized to access this topic');
      });
    });
  });

  describe('Message Resolvers', () => {
    let senderId: string;
    let recipientId: string;
    let topicId: string;
    let senderContext: { user?: { userId: string; type: string } };
    let recipientContext: { user?: { userId: string; type: string } };

    beforeEach(async () => {
      const sender = await authService.register({
        email: 'sender@example.com',
        password: 'password123',
      });
      senderId = sender.userId;

      const recipient = await authService.register({
        email: 'recipient@example.com',
        password: 'password123',
      });
      recipientId = recipient.userId;

      senderContext = { user: { userId: senderId, type: 'human' } };
      recipientContext = { user: { userId: recipientId, type: 'human' } };

      const topic = await topicService.createTopic({
        type: 'direct',
        name: 'Test Topic',
        ownerId: senderId,
        members: [senderId, recipientId],
      });
      topicId = topic._id.toString();
    });

    describe('Query.messages', () => {
      it('should return topic with messages for member', async () => {
        await messageService.sendMessage({
          topicId,
          senderId,
          type: 'text',
          content: { text: 'Hello!' },
        });

        const result = await (resolvers.Query as any).messages(
          null,
          { topicId },
          recipientContext
        );

        expect(result).toBeTruthy();
        expect(result.messages).toHaveLength(1);
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          (resolvers.Query as any).messages(null, { topicId }, {})
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('Mutation.sendMessage', () => {
      it('should send message', async () => {
        const result = await (resolvers.Mutation as any).sendMessage(
          null,
          { topicId, type: 'text', content: { text: 'Hello!' } },
          senderContext
        );

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].content).toEqual({ text: 'Hello!' });
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          (resolvers.Mutation as any).sendMessage(
            null,
            { topicId, type: 'text', content: { text: 'Hello!' } },
            {}
          )
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('Mutation.markAsRead', () => {
      it('should mark messages as read', async () => {
        await messageService.sendMessage({
          topicId,
          senderId,
          type: 'text',
          content: { text: 'Hello!' },
        });

        const result = await (resolvers.Mutation as any).markAsRead(
          null,
          { topicId },
          recipientContext
        );

        expect(result.messages[0].readBy.some((r: any) => r.toString() === recipientId)).toBe(true);
      });
    });
  });

  describe('AuthRequest Resolvers', () => {
    let humanUserId: string;
    let humanContext: { user?: { userId: string; type: string } };

    beforeEach(async () => {
      const { userId } = await authService.register({
        email: 'human@example.com',
        password: 'password123',
      });
      humanUserId = userId;
      humanContext = { user: { userId, type: 'human' } };
    });

    describe('Query.authRequests', () => {
      it('should return auth requests for applicant', async () => {
        await subaccountService.createSubaccountWithAuthRequest({
          parentId: humanUserId,
          name: 'test-subaccount',
          purpose: 'Testing',
          reason: 'Test',
        });

        const result = await (resolvers.Query as any).authRequests(null, null, humanContext);
        expect(result).toHaveLength(1);
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          (resolvers.Query as any).authRequests(null, null, {})
        ).rejects.toThrow('Not authenticated');
      });
    });
  });
});