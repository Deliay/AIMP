import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.fn()
const mockJson = vi.fn()

vi.mock('../client', () => ({
  graphqlClient: {
    post: mockPost,
  },
}))

describe('api/topic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPost.mockReturnValue({ json: mockJson })
  })

  describe('topicApi.createTopic', () => {
    it('should create topic and return payload', async () => {
      const { topicApi } = await import('../topic')
      const mockPayload = {
        requestId: null,
        status: 'ACTIVE' as const,
        topic: {
          id: '1',
          ownerId: 'u1',
          slug: 'test-topic',
          type: 'GROUP' as const,
          name: 'Test Topic',
          description: 'Test Description',
          status: 'ACTIVE' as const,
          members: [],
          unreadCount: 0,
          createdAt: '',
          updatedAt: '',
        },
      }
      mockJson.mockResolvedValue({ data: { createTopic: mockPayload } })

      const result = await topicApi.createTopic('test-topic', 'Test Topic', 'Test Description')

      expect(mockPost).toHaveBeenCalled()
      expect(result).toEqual(mockPayload)
    })

    it('should throw error when graphql returns errors', async () => {
      const { topicApi } = await import('../topic')
      mockJson.mockResolvedValue({ errors: [{ message: 'GraphQL Error' }] })

      await expect(topicApi.createTopic('test', 'Test', 'Desc')).rejects.toThrow('GraphQL Error')
    })
  })

  describe('topicApi.searchTopics', () => {
    it('should return search results', async () => {
      const { topicApi } = await import('../topic')
      const mockResults = [
        { slug: 'topic-1', name: 'Topic 1', description: 'Desc 1', relateScore: 0.95 },
        { slug: 'topic-2', name: 'Topic 2', description: 'Desc 2', relateScore: 0.78 },
      ]
      mockJson.mockResolvedValue({ data: { searchTopics: mockResults } })

      const result = await topicApi.searchTopics('keyword')

      expect(result).toEqual(mockResults)
    })

    it('should throw error when graphql returns errors', async () => {
      const { topicApi } = await import('../topic')
      mockJson.mockResolvedValue({ errors: [{ message: 'Search Error' }] })

      await expect(topicApi.searchTopics('keyword')).rejects.toThrow('Search Error')
    })
  })

  describe('topicApi.clearTopicMessages', () => {
    it('should clear messages and return payload', async () => {
      const { topicApi } = await import('../topic')
      const mockPayload = { status: 'ok', clearedCount: 42 }
      mockJson.mockResolvedValue({ data: { clearTopicMessages: mockPayload } })

      const result = await topicApi.clearTopicMessages('1')

      expect(result).toEqual(mockPayload)
    })

    it('should throw error when graphql returns errors', async () => {
      const { topicApi } = await import('../topic')
      mockJson.mockResolvedValue({ errors: [{ message: 'Clear Error' }] })

      await expect(topicApi.clearTopicMessages('1')).rejects.toThrow('Clear Error')
    })
  })

  describe('topicApi.approveTopic', () => {
    it('should approve topic and return topic', async () => {
      const { topicApi } = await import('../topic')
      const mockTopic = {
        id: '1',
        ownerId: 'u1',
        slug: 'test-topic',
        type: 'GROUP' as const,
        name: 'Test Topic',
        description: 'Test Description',
        status: 'ACTIVE' as const,
        members: [],
        unreadCount: 0,
        createdAt: '',
        updatedAt: '',
      }
      mockJson.mockResolvedValue({ data: { approveTopic: mockTopic } })

      const result = await topicApi.approveTopic('request-1')

      expect(result).toEqual(mockTopic)
    })

    it('should throw error when graphql returns errors', async () => {
      const { topicApi } = await import('../topic')
      mockJson.mockResolvedValue({ errors: [{ message: 'Approve Error' }] })

      await expect(topicApi.approveTopic('request-1')).rejects.toThrow('Approve Error')
    })
  })

  describe('topicApi.rejectTopic', () => {
    it('should reject topic and return true', async () => {
      const { topicApi } = await import('../topic')
      mockJson.mockResolvedValue({ data: { rejectTopic: true } })

      const result = await topicApi.rejectTopic('request-1', 'reason')

      expect(result).toBe(true)
    })

    it('should throw error when graphql returns errors', async () => {
      const { topicApi } = await import('../topic')
      mockJson.mockResolvedValue({ errors: [{ message: 'Reject Error' }] })

      await expect(topicApi.rejectTopic('request-1', 'reason')).rejects.toThrow('Reject Error')
    })
  })
})