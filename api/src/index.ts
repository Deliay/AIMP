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
  scalar DateTime
  scalar JSON

  enum UserType {
    HUMAN
    AGENT
  }

  enum SubaccountStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum TopicType {
    DIRECT
    GROUP
    AUTH
  }

  enum MessageType {
    TEXT
    FORM
  }

  type User {
    id: ID!
    email: String
    type: UserType!
    description: String
    apiKey: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Subaccount {
    id: ID!
    parentId: ID!
    name: String!
    purpose: String!
    status: SubaccountStatus!
    apiKey: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthRequest {
    id: ID!
    applicant: User!
    subaccountName: String!
    subaccountPurpose: String!
    reason: String!
    status: SubaccountStatus!
    rejectReason: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Message {
    id: ID!
    topicId: ID!
    sender: User!
    type: MessageType!
    content: JSON!
    readBy: [ID!]!
    createdAt: DateTime!
  }

  type Topic {
    id: ID!
    ownerId: ID!
    type: TopicType!
    name: String
    members: [User!]!
    lastMessage: Message
    unreadCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    me: User
    subaccounts: [Subaccount!]!
    subaccount(id: ID!): Subaccount
    authRequests(status: SubaccountStatus): [AuthRequest!]!
    pendingAuthRequests: [AuthRequest!]!
    authRequest(id: ID!): AuthRequest
    topics: [Topic!]!
    topic(id: ID!): Topic
    messages(topicId: ID!, limit: Int, before: DateTime): [Message!]!
  }

  type Mutation {
    createSubaccount(name: String!, purpose: String!, reason: String!): CreateSubaccountPayload!
    approveSubaccount(requestId: ID!): ApproveAuthRequestPayload!
    rejectSubaccount(requestId: ID!, reason: String!): RejectAuthRequestPayload!
    sendMessage(topicId: ID!, type: MessageType!, content: JSON!): Message!
    markAsRead(topicId: ID!): Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type RegisterPayload {
    userId: ID!
    apiKey: String!
  }

  type LoginPayload {
    token: String!
    userId: ID!
  }

  type CreateSubaccountPayload {
    requestId: ID!
    status: SubaccountStatus!
  }

  type ApproveAuthRequestPayload {
    status: SubaccountStatus!
    subaccount: Subaccount!
  }

  type RejectAuthRequestPayload {
    status: SubaccountStatus!
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
