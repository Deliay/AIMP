import mongoose from 'mongoose';
import { authResolvers } from './auth';
import { agentBotResolvers } from './agentBot';
import { authRequestResolvers } from './authRequest';
import { topicResolvers } from './topic';
import { messageResolvers } from './message';
import { UserModel } from '../models';

const baseResolvers = {
  Query: {
    ...authResolvers.Query,
    ...agentBotResolvers.Query,
    ...authRequestResolvers.Query,
    ...topicResolvers.Query,
    ...messageResolvers.Query,
  },
  Topic: topicResolvers.Topic,
  User: authResolvers.User,
  AuthRequest: authRequestResolvers.AuthRequest,
  Message: {
    id: (message: { _id?: any }) => String(message._id || ''),
    topicId: (message: { topicId?: string }) => String(message.topicId || ''),
    sender: async (message: { senderId?: any }) => message.senderId ? UserModel.findById(message.senderId) : null,
    type: (message: { type?: string }) => String(message.type || 'TEXT').toUpperCase(),
    content: (message: { content?: any }) => message.content || {},
    readBy: (message: { readBy?: any[] }) => Array.isArray(message.readBy) ? message.readBy.map((r: any) => String(r)) : [],
    createdAt: (message: { createdAt?: Date }) => message.createdAt || new Date(),
  },
};

const mutationResolvers = {
  ...authResolvers.Mutation,
  ...agentBotResolvers.Mutation,
  ...topicResolvers.Mutation,
  ...messageResolvers.Mutation,
};

export const resolvers = {
  ...baseResolvers,
  ...(Object.keys(mutationResolvers).length > 0 ? { Mutation: mutationResolvers } : {}),
};
