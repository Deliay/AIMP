import { AuthRequestModel } from '../models';

export const authRequestResolvers = {
  Query: {
    authRequests: async (
      _: unknown,
      __: unknown,
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return AuthRequestModel.find({ applicantId: context.user.userId }).sort({
        createdAt: -1,
      });
    },

    pendingAuthRequests: async (
      _: unknown,
      __: unknown,
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      if (context.user.type !== 'human') {
        throw new Error('Only human users can view pending requests');
      }
      return AuthRequestModel.find({ status: 'pending' }).sort({ createdAt: -1 });
    },

    authRequest: async (
      _: unknown,
      { id }: { id: string },
      context: { user?: { userId: string; type: string } }
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return AuthRequestModel.findById(id);
    },
  },
};
