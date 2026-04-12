import { authResolvers } from './auth';
import { subaccountResolvers } from './subaccount';
import { authRequestResolvers } from './authRequest';
import { topicResolvers } from './topic';
import { messageResolvers } from './message';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...subaccountResolvers.Query,
    ...authRequestResolvers.Query,
    ...topicResolvers.Query,
    ...messageResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...subaccountResolvers.Mutation,
    ...topicResolvers.Mutation,
    ...messageResolvers.Mutation,
  },
};
