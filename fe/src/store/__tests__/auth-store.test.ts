import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'

vi.mock('../../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

describe('store/auth-store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.getItem = vi.fn().mockReturnValue(null)
    sessionStorage.setItem = vi.fn()
    sessionStorage.removeItem = vi.fn()
  })

  it('should have correct initial state', async () => {
    const { useAuthStore } = await import('../auth-store')
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  describe('login', () => {
    it('should login successfully with email and password', async () => {
      const { useAuthStore } = await import('../auth-store')
      const { authApi } = await import('../../api/auth')
      const mockUser = { id: 'u1', email: 'test@example.com', type: 'HUMAN' as const, description: null, createdAt: '', updatedAt: '' }
      const mockResponse = { token: 'token123', userId: 'u1' }

      vi.mocked(authApi.login).mockResolvedValue(mockResponse)
      vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser)

      await act(async () => {
        await useAuthStore.getState().login('test@example.com', 'password123')
      })

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockResponse.token)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })

    it('should set error on login failure', async () => {
      const { useAuthStore } = await import('../auth-store')
      const { authApi } = await import('../../api/auth')

      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))

      await act(async () => {
        await expect(useAuthStore.getState().login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials')
      })

      const state = useAuthStore.getState()
      expect(state.error).toBe('Invalid credentials')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const { useAuthStore } = await import('../auth-store')
      const { authApi } = await import('../../api/auth')

      vi.mocked(authApi.register).mockResolvedValue({ userId: 'u1', apiKey: 'ak_test' })

      await act(async () => {
        await useAuthStore.getState().register('test@example.com', 'password123')
      })

      const state = useAuthStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should set error on register failure', async () => {
      const { useAuthStore } = await import('../auth-store')
      const { authApi } = await import('../../api/auth')

      vi.mocked(authApi.register).mockRejectedValue(new Error('Email already exists'))

      await act(async () => {
        await expect(useAuthStore.getState().register('test@example.com', 'password123')).rejects.toThrow('Email already exists')
      })

      const state = useAuthStore.getState()
      expect(state.error).toBe('Email already exists')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { useAuthStore } = await import('../auth-store')
      const { authApi } = await import('../../api/auth')

      vi.mocked(authApi.logout).mockResolvedValue(undefined)

      useAuthStore.setState({ user: { id: 'u1', email: 'test', type: 'HUMAN' as const, description: null, createdAt: '', updatedAt: '' }, token: 'token', isAuthenticated: true })

      act(() => {
        useAuthStore.getState().logout()
      })

      expect(sessionStorage.removeItem).toHaveBeenCalledWith('token')
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('checkAuth', () => {
    it('should return early when no token', async () => {
      const { useAuthStore } = await import('../auth-store')
      sessionStorage.getItem = vi.fn().mockReturnValue(null)

      await act(async () => {
        await useAuthStore.getState().checkAuth()
      })

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
    })
  })
})
