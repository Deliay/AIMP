import { graphqlClient } from './client';
import type { ApproveAuthRequestPayload, AuthRequest, GraphQLResponse, RejectAuthRequestPayload, AgentBotStatus } from '../types/api';

interface AuthRequestsResponse {
  authRequests: AuthRequest[];
}

interface ApproveResponse {
  approveAgentBot: ApproveAuthRequestPayload;
}

interface RejectResponse {
  rejectAgentBot: RejectAuthRequestPayload;
}

interface CreateAgentBotResponse {
  createAgentBot: { requestId: string; status: AgentBotStatus };
}

export const authRequestApi = {
  getAuthRequests: async (status?: AgentBotStatus): Promise<AuthRequest[]> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `query GetAuthRequests($status: AgentBotStatus) { authRequests(status: $status) { id applicant { id email type description createdAt updatedAt } agentBotName agentBotPurpose reason status rejectReason createdAt updatedAt } }`,
        variables: { status },
      },
    });
    const data: GraphQLResponse<AuthRequestsResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.authRequests;
  },

  createAgentBot: async (name: string, purpose: string, reason: string): Promise<{ requestId: string; status: AgentBotStatus }> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation CreateAgentBot($name: String!, $purpose: String!, $reason: String!) { createAgentBot(name: $name, purpose: $purpose, reason: $reason) { requestId status } }`,
        variables: { name, purpose, reason },
      },
    });
    const data: GraphQLResponse<CreateAgentBotResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.createAgentBot;
  },

  approveRequest: async (requestId: string): Promise<ApproveAuthRequestPayload> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation ApproveAgentBot($requestId: ID!) { approveAgentBot(requestId: $requestId) { status agentBot { id parentId name purpose status apiKey createdAt updatedAt } } }`,
        variables: { requestId },
      },
    });
    const data: GraphQLResponse<ApproveResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.approveAgentBot;
  },

  rejectRequest: async (requestId: string, reason: string): Promise<RejectAuthRequestPayload> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation RejectAgentBot($requestId: ID!, $reason: String!) { rejectAgentBot(requestId: $requestId, reason: $reason) { status } }`,
        variables: { requestId, reason },
      },
    });
    const data: GraphQLResponse<RejectResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.rejectAgentBot;
  },
};
