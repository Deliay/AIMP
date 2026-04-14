import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.fn()
const mockJson = vi.fn()

vi.mock('../client', () => ({
  graphqlClient: {
    post: mockPost,
  },
}))

describe('api/auth-request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPost.mockReturnValue({ json: mockJson })
  })

  describe('authRequestApi.getAuthRequests', () => {
    it('should return auth requests from graphql response', async () => {
      const { authRequestApi } = await import('../auth-request')
      const mockRequests = [
        {
          id: '1',
          applicant: { id: 'u1', email: 'test@example.com', type: 'HUMAN' as const, description: null, createdAt: '', updatedAt: '' },
          agentBotName: 'Test AgentBot',
          agentBotPurpose: 'Testing',
          reason: 'Need access',
          status: 'PENDING' as const,
          rejectReason: null,
          createdAt: '',
          updatedAt: '',
        },
      ]
      mockJson.mockResolvedValue({ data: { authRequests: mockRequests } })

      const result = await authRequestApi.getAuthRequests()

      expect(mockPost).toHaveBeenCalled()
      expect(result).toEqual(mockRequests)
    })

    it('should throw error when graphql returns errors', async () => {
      const { authRequestApi } = await import('../auth-request')
      mockJson.mockResolvedValue({ errors: [{ message: 'GraphQL Error' }] })

      await expect(authRequestApi.getAuthRequests()).rejects.toThrow('GraphQL Error')
    })
  })

  describe('authRequestApi.createAgentBot', () => {
    it('should create agent_bot and return requestId and status', async () => {
      const { authRequestApi } = await import('../auth-request')
      const expectedResponse = { requestId: 'req-1', status: 'PENDING' as const }
      mockJson.mockResolvedValue({ data: { createAgentBot: expectedResponse } })

      const result = await authRequestApi.createAgentBot('name', 'purpose', 'reason')

      expect(result).toEqual(expectedResponse)
    })
  })

  describe('authRequestApi.approveRequest', () => {
    it('should approve request and return payload', async () => {
      const { authRequestApi } = await import('../auth-request')
      const expectedResponse = {
        status: 'APPROVED' as const,
        agentBot: { id: 'sa-1', parentId: 'u1', name: 'Test', purpose: 'Testing', status: 'APPROVED' as const, apiKey: 'ak_test', createdAt: '', updatedAt: '' },
      }
      mockJson.mockResolvedValue({ data: { approveAgentBot: expectedResponse } })

      const result = await authRequestApi.approveRequest('req-1')

      expect(result).toEqual(expectedResponse)
    })
  })

  describe('authRequestApi.rejectRequest', () => {
    it('should reject request and return payload', async () => {
      const { authRequestApi } = await import('../auth-request')
      const expectedResponse = { status: 'REJECTED' as const }
      mockJson.mockResolvedValue({ data: { rejectAgentBot: expectedResponse } })

      const result = await authRequestApi.rejectRequest('req-1', 'reason')

      expect(result).toEqual(expectedResponse)
    })
  })
})
