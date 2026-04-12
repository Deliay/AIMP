import { topicService } from '../services/TopicService';
import { authService } from '../services/AuthService';

describe('TopicService', () => {
  let userId: string;

  beforeEach(async () => {
    const result = await authService.register({
      email: 'test@example.com',
      password: 'password123',
    });
    userId = result.userId;
  });

  describe('createTopic', () => {
    it('should create a topic with owner as member', async () => {
      const topic = await topicService.createTopic({
        type: 'direct',
        name: 'Test Topic',
        ownerId: userId,
      });

      expect(topic).toHaveProperty('_id');
      expect(topic.type).toBe('direct');
      expect(topic.name).toBe('Test Topic');
      expect(topic.ownerId.toString()).toBe(userId);
      expect(topic.members).toHaveLength(1);
      expect(topic.members[0].toString()).toBe(userId);
    });

    it('should create topic with specified members', async () => {
      const otherUserResult = await authService.register({
        email: 'other@example.com',
        password: 'password123',
      });

      const topic = await topicService.createTopic({
        type: 'group',
        name: 'Group Topic',
        ownerId: userId,
        members: [userId, otherUserResult.userId],
      });

      expect(topic.members).toHaveLength(2);
    });

    it('should create auth topic for auth request', async () => {
      const topic = await topicService.createAuthTopic('auth-request-123', userId);

      expect(topic.type).toBe('auth');
      expect(topic.name).toBe('auth-request-auth-request-123');
      expect(topic.ownerId.toString()).toBe(userId);
      expect(topic.members).toHaveLength(1);
    });
  });

  describe('getTopicById', () => {
    it('should return topic by id', async () => {
      const created = await topicService.createTopic({
        type: 'direct',
        name: 'Test Topic',
        ownerId: userId,
      });

      const topic = await topicService.getTopicById(created._id.toString());

      expect(topic).toBeTruthy();
      expect(topic?.name).toBe('Test Topic');
    });

    it('should return null for non-existent topic', async () => {
      const topic = await topicService.getTopicById('nonexistent-id');
      expect(topic).toBeNull();
    });
  });

  describe('getTopicsByUser', () => {
    it('should return topics for user', async () => {
      await topicService.createTopic({
        type: 'direct',
        name: 'Topic 1',
        ownerId: userId,
      });

      await topicService.createTopic({
        type: 'direct',
        name: 'Topic 2',
        ownerId: userId,
      });

      const topics = await topicService.getTopicsByUser(userId);
      expect(topics).toHaveLength(2);
    });

    it('should return empty array for user with no topics', async () => {
      const otherUserResult = await authService.register({
        email: 'other@example.com',
        password: 'password123',
      });

      const topics = await topicService.getTopicsByUser(otherUserResult.userId);
      expect(topics).toHaveLength(0);
    });
  });

  describe('addMember', () => {
    it('should add member to topic', async () => {
      const topic = await topicService.createTopic({
        type: 'group',
        name: 'Group Topic',
        ownerId: userId,
      });

      const otherUserResult = await authService.register({
        email: 'other@example.com',
        password: 'password123',
      });

      const updated = await topicService.addMember(
        topic._id.toString(),
        otherUserResult.userId
      );

      expect(updated?.members).toHaveLength(2);
      expect(updated?.members.some((m) => m.toString() === otherUserResult.userId)).toBe(
        true
      );
    });

    it('should not add duplicate member', async () => {
      const topic = await topicService.createTopic({
        type: 'group',
        name: 'Group Topic',
        ownerId: userId,
        members: [userId],
      });

      const updated = await topicService.addMember(topic._id.toString(), userId);

      expect(updated?.members).toHaveLength(1);
    });
  });

  describe('removeMember', () => {
    it('should remove member from topic', async () => {
      const otherUserResult = await authService.register({
        email: 'other@example.com',
        password: 'password123',
      });

      const topic = await topicService.createTopic({
        type: 'group',
        name: 'Group Topic',
        ownerId: userId,
        members: [userId, otherUserResult.userId],
      });

      const updated = await topicService.removeMember(
        topic._id.toString(),
        otherUserResult.userId
      );

      expect(updated?.members).toHaveLength(1);
      expect(updated?.members.some((m) => m.toString() === otherUserResult.userId)).toBe(
        false
      );
    });
  });

  describe('canAccessTopic', () => {
    it('should return true for member', async () => {
      const topic = await topicService.createTopic({
        type: 'direct',
        name: 'Test Topic',
        ownerId: userId,
      });

      const canAccess = await topicService.canAccessTopic(topic._id.toString(), userId);
      expect(canAccess).toBe(true);
    });

    it('should return false for non-member', async () => {
      const topic = await topicService.createTopic({
        type: 'direct',
        name: 'Test Topic',
        ownerId: userId,
      });

      const otherUserResult = await authService.register({
        email: 'other@example.com',
        password: 'password123',
      });

      const canAccess = await topicService.canAccessTopic(
        topic._id.toString(),
        otherUserResult.userId
      );
      expect(canAccess).toBe(false);
    });

    it('should return true for auth topic owner', async () => {
      const topic = await topicService.createAuthTopic('auth-123', userId);

      const canAccess = await topicService.canAccessTopic(topic._id.toString(), userId);
      expect(canAccess).toBe(true);
    });

    it('should return false for non-owner accessing auth topic', async () => {
      const topic = await topicService.createAuthTopic('auth-123', userId);

      const otherUserResult = await authService.register({
        email: 'other@example.com',
        password: 'password123',
      });

      const canAccess = await topicService.canAccessTopic(
        topic._id.toString(),
        otherUserResult.userId
      );
      expect(canAccess).toBe(false);
    });
  });
});
