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
  },
};
