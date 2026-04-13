import { client, graphqlClient } from './client';
import type { LoginPayload, RegisterPayload, User, GraphQLResponse } from '../types/api';

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterPayload> => {
    const response = await client.post('auth/register', { json: data });
    return response.json();
  },

  login: async (data: LoginRequest): Promise<LoginPayload> => {
    const response = await client.post('auth/login', { json: data });
    return response.json();
  },

  refreshSession: async (): Promise<{ token: string; userId: string; expiresAt: string }> => {
    const response = await client.post('auth/session');
    return response.json();
  },

  logout: async (): Promise<void> => {
    await client.delete('auth/session');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await client.get('auth/me');
    return response.json();
  },

  getCurrentUserFull: async (): Promise<User> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `query { me { id email type description apiKey createdAt updatedAt } }`,
      },
    });
    const data: GraphQLResponse<{ me: User }> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    if (!data.data?.me) {
      throw new Error('Not authenticated');
    }
    return data.data.me;
  },

  regenerateApiKey: async (): Promise<{ apiKey: string }> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation { regenerateApiKey { apiKey } }`,
      },
    });
    const data: GraphQLResponse<{ regenerateApiKey: { apiKey: string } }> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.regenerateApiKey;
  },
};
