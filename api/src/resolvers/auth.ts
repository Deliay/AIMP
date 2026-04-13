import mongoose from 'mongoose';
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

  User: {
    id: (user: { _id: mongoose.Types.ObjectId }) => user._id.toString(),
    email: (user: { email?: string }) => user.email,
    type: (user: { type: string }) => user.type.toUpperCase(),
    description: (user: { description?: string }) => user.description,
    apiKey: (user: { apiKey?: string }) => user.apiKey,
    createdAt: (user: { createdAt: Date }) => user.createdAt.toISOString(),
    updatedAt: (user: { updatedAt: Date }) => user.updatedAt.toISOString(),
  },
};
