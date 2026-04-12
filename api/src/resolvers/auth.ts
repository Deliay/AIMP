import { authService } from '../services';

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: { user?: { userId: string; type: string } }) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return authService.getUserById(context.user.userId);
    },
  },

  Mutation: {
    refreshSession: async (
      _: unknown,
      __: unknown,
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return authService.refreshSession(context.user.userId);
    },
  },
};
