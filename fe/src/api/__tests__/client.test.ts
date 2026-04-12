import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('ky', () => {
  const mockKy = vi.fn(() => ({
    post: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }))
  mockKy.create = vi.fn(() => ({
    post: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }))
  return { default: mockKy }
})

describe('api/client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export client and graphqlClient', async () => {
    const clientModule = await import('../client')
    expect(clientModule.client).toBeDefined()
    expect(clientModule.graphqlClient).toBeDefined()
  })
})
