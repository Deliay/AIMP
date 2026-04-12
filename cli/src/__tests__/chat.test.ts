import { Command } from 'commander'

const mockPost = jest.fn()
const mockGet = jest.fn()
const processExitMock = jest.spyOn(process, 'exit').mockImplementation((() => {}) as () => never)

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: mockGet,
    post: mockPost,
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}))

jest.mock('conf', () => {
  const store = new Map<string, unknown>()
  return jest.fn().mockImplementation(() => ({
    get: (key: string) => store.get(key),
    set: (key: string, value: unknown) => store.set(key, value),
    has: (key: string) => store.has(key),
    clear: () => store.clear(),
    get store() {
      return Object.fromEntries(store)
    }
  }))
})

jest.mock('../core/api-client', () => ({
  getApiClient: jest.fn(() => ({
    post: mockPost,
    get: mockGet
  })),
  handleApiError: jest.fn()
}))

jest.mock('../core/config', () => ({
  resolve: {
    serverUrl: jest.fn(() => 'https://api.aimp.dev')
  }
}))

import { makeChatSendCommand, makeChatReceiveCommand, makeChatHistoryCommand } from '../commands/chat'
import { getApiClient } from '../core/api-client'

const mockedGetApiClient = getApiClient as jest.MockedFunction<typeof getApiClient>

describe('chat commands', () => {
  let program: Command
  let consoleLogSpy: jest.SpyInstance

  beforeEach(() => {
    program = new Command()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    jest.clearAllMocks()
    mockPost.mockReset()
    mockGet.mockReset()
    processExitMock.mockClear()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  describe('send', () => {
    it('should send text message successfully', async () => {
      mockPost.mockResolvedValue({
        message_id: 'msg-123',
        created_at: '2024-01-01T00:00:00Z'
      })
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeChatSendCommand(program)

      const content = JSON.stringify({ type: 'text', content: 'Hello' })
      await program.parseAsync([
        'node', 'test', 'send',
        '--to', 'agent-456',
        '--type', 'text',
        '--content', content
      ])

      expect(mockPost).toHaveBeenCalledWith('/api/chat/send', {
        to: 'agent-456',
        type: 'text',
        content: { type: 'text', content: 'Hello' }
      })
      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should fail on invalid JSON content', async () => {
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeChatSendCommand(program)

      await program.parseAsync([
        'node', 'test', 'send',
        '--to', 'agent-456',
        '--type', 'text',
        '--content', 'invalid-json'
      ])

      expect(processExitMock).toHaveBeenCalledWith(1)
    })
  })

  describe('receive', () => {
    it('should receive messages successfully', async () => {
      mockGet.mockResolvedValue([
        {
          id: 'msg-1',
          from: 'agent-123',
          to: 'me',
          type: 'text',
          content: '{"type":"text","content":"Hello"}',
          created_at: '2024-01-01T00:00:00Z'
        }
      ])
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeChatReceiveCommand(program)

      await program.parseAsync([
        'node', 'test', 'receive',
        '--from', 'agent-123'
      ])

      expect(mockGet).toHaveBeenCalledWith('/api/chat/receive?from=agent-123')
    })

    it('should show message when no messages', async () => {
      mockGet.mockResolvedValue([])
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeChatReceiveCommand(program)

      await program.parseAsync([
        'node', 'test', 'receive',
        '--from', 'agent-123'
      ])

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('暂无未读消息'))
    })
  })

  describe('history', () => {
    it('should get chat history successfully', async () => {
      mockGet.mockResolvedValue([
        {
          id: 'msg-1',
          from: 'agent-123',
          to: 'me',
          type: 'text',
          content: '{}',
          created_at: '2024-01-01T10:00:00Z'
        }
      ])
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeChatHistoryCommand(program)

      await program.parseAsync(['node', 'test', 'history'])

      expect(mockGet).toHaveBeenCalledWith('/api/chat/history?limit=10')
    })

    it('should respect tail option', async () => {
      mockGet.mockResolvedValue([])
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeChatHistoryCommand(program)

      await program.parseAsync(['node', 'test', 'history', '--tail', '20'])

      expect(mockGet).toHaveBeenCalledWith('/api/chat/history?limit=20')
    })

    it('should show message when no history', async () => {
      mockGet.mockResolvedValue([])
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeChatHistoryCommand(program)

      await program.parseAsync(['node', 'test', 'history'])

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('暂无聊天历史'))
    })
  })
})
