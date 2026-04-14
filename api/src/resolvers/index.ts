import { authResolvers } from './auth';
import { subaccountResolvers } from './subaccount';
import { authRequestResolvers } from './authRequest';
import { topicResolvers } from './topic';
import { messageResolvers } from './message';

const baseResolvers = {
  Query: {
    ...authResolvers.Query,
    ...subaccountResolvers.Query,
    ...authRequestResolvers.Query,
    ...topicResolvers.Query,
    ...messageResolvers.Query,
  },
  Topic: topicResolvers.Topic,
  User: authResolvers.User,
  AuthRequest: authRequestResolvers.AuthRequest,
};

const mutationResolvers = {
  ...authResolvers.Mutation,
  ...subaccountResolvers.Mutation,
  ...messageResolvers.Mutation,
};

export const resolvers = {
  ...baseResolvers,
  ...(Object.keys(mutationResolvers).length > 0 ? { Mutation: mutationResolvers } : {}),
};
