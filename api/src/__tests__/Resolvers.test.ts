import { resolvers } from '../resolvers';
import { authService } from '../services/AuthService';
import { agentBotService } from '../services/AgentBotService';
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

    describe('User Field Resolvers', () => {
      it('should resolve User.id field', async () => {
        const { userId } = await authService.register({
          email: 'fieldtest@example.com',
          password: 'password123',
        });

        const context = { user: { userId, type: 'human' } };
        const user = await (resolvers.Query as any).me(null, null, context);

        const id = await (resolvers.User as any).id(user);
        expect(id).toBe(userId);
      });

      it('should resolve User.email field', async () => {
        const { userId } = await authService.register({
          email: 'emailtest@example.com',
          password: 'password123',
        });

        const context = { user: { userId, type: 'human' } };
        const user = await (resolvers.Query as any).me(null, null, context);

        const email = await (resolvers.User as any).email(user);
        expect(email).toBe('emailtest@example.com');
      });

      it('should resolve User.type field', async () => {
        const { userId } = await authService.register({
          email: 'typetest@example.com',
          password: 'password123',
        });

        const context = { user: { userId, type: 'human' } };
        const user = await (resolvers.Query as any).me(null, null, context);

        const type = await (resolvers.User as any).type(user);
        expect(type).toBe('HUMAN');
      });

      it('should resolve User.description field', async () => {
        const { userId } = await authService.register({
          email: 'desctest@example.com',
          password: 'password123',
        });

        const context = { user: { userId, type: 'human' } };
        const user = await (resolvers.Query as any).me(null, null, context);

        const description = await (resolvers.User as any).description(user);
        expect(description).toBeUndefined();
      });

      it('should resolve User.apiKey field', async () => {
        const { userId } = await authService.register({
          email: 'apikeytest@example.com',
          password: 'password123',
        });

        const context = { user: { userId, type: 'human' } };
        const user = await (resolvers.Query as any).me(null, null, context);

        const apiKey = await (resolvers.User as any).apiKey(user);
        expect(apiKey).toBeTruthy();
      });

      it('should resolve User.createdAt and updatedAt fields', async () => {
        const { userId } = await authService.register({
          email: 'timestamptest@example.com',
          password: 'password123',
        });

        const context = { user: { userId, type: 'human' } };
        const user = await (resolvers.Query as any).me(null, null, context);

        const createdAt = await (resolvers.User as any).createdAt(user);
        const updatedAt = await (resolvers.User as any).updatedAt(user);

        expect(createdAt).toBeTruthy();
        expect(updatedAt).toBeTruthy();
        expect(new Date(createdAt)).toBeInstanceOf(Date);
        expect(new Date(updatedAt)).toBeInstanceOf(Date);
      });
    });
  });

  describe('AgentBot Resolvers', () => {
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

    describe('Query.agentBots', () => {
      it('should return agent bots for parent', async () => {
        const { requestId } = await agentBotService.createAgentBotWithAuthRequest({
          parentId: humanUserId,
          name: 'test-subaccount',
          purpose: 'Testing',
          reason: 'Test',
        });
        await agentBotService.approveAgentBot(requestId);

        const result = await (resolvers.Query as any).agentBots(null, null, humanContext);
        expect(result).toHaveLength(1);
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          (resolvers.Query as any).agentBots(null, null, {})
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('Mutation.createAgentBot', () => {
      it('should create agent bot with auth topic', async () => {
        const result = await (resolvers.Mutation as any).createAgentBot(
          null,
          { name: 'new-subaccount', purpose: 'Testing', reason: 'Test reason' },
          humanContext
        );

        expect(result).toHaveProperty('requestId');
        expect(result).toHaveProperty('status');

        const topics = await topicService.getTopicsByUser(humanUserId);
        expect(topics.some(t => t.type === 'auth')).toBe(true);
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          (resolvers.Mutation as any).createAgentBot(
            null,
            { name: 'new-subaccount', purpose: 'Testing', reason: 'Test reason' },
            {}
          )
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('Mutation.approveAgentBot', () => {
      it('should approve agent bot when user is human', async () => {
        const { requestId } = await agentBotService.createAgentBotWithAuthRequest({
          parentId: humanUserId,
          name: 'test-subaccount',
          purpose: 'Testing',
          reason: 'Test',
        });

        const result = await (resolvers.Mutation as any).approveAgentBot(
          null,
          { requestId },
          humanContext
        );

        expect(result).toHaveProperty('_id');
        expect(result.status).toBe('APPROVED');
      });

      it('should throw error when user is not human', async () => {
        const agentContext = { user: { userId: humanUserId, type: 'agent' } };

        await expect(
          (resolvers.Mutation as any).approveAgentBot(
            null,
            { requestId: 'some-id' },
            agentContext
          )
        ).rejects.toThrow('Only human users can approve agent bots');
      });
    });

    describe('Mutation.rejectAgentBot', () => {
      it('should reject agent bot when user is human', async () => {
        const { requestId } = await agentBotService.createAgentBotWithAuthRequest({
          parentId: humanUserId,
          name: 'test-subaccount',
          purpose: 'Testing',
          reason: 'Test',
        });

        const result = await (resolvers.Mutation as any).rejectAgentBot(
          null,
          { requestId, reason: 'Not justified' },
          humanContext
        );

        expect(result).toBe(true);
      });

      it('should throw error when user is not human', async () => {
        const agentContext = { user: { userId: humanUserId, type: 'agent' } };

        await expect(
          (resolvers.Mutation as any).rejectAgentBot(
            null,
            { requestId: 'some-id', reason: 'reason' },
            agentContext
          )
        ).rejects.toThrow('Only human users can reject agent bots');
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
          slug: 'test-topic-resolver-1',
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
          slug: 'test-topic-member',
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
          slug: 'test-topic-private',
          name: 'Private Topic',
          ownerId: otherResult.userId,
        });

        await expect(
          (resolvers.Query as any).topic(null, { id: topic._id.toString() }, context)
        ).rejects.toThrow('Not authorized to access this topic');
      });
    });

    describe('Topic Field Resolvers', () => {
      it('should resolve Topic.members field', async () => {
        const otherResult = await authService.register({
          email: 'member@example.com',
          password: 'password123',
        });

        const topic = await topicService.createTopic({
          type: 'group',
          slug: 'test-topic-members',
          name: 'Group Topic',
          ownerId: userId,
          members: [userId, otherResult.userId],
        });

        const result = await (resolvers.Query as any).topic(
          null,
          { id: topic._id.toString() },
          context
        );

        const members = await (resolvers.Topic as any).members(result, null, context);
        expect(members).toHaveLength(2);
      });

      it('should resolve Topic.lastMessage field when messages exist', async () => {
        const topic = await topicService.createTopic({
          type: 'direct',
          slug: 'test-topic-lastmsg',
          name: 'Chat Topic',
          ownerId: userId,
        });

        await messageService.sendMessage({
          topicId: topic._id.toString(),
          senderId: userId,
          senderType: 'user',
          type: 'TEXT',
          content: { text: 'Hello!' },
        });

        const result = await (resolvers.Query as any).topic(
          null,
          { id: topic._id.toString() },
          context
        );

        const lastMessage = await (resolvers.Topic as any).lastMessage(result, null, context);
        expect(lastMessage).toBeTruthy();
        expect(lastMessage.content).toEqual({ text: 'Hello!' });
      });

      it('should resolve Topic.lastMessage to null when no messages', async () => {
        const topic = await topicService.createTopic({
          type: 'direct',
          slug: 'test-topic-empty',
          name: 'Empty Topic',
          ownerId: userId,
        });

        const result = await (resolvers.Query as any).topic(
          null,
          { id: topic._id.toString() },
          context
        );

        const lastMessage = await (resolvers.Topic as any).lastMessage(result, null, context);
        expect(lastMessage).toBeNull();
      });

      it('should resolve Topic.unreadCount field', async () => {
        const recipient = await authService.register({
          email: 'recipient@example.com',
          password: 'password123',
        });

        const topic = await topicService.createTopic({
          type: 'direct',
          slug: 'test-topic-unread',
          name: 'Unread Topic',
          ownerId: userId,
          members: [userId, recipient.userId],
        });

        await messageService.sendMessage({
          topicId: topic._id.toString(),
          senderId: userId,
          senderType: 'user',
          type: 'TEXT',
          content: { text: 'Unread message' },
        });

        const recipientContext = { user: { userId: recipient.userId, type: 'human' } };
        const result = await (resolvers.Query as any).topic(
          null,
          { id: topic._id.toString() },
          recipientContext
        );

        const unreadCount = await (resolvers.Topic as any).unreadCount(result, null, recipientContext);
        expect(unreadCount).toBe(1);
      });

      it('should return 0 unreadCount when all messages are read', async () => {
        const topic = await topicService.createTopic({
          type: 'direct',
          slug: 'test-topic-read',
          name: 'Read Topic',
          ownerId: userId,
        });

        await messageService.sendMessage({
          topicId: topic._id.toString(),
          senderId: userId,
          senderType: 'user',
          type: 'TEXT',
          content: { text: 'Read message' },
        });

        const result = await (resolvers.Query as any).topic(
          null,
          { id: topic._id.toString() },
          context
        );

        await messageService.markAsRead(topic._id.toString(), userId);
        const unreadCount = await (resolvers.Topic as any).unreadCount(result, null, context);
        expect(unreadCount).toBe(0);
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
        slug: 'test-topic-messages',
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
          senderType: 'user',
          type: 'TEXT',
          content: { text: 'Hello!' },
        });

        const result = await (resolvers.Query as any).messages(
          null,
          { topicId },
          recipientContext
        );

        expect(result).toBeTruthy();
        expect(result).toHaveLength(1);
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
          { topicId, type: 'TEXT', content: { text: 'Hello!' } },
          senderContext
        );

        expect(result).toBeTruthy();
        expect(result.content).toEqual({ text: 'Hello!' });
      });

      it('should throw error when not authenticated', async () => {
        await expect(
          (resolvers.Mutation as any).sendMessage(
            null,
            { topicId, type: 'TEXT', content: { text: 'Hello!' } },
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
          senderType: 'user',
          type: 'TEXT',
          content: { text: 'Hello!' },
        });

        const result = await (resolvers.Mutation as any).markAsRead(
          null,
          { topicId },
          recipientContext
        );

        expect(result).toBe(true);
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
        await agentBotService.createAgentBotWithAuthRequest({
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