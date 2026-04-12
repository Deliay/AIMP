import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { resolvers } from './resolvers';
import { buildContext, Context } from './auth';
import { authRouter } from './routes';

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aimp';

const typeDefs = `
  type User {
    id: ID!
    email: String!
    apiKey: String!
    type: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type Subaccount {
    id: ID!
    parentId: ID!
    name: String!
    purpose: String!
    apiKey: String!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthRequest {
    id: ID!
    applicantId: ID!
    subaccountName: String!
    subaccountPurpose: String!
    reason: String!
    status: String!
    rejectReason: String
    createdAt: String!
    updatedAt: String!
  }

  type Message {
    id: ID!
    senderId: ID!
    type: String!
    content: String!
    readBy: [ID!]!
    createdAt: String!
  }

  type Topic {
    id: ID!
    type: String!
    name: String!
    ownerId: ID!
    members: [ID!]!
    messages: [Message!]!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    me: User
    subaccounts: [Subaccount!]!
    subaccount(id: ID!): Subaccount
    authRequests: [AuthRequest!]!
    pendingAuthRequests: [AuthRequest!]!
    authRequest(id: ID!): AuthRequest
    topics: [Topic!]!
    topic(id: ID!): Topic
    messages(topicId: ID!): Topic
    unreadCount(topicId: ID!): Int!
  }

  type Mutation {
    refreshSession: AuthPayload!
    createSubaccount(name: String!, purpose: String!, reason: String!): CreateSubaccountResponse!
    approveSubaccount(authRequestId: ID!): Subaccount!
    rejectSubaccount(authRequestId: ID!, reason: String!): Boolean!
    createTopic(type: String!, name: String!, members: [ID!]): Topic!
    addMemberToTopic(topicId: ID!, userId: ID!): Topic
    removeMemberFromTopic(topicId: ID!, userId: ID!): Topic
    sendMessage(topicId: ID!, type: String!, content: String!): Topic!
    markAsRead(topicId: ID!): Topic!
  }

  type AuthPayload {
    token: String!
  }

  type CreateSubaccountResponse {
    authRequestId: String!
    subaccountId: String!
  }
`;

async function startServer() {
  const app = express();

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const apolloServer = new ApolloServer<Context>({
    typeDefs,
    resolvers: resolvers as any,
  });

  await apolloServer.start();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRouter);

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => buildContext(req.headers as Record<string, string | undefined>),
    })
  );

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
