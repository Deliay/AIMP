export const API_BASE_URL = '/api';
export const GRAPHQL_URL = '/graphql';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  CHATS: '/chats',
  CHAT_DETAIL: '/chats/:topicId',
  AUTH_REQUESTS: '/auth-requests',
} as const;
