const mockPost = jest.fn()

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
  ...jest.requireActual('../core/api-client'),
  getApiClient: jest.fn(() => ({
    post: mockPost
  }))
}))

import { auth } from '../core/auth'
import { config } from '../core/config'
import { ApiError } from '../core/api-client'

describe('auth', () => {
  beforeEach(() => {
    config.clear()
    jest.clearAllMocks()
    mockPost.mockReset()
  })

  describe('login', () => {
    it('should login successfully and store credentials', async () => {
      const mockResponse = {
        token: 'jwt-token-123',
        userId: 'user-456'
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await auth.login('ak_test_key')

      expect(result).toEqual(mockResponse)
      expect(config.get('token')).toBe('jwt-token-123')
      expect(config.get('userId')).toBe('user-456')
      expect(config.get('apiKey')).toBe('ak_test_key')
    })

    it('should throw ApiError on authentication failure', async () => {
      mockPost.mockRejectedValue(new ApiError(401, 'Invalid API key'))

      await expect(auth.login('invalid_key')).rejects.toMatchObject({
        statusCode: 401
      })
    })
  })

  describe('logout', () => {
    it('should clear all stored credentials', () => {
      config.set('token', 'some-token')
      config.set('userId', 'some-user')
      config.set('apiKey', 'some-key')

      auth.logout()

      expect(config.get('token')).toBeUndefined()
      expect(config.get('userId')).toBeUndefined()
      expect(config.get('apiKey')).toBeUndefined()
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(auth.isAuthenticated()).toBe(false)
    })

    it('should return true when token exists', () => {
      config.set('token', 'valid-token')
      expect(auth.isAuthenticated()).toBe(true)
    })

    it('should return false when token is empty string', () => {
      config.set('token', '')
      expect(auth.isAuthenticated()).toBe(false)
    })
  })

  describe('getToken', () => {
    it('should return undefined when no token', () => {
      expect(auth.getToken()).toBeUndefined()
    })

    it('should return token when set', () => {
      config.set('token', 'my-token')
      expect(auth.getToken()).toBe('my-token')
    })
  })

  describe('getUserId', () => {
    it('should return undefined when no userId', () => {
      expect(auth.getUserId()).toBeUndefined()
    })

    it('should return userId when set', () => {
      config.set('userId', 'user-123')
      expect(auth.getUserId()).toBe('user-123')
    })
  })
})
