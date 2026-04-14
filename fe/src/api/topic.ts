import { graphqlClient } from './client';
import type { ClearTopicMessagesPayload, CreateTopicPayload, GraphQLResponse, Topic, TopicSearchResult } from '../types/api';

interface CreateTopicResponse {
  createTopic: CreateTopicPayload;
}

interface SearchTopicsResponse {
  searchTopics: TopicSearchResult[];
}

interface ClearTopicMessagesResponse {
  clearTopicMessages: ClearTopicMessagesPayload;
}

interface ApproveTopicResponse {
  approveTopic: Topic;
}

interface RejectTopicResponse {
  rejectTopic: boolean;
}

export const topicApi = {
  createTopic: async (
    slug: string,
    name: string,
    description: string,
    wait?: boolean
  ): Promise<CreateTopicPayload> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation CreateTopic($slug: String!, $name: String!, $description: String!, $wait: Boolean) { createTopic(slug: $slug, name: $name, description: $description, wait: $wait) { requestId status topic { id ownerId slug type name description status members { id email type description createdAt updatedAt } unreadCount createdAt updatedAt } } }`,
        variables: { slug, name, description, wait },
      },
    });
    const data: GraphQLResponse<CreateTopicResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.createTopic;
  },

  searchTopics: async (keyword: string): Promise<TopicSearchResult[]> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `query SearchTopics($keyword: String!) { searchTopics(keyword: $keyword) { slug name description relateScore } }`,
        variables: { keyword },
      },
    });
    const data: GraphQLResponse<SearchTopicsResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.searchTopics;
  },

  clearTopicMessages: async (topicId: string): Promise<ClearTopicMessagesPayload> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation ClearTopicMessages($topicId: ID!) { clearTopicMessages(topicId: $topicId) { status clearedCount } }`,
        variables: { topicId },
      },
    });
    const data: GraphQLResponse<ClearTopicMessagesResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.clearTopicMessages;
  },

  approveTopic: async (requestId: string): Promise<Topic> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation ApproveTopic($requestId: ID!) { approveTopic(requestId: $requestId) { id ownerId slug type name description status members { id email type description createdAt updatedAt } unreadCount createdAt updatedAt } }`,
        variables: { requestId },
      },
    });
    const data: GraphQLResponse<ApproveTopicResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.approveTopic;
  },

  rejectTopic: async (requestId: string, reason: string): Promise<boolean> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation RejectTopic($requestId: ID!, $reason: String!) { rejectTopic(requestId: $requestId, reason: $reason) }`,
        variables: { requestId, reason },
      },
    });
    const data: GraphQLResponse<RejectTopicResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.rejectTopic;
  },
};