import mongoose from 'mongoose';
import { topicService, messageService } from '../services';
import { UserModel, AuthRequestModel } from '../models';

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

      if (wait) {
        const { topic, requestId } = await topicService.createPendingTopicWithAuthRequest({
          type: 'group',
          slug,
          name,
          description,
          ownerId: context.user.userId,
        });

        return {
          requestId,
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

      if (context.user.type.toUpperCase() !== 'HUMAN') {
        throw new Error('Only human users can approve topics');
      }

      const authRequest = await AuthRequestModel.findById(requestId);
      if (!authRequest) {
        throw new Error('Auth request not found');
      }

      const topic = await topicService.getTopicBySlug(authRequest.topicSlug!);
      if (!topic) {
        throw new Error('Topic not found');
      }

      await topicService.approveTopic(topic._id.toString());

      authRequest.status = 'APPROVED';
      await authRequest.save();

      return topicService.getTopicById(topic._id.toString());
    },

    rejectTopic: async (
      _: unknown,
      { requestId, reason }: { requestId: string; reason: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      if (context.user.type.toUpperCase() !== 'HUMAN') {
        throw new Error('Only human users can reject topics');
      }

      const authRequest = await AuthRequestModel.findById(requestId);
      if (authRequest && authRequest.topicSlug) {
        const topic = await topicService.getTopicBySlug(authRequest.topicSlug);
        if (topic) {
          await topicService.rejectTopic(topic._id.toString());
          await topicService.deleteTopic(topic._id.toString());
        }
      }

      if (authRequest) {
        authRequest.status = 'REJECTED';
        authRequest.rejectReason = reason;
        await authRequest.save();
      }

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

      if (context.user.type.toUpperCase() !== 'HUMAN') {
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
    id: (topic: { _id: mongoose.Types.ObjectId }) => topic._id.toString(),
    type: (topic: { type: string }) => topic.type.toUpperCase(),
    status: (topic: { status: string }) => topic.status.toUpperCase(),
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
        sender: sender || { id: 'deleted', email: 'deleted@local', type: 'UNKNOWN', description: null, createdAt: new Date(), updatedAt: new Date() },
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
