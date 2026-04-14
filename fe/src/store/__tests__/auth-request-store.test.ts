import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'

vi.mock('../../api/auth-request', () => ({
  authRequestApi: {
    getAuthRequests: vi.fn(),
    approveRequest: vi.fn(),
    rejectRequest: vi.fn(),
    createAgentBot: vi.fn(),
  },
}))

describe('store/auth-request-store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct initial state', async () => {
    const { useAuthRequestStore } = await import('../auth-request-store')
    const state = useAuthRequestStore.getState()
    expect(state.requests).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  describe('fetchRequests', () => {
    it('should fetch requests successfully', async () => {
      const { useAuthRequestStore } = await import('../auth-request-store')
      const { authRequestApi } = await import('../../api/auth-request')
      const mockRequests = [
        {
          id: '1',
          applicant: { id: 'u1', email: 'test@example.com', type: 'HUMAN' as const, description: null, apiKey: null, createdAt: '', updatedAt: '' },
          agentBotName: 'Test',
          agentBotPurpose: 'Testing',
          reason: 'Need access',
          status: 'PENDING' as const,
          rejectReason: null,
          createdAt: '',
          updatedAt: '',
        },
      ]

      vi.mocked(authRequestApi.getAuthRequests).mockResolvedValue(mockRequests)

      await act(async () => {
        await useAuthRequestStore.getState().fetchRequests()
      })

      const state = useAuthRequestStore.getState()
      expect(state.requests).toEqual(mockRequests)
      expect(state.isLoading).toBe(false)
    })

    it('should pass status filter when provided', async () => {
      const { useAuthRequestStore } = await import('../auth-request-store')
      const { authRequestApi } = await import('../../api/auth-request')

      vi.mocked(authRequestApi.getAuthRequests).mockResolvedValue([])

      await act(async () => {
        await useAuthRequestStore.getState().fetchRequests('PENDING')
      })

      expect(authRequestApi.getAuthRequests).toHaveBeenCalledWith('PENDING')
    })

    it('should set error on failure', async () => {
      const { useAuthRequestStore } = await import('../auth-request-store')
      const { authRequestApi } = await import('../../api/auth-request')

      vi.mocked(authRequestApi.getAuthRequests).mockRejectedValue(new Error('Fetch failed'))

      await act(async () => {
        await useAuthRequestStore.getState().fetchRequests()
      })

      const state = useAuthRequestStore.getState()
      expect(state.error).toBeTruthy()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('approveRequest', () => {
    it('should approve request and update state', async () => {
      const { useAuthRequestStore } = await import('../auth-request-store')
      const { authRequestApi } = await import('../../api/auth-request')
      const mockRequests = [
        {
          id: '1',
          applicant: { id: 'u1', email: 'test@example.com', type: 'HUMAN' as const, description: null, apiKey: null, createdAt: '', updatedAt: '' },
          agentBotName: 'Test',
          agentBotPurpose: 'Testing',
          reason: 'Need access',
          status: 'PENDING' as const,
          rejectReason: null,
          createdAt: '',
          updatedAt: '',
        },
      ]

      useAuthRequestStore.setState({ requests: mockRequests })
      vi.mocked(authRequestApi.approveRequest).mockResolvedValue({ status: 'APPROVED', agentBot: { id: 'sa1', parentId: 'u1', name: 'Test', purpose: 'Testing', status: 'APPROVED', apiKey: null, createdAt: '', updatedAt: '' } })

      await act(async () => {
        await useAuthRequestStore.getState().approveRequest('1')
      })

      const state = useAuthRequestStore.getState()
      expect(state.requests[0].status).toBe('APPROVED')
    })
  })

  describe('rejectRequest', () => {
    it('should reject request and update state', async () => {
      const { useAuthRequestStore } = await import('../auth-request-store')
      const { authRequestApi } = await import('../../api/auth-request')
      const mockRequests = [
        {
          id: '1',
          applicant: { id: 'u1', email: 'test@example.com', type: 'HUMAN' as const, description: null, apiKey: null, createdAt: '', updatedAt: '' },
          agentBotName: 'Test',
          agentBotPurpose: 'Testing',
          reason: 'Need access',
          status: 'PENDING' as const,
          rejectReason: null,
          createdAt: '',
          updatedAt: '',
        },
      ]

      useAuthRequestStore.setState({ requests: mockRequests })
      vi.mocked(authRequestApi.rejectRequest).mockResolvedValue({ status: 'REJECTED' })

      await act(async () => {
        await useAuthRequestStore.getState().rejectRequest('1', 'Invalid reason')
      })

      const state = useAuthRequestStore.getState()
      expect(state.requests[0].status).toBe('REJECTED')
      expect(state.requests[0].rejectReason).toBe('Invalid reason')
    })
  })

  describe('createAgentBot', () => {
    it('should create agent_bot successfully', async () => {
      const { useAuthRequestStore } = await import('../auth-request-store')
      const { authRequestApi } = await import('../../api/auth-request')

      vi.mocked(authRequestApi.createAgentBot).mockResolvedValue({ requestId: 'req-1', status: 'PENDING' })

      await act(async () => {
        await useAuthRequestStore.getState().createAgentBot('name', 'purpose', 'reason')
      })

      expect(authRequestApi.createAgentBot).toHaveBeenCalledWith('name', 'purpose', 'reason')
    })
  })
})
