import { messageService } from '../services/MessageService';
import { topicService } from '../services/TopicService';
import { authService } from '../services/AuthService';
import { UserModel } from '../models/User';

describe('MessageService', () => {
  let senderId: string;
  let recipientId: string;
  let topicId: string;

  beforeEach(async () => {
    const senderResult = await authService.register({
      email: 'sender@example.com',
      password: 'password123',
    });
    senderId = senderResult.userId;

    const recipientResult = await authService.register({
      email: 'recipient@example.com',
      password: 'password123',
    });
    recipientId = recipientResult.userId;

    const topic = await topicService.createTopic({
      type: 'direct',
      name: 'Test Topic',
      ownerId: senderId,
      members: [senderId, recipientId],
    });
    topicId = topic._id.toString();
  });

  describe('sendMessage', () => {
    it('should send text message to topic', async () => {
      const topic = await messageService.sendMessage({
        topicId,
        senderId,
        type: 'text',
        content: { text: 'Hello, world!' },
      });

      expect(topic.messages).toHaveLength(1);
      expect(topic.messages[0].content).toEqual({ text: 'Hello, world!' });
      expect(topic.messages[0].type).toBe('text');
      expect(topic.messages[0].senderId.toString()).toBe(senderId);
    });

    it('should send form message to topic', async () => {
      const formContent = {
        fields: [
          { name: 'email', type: 'email', required: true },
          { name: 'message', type: 'text', required: true },
        ],
      };

      const topic = await messageService.sendMessage({
        topicId,
        senderId,
        type: 'form',
        content: formContent,
      });

      expect(topic.messages[0].type).toBe('form');
      expect(topic.messages[0].content).toEqual(formContent);
    });

    it('should add sender to readBy automatically', async () => {
      const topic = await messageService.sendMessage({
        topicId,
        senderId,
        type: 'text',
        content: { text: 'Hello!' },
      });

      expect(topic.messages[0].readBy).toHaveLength(1);
      expect(topic.messages[0].readBy[0].toString()).toBe(senderId);
    });

    it('should throw error for non-existent topic', async () => {
      await expect(
        messageService.sendMessage({
          topicId: 'nonexistent-id',
          senderId,
          type: 'text',
          content: { text: 'Hello!' },
        })
      ).rejects.toThrow('Topic not found');
    });

    it('should throw error if sender is not a member', async () => {
      const otherUserResult = await authService.register({
        email: 'other@example.com',
        password: 'password123',
      });

      await expect(
        messageService.sendMessage({
          topicId,
          senderId: otherUserResult.userId,
          type: 'text',
          content: { text: 'Hello!' },
        })
      ).rejects.toThrow('Not authorized to send message to this topic');
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read for user', async () => {
      await messageService.sendMessage({
        topicId,
        senderId,
        type: 'text',
        content: { text: 'Hello!' },
      });

      const topic = await messageService.markAsRead(topicId, recipientId);

      expect(topic?.messages[0].readBy).toHaveLength(2);
      expect(topic?.messages[0].readBy.some((r) => r.toString() === recipientId)).toBe(
        true
      );
    });

    it('should not duplicate user in readBy', async () => {
      await messageService.sendMessage({
        topicId,
        senderId,
        type: 'text',
        content: { text: 'Hello!' },
      });

      const topic = await messageService.markAsRead(topicId, senderId);

      expect(topic?.messages[0].readBy).toHaveLength(1);
    });

    it('should return null for non-existent topic', async () => {
      const topic = await messageService.markAsRead('nonexistent-id', senderId);
      expect(topic).toBeNull();
    });
  });

  describe('getUnreadCount', () => {
    it('should return 0 for read messages', async () => {
      await messageService.sendMessage({
        topicId,
        senderId,
        type: 'text',
        content: { text: 'Hello!' },
      });

      await messageService.markAsRead(topicId, recipientId);

      const count = await messageService.getUnreadCount(topicId, recipientId);
      expect(count).toBe(0);
    });

    it('should return correct count for unread messages', async () => {
      await messageService.sendMessage({
        topicId,
        senderId,
        type: 'text',
        content: { text: 'Message 1' },
      });

      await messageService.sendMessage({
        topicId,
        senderId,
        type: 'text',
        content: { text: 'Message 2' },
      });

      const count = await messageService.getUnreadCount(topicId, recipientId);
      expect(count).toBe(2);
    });

    it('should return 0 for non-existent topic', async () => {
      const count = await messageService.getUnreadCount('nonexistent-id', senderId);
      expect(count).toBe(0);
    });
  });

  describe('getMessagesByTopic', () => {
    it('should return topic with messages for member', async () => {
      await messageService.sendMessage({
        topicId,
        senderId,
        type: 'text',
        content: { text: 'Hello!' },
      });

      const topic = await messageService.getMessagesByTopic(topicId, recipientId);

      expect(topic).toBeTruthy();
      expect(topic?.messages).toHaveLength(1);
    });

    it('should return null for non-member', async () => {
      const otherUserResult = await authService.register({
        email: 'other@example.com',
        password: 'password123',
      });

      const topic = await messageService.getMessagesByTopic(
        topicId,
        otherUserResult.userId
      );

      expect(topic).toBeNull();
    });

    it('should return null for non-existent topic', async () => {
      const topic = await messageService.getMessagesByTopic('nonexistent-id', senderId);
      expect(topic).toBeNull();
    });
  });

  describe('canCommunicate', () => {
    it('should allow human to communicate with anyone', async () => {
      const canCommunicate = await messageService.canCommunicate(senderId, recipientId);
      expect(canCommunicate).toBe(true);
    });

    it('should allow agent to communicate with human', async () => {
      await UserModel.findByIdAndUpdate(senderId, { type: 'agent' });

      const canCommunicate = await messageService.canCommunicate(senderId, recipientId);
      expect(canCommunicate).toBe(true);
    });

    it('should allow agent to communicate with agent', async () => {
      await UserModel.findByIdAndUpdate(senderId, { type: 'agent' });
      await UserModel.findByIdAndUpdate(recipientId, { type: 'agent' });

      const canCommunicate = await messageService.canCommunicate(senderId, recipientId);
      expect(canCommunicate).toBe(true);
    });

    it('should return false if sender not found', async () => {
      const canCommunicate = await messageService.canCommunicate(
        'nonexistent-id',
        recipientId
      );
      expect(canCommunicate).toBe(false);
    });

    it('should return false if recipient not found', async () => {
      const canCommunicate = await messageService.canCommunicate(
        senderId,
        'nonexistent-id'
      );
      expect(canCommunicate).toBe(false);
    });
  });
});
