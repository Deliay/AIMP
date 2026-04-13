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
