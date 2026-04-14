import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'

vi.mock('../../api/topic', () => ({
  topicApi: {
    createTopic: vi.fn(),
    searchTopics: vi.fn(),
    clearTopicMessages: vi.fn(),
    approveTopic: vi.fn(),
    rejectTopic: vi.fn(),
  },
}))

describe('store/topic-store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct initial state', async () => {
    const { useTopicStore } = await import('../topic-store')
    const state = useTopicStore.getState()
    expect(state.searchResults).toEqual([])
    expect(state.isSearching).toBe(false)
    expect(state.searchError).toBeNull()
    expect(state.createError).toBeNull()
    expect(state.clearError).toBeNull()
  })

  describe('searchTopics', () => {
    it('should search topics successfully', async () => {
      const { useTopicStore } = await import('../topic-store')
      const { topicApi } = await import('../../api/topic')
      const mockResults = [
        { slug: 'topic-1', name: 'Topic 1', description: 'Desc 1', relateScore: 0.95 },
      ]

      vi.mocked(topicApi.searchTopics).mockResolvedValue(mockResults)

      await act(async () => {
        await useTopicStore.getState().searchTopics('keyword')
      })

      const state = useTopicStore.getState()
      expect(state.searchResults).toEqual(mockResults)
      expect(state.isSearching).toBe(false)
    })

    it('should set error on failure', async () => {
      const { useTopicStore } = await import('../topic-store')
      const { topicApi } = await import('../../api/topic')

      vi.mocked(topicApi.searchTopics).mockRejectedValue(new Error('Search failed'))

      await act(async () => {
        await useTopicStore.getState().searchTopics('keyword')
      })

      const state = useTopicStore.getState()
      expect(state.searchError).toBe('Search failed')
      expect(state.isSearching).toBe(false)
    })
  })

  describe('createTopic', () => {
    it('should create topic successfully', async () => {
      const { useTopicStore } = await import('../topic-store')
      const { topicApi } = await import('../../api/topic')
      const mockPayload = {
        requestId: null,
        status: 'ACTIVE' as const,
        topic: { id: '1', ownerId: 'u1', slug: 'test', type: 'GROUP' as const, name: 'Test', description: 'desc', status: 'ACTIVE' as const, members: [], lastMessage: null, unreadCount: 0, createdAt: '', updatedAt: '' },
      }

      vi.mocked(topicApi.createTopic).mockResolvedValue(mockPayload)

      await act(async () => {
        await useTopicStore.getState().createTopic('test', 'Test', 'Description')
      })

      expect(topicApi.createTopic).toHaveBeenCalledWith('test', 'Test', 'Description', undefined)
    })

    it('should set error on failure', async () => {
      const { useTopicStore } = await import('../topic-store')
      const { topicApi } = await import('../../api/topic')

      vi.mocked(topicApi.createTopic).mockRejectedValue(new Error('Create failed'))

      await act(async () => {
        await expect(useTopicStore.getState().createTopic('test', 'Test', 'Description')).rejects.toThrow()
      })

      const state = useTopicStore.getState()
      expect(state.createError).toBe('Create failed')
    })
  })

  describe('clearTopicMessages', () => {
    it('should clear messages successfully', async () => {
      const { useTopicStore } = await import('../topic-store')
      const { topicApi } = await import('../../api/topic')
      const mockPayload = { status: 'ok', clearedCount: 42 }

      vi.mocked(topicApi.clearTopicMessages).mockResolvedValue(mockPayload)

      await act(async () => {
        await useTopicStore.getState().clearTopicMessages('1')
      })

      expect(topicApi.clearTopicMessages).toHaveBeenCalledWith('1')
    })

    it('should set error on failure', async () => {
      const { useTopicStore } = await import('../topic-store')
      const { topicApi } = await import('../../api/topic')

      vi.mocked(topicApi.clearTopicMessages).mockRejectedValue(new Error('Clear failed'))

      await act(async () => {
        await expect(useTopicStore.getState().clearTopicMessages('1')).rejects.toThrow()
      })

      const state = useTopicStore.getState()
      expect(state.clearError).toBe('Clear failed')
    })
  })

  describe('clearSearchResults', () => {
    it('should clear search results', async () => {
      const { useTopicStore } = await import('../topic-store')
      useTopicStore.setState({
        searchResults: [{ slug: 't1', name: 'T1', description: 'D1', relateScore: 0.9 }],
        searchError: 'some error',
      })

      act(() => {
        useTopicStore.getState().clearSearchResults()
      })

      const state = useTopicStore.getState()
      expect(state.searchResults).toEqual([])
      expect(state.searchError).toBeNull()
    })
  })
})