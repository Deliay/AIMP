import { messageService } from '../services';
import mongoose from 'mongoose';

export const messageResolvers = {
  Query: {
    messages: async (
      _: unknown,
      { topicId }: { topicId: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const topic = await messageService.getMessagesByTopic(topicId, context.user.userId);
      if (!topic) return null;
      return topic.messages.map((msg: any) => ({ _id: String(msg._id), senderId: String(msg.senderId), type: msg.type, content: msg.content, readBy: msg.readBy, createdAt: msg.createdAt, topicId: String(topic._id) }));
    },
  },

  Mutation: {
    sendMessage: async (
      _: unknown,
      { topicId, type, content }: { topicId: string; type: 'TEXT' | 'FORM'; content: Record<string, unknown> },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const topic = await messageService.sendMessage({
        topicId,
        senderId: context.user.userId,
        type,
        content,
      });
      const msgs = topic.messages as any;
      const lastMessage = msgs[msgs.length - 1];
      if (!lastMessage) {
        throw new Error('Message not found after sending');
      }
      return {
        _id: lastMessage._id,
        senderId: lastMessage.senderId,
        type: lastMessage.type,
        content: lastMessage.content,
        readBy: lastMessage.readBy,
        createdAt: lastMessage.createdAt,
        topicId: topic._id,
      };
    },

    markAsRead: async (
      _: unknown,
      { topicId }: { topicId: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return messageService.markAsRead(topicId, context.user.userId);
    },
  },
};
