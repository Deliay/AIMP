const mockGet = jest.fn()
const mockPost = jest.fn()
const mockPut = jest.fn()
const mockDelete = jest.fn()

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
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

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockReset()
    mockPost.mockReset()
    mockPut.mockReset()
    mockDelete.mockReset()
  })

  describe('constructor', () => {
    it('should create axios instance with base URL', () => {
      const { ApiClient } = require('../core/api-client')
      const client = new ApiClient('https://api.test.com')
      expect(client).toBeDefined()
    })

    it('should include authorization header when token provided', () => {
      const { ApiClient } = require('../core/api-client')
      new ApiClient('https://api.test.com', 'test-token')
    })
  })

  describe('get', () => {
    it('should call axios get with path', async () => {
      mockGet.mockResolvedValue({ data: 'test' })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      const result = await client.get('/test')

      expect(mockGet).toHaveBeenCalledWith('/test')
      expect(result).toBe('test')
    })
  })

  describe('post', () => {
    it('should call axios post with path and data', async () => {
      mockPost.mockResolvedValue({ data: { id: '123' } })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      const result = await client.post('/test', { name: 'test' })

      expect(mockPost).toHaveBeenCalledWith('/test', { name: 'test' })
      expect(result).toEqual({ id: '123' })
    })
  })

  describe('put', () => {
    it('should call axios put with path and data', async () => {
      mockPut.mockResolvedValue({ data: { updated: true } })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      const result = await client.put('/test', { name: 'updated' })

      expect(mockPut).toHaveBeenCalledWith('/test', { name: 'updated' })
      expect(result).toEqual({ updated: true })
    })
  })

  describe('delete', () => {
    it('should call axios delete with path', async () => {
      mockDelete.mockResolvedValue({ data: { deleted: true } })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      const result = await client.delete('/test')

      expect(mockDelete).toHaveBeenCalledWith('/test')
      expect(result).toEqual({ deleted: true })
    })
  })
})

describe('ApiError', () => {
  it('should create error with status code and message', () => {
    const { ApiError } = require('../core/api-client')
    const error = new ApiError(401, 'Unauthorized')
    expect(error.statusCode).toBe(401)
    expect(error.message).toBe('Unauthorized')
    expect(error.name).toBe('ApiError')
  })
})

describe('getApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { resetApiClient } = require('../core/api-client')
    resetApiClient()
  })

  it('should return singleton instance', () => {
    const { getApiClient } = require('../core/api-client')
    const client1 = getApiClient()
    const client2 = getApiClient()
    expect(client1).toBe(client2)
  })

  it('should create new instance when serverUrl is provided', () => {
    const { getApiClient } = require('../core/api-client')
    const client1 = getApiClient()
    const client2 = getApiClient('https://new-server.com')
    expect(client1).not.toBe(client2)
  })
})

describe('resetApiClient', () => {
  it('should reset singleton instance', () => {
    const { getApiClient, resetApiClient } = require('../core/api-client')
    const client1 = getApiClient()
    resetApiClient()
    const client2 = getApiClient()
    expect(client1).not.toBe(client2)
  })
})
