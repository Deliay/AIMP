import { Command } from 'commander'

const mockPost = jest.fn()
const mockGet = jest.fn()

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

import { makeAgentBotCreateCommand, makeAgentBotListCommand } from '../commands/agent-bot'
import { getApiClient } from '../core/api-client'

const mockedGetApiClient = getApiClient as jest.MockedFunction<typeof getApiClient>

describe('agent-bot commands', () => {
  let program: Command
  let consoleLogSpy: jest.SpyInstance

  beforeEach(() => {
    program = new Command()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    jest.clearAllMocks()
    mockPost.mockReset()
    mockGet.mockReset()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  describe('create', () => {
    it('should create agent-bot successfully', async () => {
      mockPost.mockResolvedValue({
        request_id: 'req-123',
        status: 'pending'
      })
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeAgentBotCreateCommand(program)

      await program.parseAsync([
        'node', 'test', 'create',
        '--name', 'test-agent',
        '--purpose', 'Testing',
        '--reason', 'For testing purposes'
      ])

      expect(mockPost).toHaveBeenCalledWith('/api/agent-bots', {
        name: 'test-agent',
        purpose: 'Testing',
        reason: 'For testing purposes'
      })
      expect(consoleLogSpy).toHaveBeenCalled()
    })
  })

  describe('list', () => {
    it('should list agent-bots successfully', async () => {
      mockGet.mockResolvedValue([
        {
          id: 'sub-1',
          name: 'agent-1',
          purpose: 'Data collection',
          status: 'approved',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'sub-2',
          name: 'agent-2',
          purpose: 'Analytics',
          status: 'pending',
          created_at: '2024-01-02T00:00:00Z'
        }
      ])
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeAgentBotListCommand(program)

      await program.parseAsync(['node', 'test', 'list'])

      expect(mockGet).toHaveBeenCalledWith('/api/agent-bots')
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Agent Bot 列表'))
    })

    it('should show message when no agent-bots', async () => {
      mockGet.mockResolvedValue([])
      mockedGetApiClient.mockReturnValue({ post: mockPost, get: mockGet } as unknown as ReturnType<typeof getApiClient>)

      makeAgentBotListCommand(program)

      await program.parseAsync(['node', 'test', 'list'])

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('暂无 Agent Bot'))
    })
  })
})
