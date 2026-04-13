import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { resolvers } from './resolvers';
import { buildContext, Context } from './auth';
import { authRouter } from './routes';
import path from 'path';
import fs from 'fs';

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aimp';

const typeDefs = fs.readFileSync(
  path.join(__dirname, '../../contract/aimp.schema'),
  'utf-8'
);

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
