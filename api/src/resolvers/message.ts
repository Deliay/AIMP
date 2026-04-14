import { messageService, authService, agentBotService } from '../services';
import mongoose from 'mongoose';

export interface ContextUser {
  userId: string;
  type: string;
}

export interface Context {
  user?: ContextUser;
}

export const messageResolvers = {
  Query: {
    messages: async (
      _: unknown,
      { topicId }: { topicId: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const topic = await messageService.getMessagesByTopic(topicId, context.user.userId);
      if (!topic) return null;
      return topic.messages.map((msg: any) => ({ _id: String(msg._id), senderId: String(msg.senderId), senderType: msg.senderType, type: msg.type, content: msg.content, readBy: msg.readBy, createdAt: msg.createdAt, topicId: String(topic._id) }));
    },
  },

  Mutation: {
    sendMessage: async (
      _: unknown,
      { topicId, type, content }: { topicId: string; type: 'TEXT' | 'FORM'; content: Record<string, unknown> },
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const senderType = context.user.type.toLowerCase() === 'agent' ? 'agentbot' : 'user';
      const topic = await messageService.sendMessage({
        topicId,
        senderId: context.user.userId,
        senderType,
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
        senderType: lastMessage.senderType,
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
      context: Context
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const result = await messageService.markAsRead(topicId, context.user.userId);
      return result !== null;
    },
  },

  Message: {
    sender: async (message: { senderId: string; senderType: 'user' | 'agentbot' }) => {
      if (message.senderType === 'agentbot') {
        return agentBotService.getAgentBotById(message.senderId);
      }
      return authService.getUserById(message.senderId);
    },
  },
};
