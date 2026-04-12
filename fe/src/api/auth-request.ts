import { graphqlClient } from './client';
import type { ApproveAuthRequestPayload, AuthRequest, GraphQLResponse, RejectAuthRequestPayload, SubaccountStatus } from '../types/api';

interface AuthRequestsResponse {
  authRequests: AuthRequest[];
}

interface ApproveResponse {
  approveSubaccount: ApproveAuthRequestPayload;
}

interface RejectResponse {
  rejectSubaccount: RejectAuthRequestPayload;
}

interface CreateSubaccountResponse {
  createSubaccount: { requestId: string; status: SubaccountStatus };
}

export const authRequestApi = {
  getAuthRequests: async (status?: SubaccountStatus): Promise<AuthRequest[]> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `query GetAuthRequests($status: SubaccountStatus) { authRequests(status: $status) { id applicant { id email type description createdAt updatedAt } subaccountName subaccountPurpose reason status rejectReason createdAt updatedAt } }`,
        variables: { status },
      },
    });
    const data: GraphQLResponse<AuthRequestsResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.authRequests;
  },

  createSubaccount: async (name: string, purpose: string, reason: string): Promise<{ requestId: string; status: SubaccountStatus }> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation CreateSubaccount($name: String!, $purpose: String!, $reason: String!) { createSubaccount(name: $name, purpose: $purpose, reason: $reason) { requestId status } }`,
        variables: { name, purpose, reason },
      },
    });
    const data: GraphQLResponse<CreateSubaccountResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.createSubaccount;
  },

  approveRequest: async (requestId: string): Promise<ApproveAuthRequestPayload> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation ApproveSubaccount($requestId: ID!) { approveSubaccount(requestId: $requestId) { status subaccount { id parentId name purpose status apiKey createdAt updatedAt } } }`,
        variables: { requestId },
      },
    });
    const data: GraphQLResponse<ApproveResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.approveSubaccount;
  },

  rejectRequest: async (requestId: string, reason: string): Promise<RejectAuthRequestPayload> => {
    const response = await graphqlClient.post('', {
      json: {
        query: `mutation RejectSubaccount($requestId: ID!, $reason: String!) { rejectSubaccount(requestId: $requestId, reason: $reason) { status } }`,
        variables: { requestId, reason },
      },
    });
    const data: GraphQLResponse<RejectResponse> = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0].message);
    }
    return data.data!.rejectSubaccount;
  },
};
