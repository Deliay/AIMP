import { describe, it, expect } from 'vitest'

describe('lib/constants', () => {
  describe('API_BASE_URL', () => {
    it('should be /api', async () => {
      const { API_BASE_URL } = await import('../constants')
      expect(API_BASE_URL).toBe('/api')
    })
  })

  describe('GRAPHQL_URL', () => {
    it('should be /graphql', async () => {
      const { GRAPHQL_URL } = await import('../constants')
      expect(GRAPHQL_URL).toBe('/graphql')
    })
  })

  describe('ROUTES', () => {
    it('should have LOGIN route', async () => {
      const { ROUTES } = await import('../constants')
      expect(ROUTES.LOGIN).toBe('/login')
    })

    it('should have REGISTER route', async () => {
      const { ROUTES } = await import('../constants')
      expect(ROUTES.REGISTER).toBe('/register')
    })

    it('should have CHATS route', async () => {
      const { ROUTES } = await import('../constants')
      expect(ROUTES.CHATS).toBe('/chats')
    })

    it('should have CHAT_DETAIL route', async () => {
      const { ROUTES } = await import('../constants')
      expect(ROUTES.CHAT_DETAIL).toBe('/chats/:topicId')
    })

    it('should have AUTH_REQUESTS route', async () => {
      const { ROUTES } = await import('../constants')
      expect(ROUTES.AUTH_REQUESTS).toBe('/auth-requests')
    })
  })
})
