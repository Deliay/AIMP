import { Command } from 'commander'

jest.mock('../core/auth', () => ({
  auth: {
    logout: jest.fn()
  }
}))

jest.mock('../core/api-client', () => ({
  resetApiClient: jest.fn()
}))

import { makeLogoutCommand } from '../commands/logout'
import { auth } from '../core/auth'
import { resetApiClient } from '../core/api-client'

const mockedAuth = auth as jest.Mocked<typeof auth>
const mockedResetApiClient = resetApiClient as jest.MockedFunction<typeof resetApiClient>

describe('logout command', () => {
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

  it('should call auth.logout', async () => {
    makeLogoutCommand(program)
    await program.parseAsync(['node', 'test', 'logout'])

    expect(mockedAuth.logout).toHaveBeenCalled()
  })

  it('should call resetApiClient', async () => {
    makeLogoutCommand(program)
    await program.parseAsync(['node', 'test', 'logout'])

    expect(mockedResetApiClient).toHaveBeenCalled()
  })

  it('should output success message', async () => {
    makeLogoutCommand(program)
    await program.parseAsync(['node', 'test', 'logout'])

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('已成功登出'))
  })
})
