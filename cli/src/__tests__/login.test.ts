import { Command } from 'commander'

const mockLogin = jest.fn()
const mockGetUserId = jest.fn()

jest.mock('../core/auth', () => ({
  auth: {
    login: mockLogin,
    getUserId: mockGetUserId
  }
}))

jest.mock('../core/config', () => ({
  resolve: {
    serverUrl: jest.fn(() => 'https://api.aimp.dev')
  }
}))

jest.mock('../core/api-client', () => ({
  handleApiError: jest.fn()
}))

import { makeLoginCommand } from '../commands/login'

const mockedAuth = require('../core/auth')
const mockAuth = mockedAuth.auth as { login: jest.Mock; getUserId: jest.Mock }

describe('login command', () => {
  let program: Command
  let consoleLogSpy: jest.SpyInstance

  beforeEach(() => {
    program = new Command()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    jest.clearAllMocks()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  it('should call auth.login with api-key', async () => {
    mockAuth.login.mockResolvedValue({
      token: 'test-token',
      user_id: 'user-123'
    })
    mockAuth.getUserId.mockReturnValue('user-123')

    makeLoginCommand(program)

    await program.parseAsync(['node', 'test', 'login', '--api-key', 'ak_test_key'])

    expect(mockAuth.login).toHaveBeenCalledWith('ak_test_key', 'https://api.aimp.dev')
  })

  it('should output user id on successful login', async () => {
    mockAuth.login.mockResolvedValue({
      token: 'test-token',
      user_id: 'user-123'
    })
    mockAuth.getUserId.mockReturnValue('user-123')

    makeLoginCommand(program)
    await program.parseAsync(['node', 'test', 'login', '--api-key', 'ak_test_key'])

    expect(consoleLogSpy).toHaveBeenCalled()
    expect(consoleLogSpy.mock.calls.flat().join(' ')).toContain('user-123')
  })
})
