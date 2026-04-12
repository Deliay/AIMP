import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'

vi.mock('../../api/chat', () => ({
  chatApi: {
    getTopics: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    markAsRead: vi.fn(),
  },
}))

describe('store/chat-store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have correct initial state', async () => {
    const { useChatStore } = await import('../chat-store')
    const state = useChatStore.getState()
    expect(state.topics).toEqual([])
    expect(state.currentTopicId).toBeNull()
    expect(state.messages).toEqual({})
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  describe('fetchTopics', () => {
    it('should fetch topics successfully', async () => {
      const { useChatStore } = await import('../chat-store')
      const { chatApi } = await import('../../api/chat')
      const mockTopics = [
        { id: '1', ownerId: 'u1', type: 'DIRECT' as const, name: 'Test', members: [], lastMessage: null, unreadCount: 1, createdAt: '', updatedAt: '' },
      ]

      vi.mocked(chatApi.getTopics).mockResolvedValue(mockTopics)

      await act(async () => {
        await useChatStore.getState().fetchTopics()
      })

      const state = useChatStore.getState()
      expect(state.topics).toEqual(mockTopics)
      expect(state.isLoading).toBe(false)
    })

    it('should set error on failure', async () => {
      const { useChatStore } = await import('../chat-store')
      const { chatApi } = await import('../../api/chat')

      vi.mocked(chatApi.getTopics).mockRejectedValue(new Error('Fetch topics failed'))

      await act(async () => {
        await useChatStore.getState().fetchTopics()
      })

      const state = useChatStore.getState()
      expect(state.error).toBeTruthy()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('fetchMessages', () => {
    it('should fetch messages for topic', async () => {
      const { useChatStore } = await import('../chat-store')
      const { chatApi } = await import('../../api/chat')
      const mockMessages = [
        { id: 'm1', topicId: '1', sender: { id: 'u1', email: null, type: 'HUMAN' as const, description: null, createdAt: '', updatedAt: '' }, type: 'TEXT' as const, content: { content: 'Hello' }, readBy: [], createdAt: '' },
      ]

      vi.mocked(chatApi.getMessages).mockResolvedValue(mockMessages)

      await act(async () => {
        await useChatStore.getState().fetchMessages('1')
      })

      const state = useChatStore.getState()
      expect(state.messages['1']).toEqual(mockMessages)
      expect(state.isLoading).toBe(false)
    })

    it('should append messages to existing topic messages', async () => {
      const { useChatStore } = await import('../chat-store')
      const { chatApi } = await import('../../api/chat')
      const existingMessage = { id: 'm1', topicId: '1', sender: { id: 'u1', email: null, type: 'HUMAN' as const, description: null, createdAt: '', updatedAt: '' }, type: 'TEXT' as const, content: { content: 'Hello' }, readBy: [], createdAt: '' }
      const newMessages = [{ id: 'm2', topicId: '1', sender: { id: 'u2', email: null, type: 'HUMAN' as const, description: null, createdAt: '', updatedAt: '' }, type: 'TEXT' as const, content: { content: 'Hi' }, readBy: [], createdAt: '' }]

      useChatStore.setState({ messages: { '1': [existingMessage] } })
      vi.mocked(chatApi.getMessages).mockResolvedValue(newMessages)

      await act(async () => {
        await useChatStore.getState().fetchMessages('1')
      })

      const state = useChatStore.getState()
      expect(state.messages['1']).toEqual(newMessages)
    })
  })

  describe('sendMessage', () => {
    it('should send message and add to state', async () => {
      const { useChatStore } = await import('../chat-store')
      const { chatApi } = await import('../../api/chat')
      const mockMessage = { id: 'm2', topicId: '1', sender: { id: 'u1', email: null, type: 'HUMAN' as const, description: null, createdAt: '', updatedAt: '' }, type: 'TEXT' as const, content: { content: 'Hello' }, readBy: [], createdAt: '' }

      vi.mocked(chatApi.sendMessage).mockResolvedValue(mockMessage)

      await act(async () => {
        await useChatStore.getState().sendMessage('1', 'TEXT', { content: 'Hello' })
      })

      const state = useChatStore.getState()
      expect(state.messages['1']).toContain(mockMessage)
    })

    it('should set error on failure', async () => {
      const { useChatStore } = await import('../chat-store')
      const { chatApi } = await import('../../api/chat')

      vi.mocked(chatApi.sendMessage).mockRejectedValue(new Error('Send failed'))

      await act(async () => {
        await expect(useChatStore.getState().sendMessage('1', 'TEXT', { content: 'Hello' })).rejects.toThrow('Send failed')
      })

      const state = useChatStore.getState()
      expect(state.error).toBeTruthy()
    })
  })

  describe('setCurrentTopic', () => {
    it('should set current topic id', async () => {
      const { useChatStore } = await import('../chat-store')

      act(() => {
        useChatStore.getState().setCurrentTopic('1')
      })

      const state = useChatStore.getState()
      expect(state.currentTopicId).toBe('1')
    })

    it('should set current topic id to null', async () => {
      const { useChatStore } = await import('../chat-store')
      useChatStore.setState({ currentTopicId: '1' })

      act(() => {
        useChatStore.getState().setCurrentTopic(null)
      })

      const state = useChatStore.getState()
      expect(state.currentTopicId).toBeNull()
    })
  })

  describe('markAsRead', () => {
    it('should mark topic as read', async () => {
      const { useChatStore } = await import('../chat-store')
      const { chatApi } = await import('../../api/chat')
      const mockTopics = [
        { id: '1', ownerId: 'u1', type: 'DIRECT' as const, name: 'Test', members: [], lastMessage: null, unreadCount: 5, createdAt: '', updatedAt: '' },
      ]

      useChatStore.setState({ topics: mockTopics })
      vi.mocked(chatApi.markAsRead).mockResolvedValue(true)

      await act(async () => {
        await useChatStore.getState().markAsRead('1')
      })

      const state = useChatStore.getState()
      expect(state.topics[0].unreadCount).toBe(0)
    })
  })
})
