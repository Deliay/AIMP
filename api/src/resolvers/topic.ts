import mongoose from 'mongoose';
import { topicService, messageService } from '../services';
import { UserModel } from '../models';

export const topicResolvers = {
  Query: {
    topics: async (
      _: unknown,
      __: unknown,
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return topicService.getTopicsByUser(context.user.userId);
    },

    topic: async (
      _: unknown,
      { id }: { id: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const canAccess = await topicService.canAccessTopic(id, context.user.userId);
      if (!canAccess) {
        throw new Error('Not authorized to access this topic');
      }

      return topicService.getTopicById(id);
    },

    topicBySlug: async (
      _: unknown,
      { slug }: { slug: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const topic = await topicService.getTopicBySlug(slug);
      if (!topic) {
        return null;
      }

      const canAccess = await topicService.canAccessTopic(topic._id.toString(), context.user.userId);
      if (!canAccess) {
        throw new Error('Not authorized to access this topic');
      }

      return topic;
    },

    searchTopics: async (
      _: unknown,
      { keyword }: { keyword: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return topicService.searchTopics(keyword);
    },
  },

  Mutation: {
    createTopic: async (
      _: unknown,
      { slug, name, description, wait }: { slug: string; name: string; description: string; wait?: boolean },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const existingTopic = await topicService.getTopicBySlug(slug);
      if (existingTopic) {
        throw new Error('Topic with this slug already exists');
      }

      if (wait && context.user.type === 'AGENT') {
        const topic = await topicService.createPendingTopic({
          type: 'group',
          slug,
          name,
          description,
          ownerId: context.user.userId,
        });

        return {
          requestId: topic._id.toString(),
          status: 'PENDING',
          topic,
        };
      }

      const topic = await topicService.createTopic({
        type: 'group',
        slug,
        name,
        description,
        ownerId: context.user.userId,
      });

      return {
        requestId: null,
        status: 'ACTIVE',
        topic,
      };
    },

    approveTopic: async (
      _: unknown,
      { requestId }: { requestId: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      if (context.user.type !== 'HUMAN') {
        throw new Error('Only human users can approve topics');
      }

      const topic = await topicService.approveTopic(requestId);
      if (!topic) {
        throw new Error('Topic not found');
      }

      return topic;
    },

    rejectTopic: async (
      _: unknown,
      { requestId, reason }: { requestId: string; reason: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      if (context.user.type !== 'HUMAN') {
        throw new Error('Only human users can reject topics');
      }

      await topicService.rejectTopic(requestId);
      await topicService.deleteTopic(requestId);

      return true;
    },

    clearTopicMessages: async (
      _: unknown,
      { topicId }: { topicId: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      if (context.user.type !== 'HUMAN') {
        throw new Error('Only human users can clear topic messages');
      }

      const topic = await topicService.getTopicById(topicId);
      if (!topic) {
        throw new Error('Topic not found');
      }

      const clearedCount = await topicService.clearMessages(topicId);

      return {
        status: 'ok',
        clearedCount,
      };
    },
  },

  Topic: {
    members: async (topic: { members: mongoose.Types.ObjectId[] }) => {
      const memberIds = topic.members.map((m) => m.toString());
      return UserModel.find({ _id: { $in: memberIds } });
    },
    lastMessage: async (topic: { messages: Array<{ _id?: mongoose.Types.ObjectId; senderId: mongoose.Types.ObjectId; type: string; content: Record<string, unknown>; readBy: mongoose.Types.ObjectId[]; createdAt: Date }> }) => {
      if (!topic.messages || topic.messages.length === 0) {
        return null;
      }
      const lastMsg = topic.messages[topic.messages.length - 1];
      const sender = await UserModel.findById(lastMsg.senderId);
      return {
        id: lastMsg._id?.toString() || '',
        topicId: '',
        sender,
        type: lastMsg.type.toUpperCase(),
        content: lastMsg.content,
        readBy: lastMsg.readBy.map((r) => r.toString()),
        createdAt: lastMsg.createdAt,
      };
    },
    unreadCount: async (
      topic: { _id: mongoose.Types.ObjectId; messages: Array<{ readBy: mongoose.Types.ObjectId[] }> },
      _: unknown,
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) return 0;
      return messageService.getUnreadCount(topic._id.toString(), context.user.userId);
    },
  },
};
