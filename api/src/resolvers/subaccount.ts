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

      await topicService.createAuthTopic(result.authRequestId, context.user.userId);

      return result;
    },

    approveSubaccount: async (
      _: unknown,
      { authRequestId }: { authRequestId: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      if (context.user.type !== 'human') {
        throw new Error('Only human users can approve subaccounts');
      }
      return subaccountService.approveSubaccount(authRequestId);
    },

    rejectSubaccount: async (
      _: unknown,
      { authRequestId, reason }: { authRequestId: string; reason: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      if (context.user.type !== 'human') {
        throw new Error('Only human users can reject subaccounts');
      }
      await subaccountService.rejectSubaccount(authRequestId, reason);
      return true;
    },
  },
};
