import { graphqlClient } from './client';
import type { GraphQLResponse, Message, Topic, MessageType } from '../types/api';

interface TopicsResponse {
  topics: Topic[];
}

interface TopicResponse {
  topic: Topic | null;
}

interface MessagesResponse {
  messages: Message[];
}

interface SendMessageResponse {
  sendMessage: Message;
}

export const chatApi = {
  getTopics: async (): Promise<Topic[]> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `query { topics { id ownerId type name unreadCount createdAt updatedAt lastMessage { id topicId sender { id email type } type content readBy createdAt } members { id email type description createdAt updatedAt } } }`,
      },
    });
    const data: GraphQLResponse<TopicsResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.topics;
  },

  getTopic: async (id: string): Promise<Topic | null> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `query GetTopic($id: ID!) { topic(id: $id) { id ownerId type name unreadCount createdAt updatedAt lastMessage { id topicId sender { id email type } type content readBy createdAt } members { id email type description createdAt updatedAt } } }`,
        variables: { id },
      },
    });
    const data: GraphQLResponse<TopicResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.topic;
  },

  getMessages: async (topicId: string, limit?: number, before?: string): Promise<Message[]> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `query GetMessages($topicId: ID!, $limit: Int, $before: DateTime) { messages(topicId: $topicId, limit: $limit, before: $before) { id topicId sender { id email type description createdAt updatedAt } type content readBy createdAt } }`,
        variables: { topicId, limit, before },
      },
    });
    const data: GraphQLResponse<MessagesResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.messages;
  },

  sendMessage: async (topicId: string, type: MessageType, content: Record<string, unknown>): Promise<Message> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation SendMessage($topicId: ID!, $type: MessageType!, $content: JSON!) { sendMessage(topicId: $topicId, type: $type, content: $content) { id topicId sender { id email type description createdAt updatedAt } type content readBy createdAt } }`,
        variables: { topicId, type, content },
      },
    });
    const data: GraphQLResponse<SendMessageResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.sendMessage;
  },

  markAsRead: async (topicId: string): Promise<boolean> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation MarkAsRead($topicId: ID!) { markAsRead(topicId: $topicId) }`,
        variables: { topicId },
      },
    });
    const data: GraphQLResponse<{ markAsRead: boolean }> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.markAsRead;
  },
};
