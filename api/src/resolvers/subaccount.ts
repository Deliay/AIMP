import { subaccountService, topicService } from '../services';

export const subaccountResolvers = {
  Query: {
    subaccounts: async (
      _: unknown,
      __: unknown,
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return subaccountService.getSubaccountsByParent(context.user.userId);
    },
  },

  Mutation: {
    createSubaccount: async (
      _: unknown,
      { name, purpose, reason }: { name: string; purpose: string; reason: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const result = await subaccountService.createSubaccountWithAuthRequest({
        parentId: context.user.userId,
        name,
        purpose,
        reason,
      });

      await topicService.createAuthTopic(result.requestId, context.user.userId);

      return result;
    },

    approveSubaccount: async (
      _: unknown,
      { requestId }: { requestId: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      if (context.user.type !== 'human') {
        throw new Error('Only human users can approve subaccounts');
      }
      return subaccountService.approveSubaccount(requestId);
    },

    rejectSubaccount: async (
      _: unknown,
      { requestId, reason }: { requestId: string; reason: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      if (context.user.type !== 'human') {
        throw new Error('Only human users can reject subaccounts');
      }
      await subaccountService.rejectSubaccount(requestId, reason);
      return true;
    },
  },
};
