const mockPost = jest.fn()

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
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
        user_id: 'user-456'
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await auth.login('ak_test_key')

      expect(result).toEqual(mockResponse)
      expect(config.get('token')).toBe('jwt-token-123')
      expect(config.get('user_id')).toBe('user-456')
      expect(config.get('api_key')).toBe('ak_test_key')
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
      config.set('user_id', 'some-user')
      config.set('api_key', 'some-key')

      auth.logout()

      expect(config.get('token')).toBeUndefined()
      expect(config.get('user_id')).toBeUndefined()
      expect(config.get('api_key')).toBeUndefined()
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
    it('should return undefined when no user_id', () => {
      expect(auth.getUserId()).toBeUndefined()
    })

    it('should return user_id when set', () => {
      config.set('user_id', 'user-123')
      expect(auth.getUserId()).toBe('user-123')
    })
  })
})
