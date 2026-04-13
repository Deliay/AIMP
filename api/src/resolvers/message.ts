import { messageService } from '../services';

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
      return messageService.getMessagesByTopic(topicId, context.user.userId);
    },
  },

  Mutation: {
    sendMessage: async (
      _: unknown,
      { topicId, type, content }: { topicId: string; type: 'text' | 'form'; content: Record<string, unknown> },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return messageService.sendMessage({
        topicId,
        senderId: context.user.userId,
        type,
        content,
      });
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
