import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.fn()
const mockGet = vi.fn()
const mockDelete = vi.fn()
const mockJson = vi.fn()

vi.mock('../client', () => ({
  client: {
    post: mockPost,
    get: mockGet,
    delete: mockDelete,
  },
}))

describe('api/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPost.mockReturnValue({ json: mockJson })
    mockGet.mockReturnValue({ json: mockJson })
    mockDelete.mockReturnValue({ json: mockJson })
  })

  describe('authApi.register', () => {
    it('should call client.post with correct path and data', async () => {
      const { authApi } = await import('../auth')
      const registerData = { email: 'test@example.com', password: 'password123' }
      const expectedResponse = { userId: '123', apiKey: 'ak_test' }
      mockJson.mockResolvedValue(expectedResponse)

      const result = await authApi.register(registerData)

      expect(mockPost).toHaveBeenCalledWith('auth/register', { json: registerData })
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('authApi.login', () => {
    it('should call client.post with correct path and data', async () => {
      const { authApi } = await import('../auth')
      const loginData = { email: 'test@example.com', password: 'password123' }
      const expectedResponse = { token: 'token123', userId: '123' }
      mockJson.mockResolvedValue(expectedResponse)

      const result = await authApi.login(loginData)

      expect(mockPost).toHaveBeenCalledWith('auth/login', { json: loginData })
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('authApi.refreshSession', () => {
    it('should call client.post with correct path', async () => {
      const { authApi } = await import('../auth')
      const expectedResponse = { token: 'newtoken', userId: '123', expiresAt: '2025-01-01' }
      mockJson.mockResolvedValue(expectedResponse)

      const result = await authApi.refreshSession()

      expect(mockPost).toHaveBeenCalledWith('auth/session')
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('authApi.logout', () => {
    it('should call client.delete with correct path', async () => {
      const { authApi } = await import('../auth')
      mockJson.mockResolvedValue(undefined)

      await authApi.logout()

      expect(mockDelete).toHaveBeenCalledWith('auth/session')
    })
  })

  describe('authApi.getCurrentUser', () => {
    it('should call client.get with correct path', async () => {
      const { authApi } = await import('../auth')
      const expectedResponse = { id: '123', email: 'test@example.com', type: 'HUMAN' as const }
      mockJson.mockResolvedValue(expectedResponse)

      const result = await authApi.getCurrentUser()

      expect(mockGet).toHaveBeenCalledWith('auth/me')
      expect(result).toEqual(expectedResponse)
    })
  })
})
