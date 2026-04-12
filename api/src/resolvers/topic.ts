import { topicService } from '../services';

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

  Mutation: {
    createTopic: async (
      _: unknown,
      { type, name, members }: { type: 'direct' | 'group' | 'auth'; name: string; members?: string[] },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return topicService.createTopic({
        type,
        name,
        ownerId: context.user.userId,
        members,
      });
    },

    addMemberToTopic: async (
      _: unknown,
      { topicId, userId }: { topicId: string; userId: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const canAccess = await topicService.canAccessTopic(topicId, context.user.userId);
      if (!canAccess) {
        throw new Error('Not authorized to modify this topic');
      }

      return topicService.addMember(topicId, userId);
    },

    removeMemberFromTopic: async (
      _: unknown,
      { topicId, userId }: { topicId: string; userId: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const canAccess = await topicService.canAccessTopic(topicId, context.user.userId);
      if (!canAccess) {
        throw new Error('Not authorized to modify this topic');
      }

      return topicService.removeMember(topicId, userId);
    },
  },
};
