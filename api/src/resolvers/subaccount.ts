import { subaccountService, topicService } from '../services';
import { AuthRequestModel } from '../models';

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
      if (context.user.type.toUpperCase() !== 'HUMAN') {
        throw new Error('Only human users can approve subaccounts');
      }

      const authRequest = await AuthRequestModel.findById(requestId);
      if (!authRequest) {
        throw new Error('Auth request not found');
      }

      if (authRequest.topicSlug) {
        const topic = await topicService.getTopicBySlug(authRequest.topicSlug);
        if (!topic) {
          throw new Error('Topic not found');
        }
        await topicService.approveTopic(topic._id.toString());
        authRequest.status = 'APPROVED';
        await authRequest.save();
        return { status: 'APPROVED', subaccount: null };
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
      if (context.user.type.toUpperCase() !== 'HUMAN') {
        throw new Error('Only human users can reject subaccounts');
      }

      const authRequest = await AuthRequestModel.findById(requestId);
      if (authRequest && authRequest.topicSlug) {
        const topic = await topicService.getTopicBySlug(authRequest.topicSlug);
        if (topic) {
          await topicService.rejectTopic(topic._id.toString());
          await topicService.deleteTopic(topic._id.toString());
        }
        authRequest.status = 'REJECTED';
        authRequest.rejectReason = reason;
        await authRequest.save();
        return true;
      }

      await subaccountService.rejectSubaccount(requestId, reason);
      return true;
    },
  },
};
