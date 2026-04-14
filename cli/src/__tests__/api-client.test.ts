const mockFetch = jest.fn()

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

global.fetch = mockFetch

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('constructor', () => {
    it('should create instance with base URL', () => {
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
    it('should call fetch get with path', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve('test')
      })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      const result = await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith('https://api.aimp.dev/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toBe('test')
    })
  })

  describe('post', () => {
    it('should call fetch post with path and data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '123' })
      })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      const result = await client.post('/test', { name: 'test' })

      expect(mockFetch).toHaveBeenCalledWith('https://api.aimp.dev/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test' })
      })
      expect(result).toEqual({ id: '123' })
    })
  })

  describe('put', () => {
    it('should call fetch put with path and data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ updated: true })
      })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      const result = await client.put('/test', { name: 'updated' })

      expect(mockFetch).toHaveBeenCalledWith('https://api.aimp.dev/test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'updated' })
      })
      expect(result).toEqual({ updated: true })
    })
  })

  describe('delete', () => {
    it('should call fetch delete with path', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ deleted: true })
      })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      const result = await client.delete('/test')

      expect(mockFetch).toHaveBeenCalledWith('https://api.aimp.dev/test', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual({ deleted: true })
    })
  })

  describe('error handling', () => {
    it('should throw ApiError for 401 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })
      const { ApiClient, ApiError } = require('../core/api-client')

      const client = new ApiClient()
      await expect(client.get('/test')).rejects.toThrow(ApiError)
    })

    it('should throw ApiError for 404 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
      const { ApiClient, ApiError } = require('../core/api-client')

      const client = new ApiClient()
      await expect(client.get('/test')).rejects.toThrow(ApiError)
    })
  })

  describe('graphql', () => {
    it('should call fetch graphql with query', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { me: { id: '1' } } })
      })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      const result = await client.graphql('{ me { id } }')

      expect(mockFetch).toHaveBeenCalledWith('https://api.aimp.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ me { id } }', variables: undefined })
      })
      expect(result).toEqual({ me: { id: '1' } })
    })

    it('should throw error when GraphQL returns errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ errors: [{ message: 'Query failed' }] })
      })
      const { ApiClient } = require('../core/api-client')

      const client = new ApiClient()
      await expect(client.graphql('{ me { id } }')).rejects.toThrow('Query failed')
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