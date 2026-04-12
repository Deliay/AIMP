import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.fn()
const mockJson = vi.fn()

vi.mock('../client', () => ({
  graphqlClient: {
    post: mockPost,
  },
}))

describe('api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPost.mockReturnValue({ json: mockJson })
  })

  describe('chatApi.getTopics', () => {
    it('should return topics from graphql response', async () => {
      const { chatApi } = await import('../chat')
      const mockTopics = [
        { id: '1', ownerId: 'u1', type: 'DIRECT', name: 'Test Chat', members: [], unreadCount: 0, createdAt: '', updatedAt: '' },
      ]
      mockJson.mockResolvedValue({ data: { topics: mockTopics } })

      const result = await chatApi.getTopics()

      expect(mockPost).toHaveBeenCalled()
      expect(result).toEqual(mockTopics)
    })

    it('should throw error when graphql returns errors', async () => {
      const { chatApi } = await import('../chat')
      mockJson.mockResolvedValue({ errors: [{ message: 'GraphQL Error' }] })

      await expect(chatApi.getTopics()).rejects.toThrow('GraphQL Error')
    })
  })

  describe('chatApi.getTopic', () => {
    it('should return topic by id', async () => {
      const { chatApi } = await import('../chat')
      const mockTopic = { id: '1', ownerId: 'u1', type: 'DIRECT', name: 'Test Chat', members: [], unreadCount: 0, createdAt: '', updatedAt: '' }
      mockJson.mockResolvedValue({ data: { topic: mockTopic } })

      const result = await chatApi.getTopic('1')

      expect(result).toEqual(mockTopic)
    })

    it('should return null when topic not found', async () => {
      const { chatApi } = await import('../chat')
      mockJson.mockResolvedValue({ data: { topic: null } })

      const result = await chatApi.getTopic('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('chatApi.getMessages', () => {
    it('should return messages for topic', async () => {
      const { chatApi } = await import('../chat')
      const mockMessages = [
        { id: 'm1', topicId: '1', sender: { id: 'u1', email: null, type: 'HUMAN', description: null, createdAt: '', updatedAt: '' }, type: 'TEXT' as const, content: { content: 'Hello' }, readBy: [], createdAt: '' },
      ]
      mockJson.mockResolvedValue({ data: { messages: mockMessages } })

      const result = await chatApi.getMessages('1')

      expect(result).toEqual(mockMessages)
    })
  })

  describe('chatApi.sendMessage', () => {
    it('should send message and return created message', async () => {
      const { chatApi } = await import('../chat')
      const mockMessage = { id: 'm1', topicId: '1', sender: { id: 'u1', email: null, type: 'HUMAN', description: null, createdAt: '', updatedAt: '' }, type: 'TEXT' as const, content: { content: 'Hello' }, readBy: [], createdAt: '' }
      mockJson.mockResolvedValue({ data: { sendMessage: mockMessage } })

      const result = await chatApi.sendMessage('1', 'TEXT', { content: 'Hello' })

      expect(result).toEqual(mockMessage)
    })
  })

  describe('chatApi.markAsRead', () => {
    it('should mark topic as read and return true', async () => {
      const { chatApi } = await import('../chat')
      mockJson.mockResolvedValue({ data: { markAsRead: true } })

      const result = await chatApi.markAsRead('1')

      expect(result).toBe(true)
    })
  })
})
