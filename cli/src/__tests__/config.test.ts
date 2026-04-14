import { config, resolve } from '../core/config'

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

describe('config', () => {
  beforeEach(() => {
    config.clear()
  })

  describe('get', () => {
    it('should return undefined for non-existent key', () => {
      expect(config.get('token')).toBeUndefined()
    })

    it('should return value after set', () => {
      config.set('token', 'test-token')
      expect(config.get('token')).toBe('test-token')
    })
  })

  describe('set', () => {
    it('should set and get string value', () => {
      config.set('api_key', 'ak_test')
      expect(config.get('api_key')).toBe('ak_test')
    })

    it('should set and get user_id', () => {
      config.set('user_id', 'user-123')
      expect(config.get('user_id')).toBe('user-123')
    })
  })

  describe('has', () => {
    it('should return false for non-existent key', () => {
      expect(config.has('token')).toBe(false)
    })

    it('should return true after setting value', () => {
      config.set('token', 'test-token')
      expect(config.has('token')).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all values', () => {
      config.set('token', 'test-token')
      config.set('user_id', 'user-123')
      config.clear()
      expect(config.has('token')).toBe(false)
      expect(config.has('user_id')).toBe(false)
    })
  })

  describe('getAll', () => {
    it('should return empty object after clear', () => {
      config.set('token', 'test-token')
      config.clear()
      expect(config.getAll()).toEqual({})
    })
  })
})

describe('resolve', () => {
  beforeEach(() => {
    config.clear()
  })

  describe('serverUrl', () => {
    it('should return default server URL when not set', () => {
      expect(resolve.serverUrl()).toBe('https://api.aimp.dev')
    })

    it('should return option server URL when provided', () => {
      expect(resolve.serverUrl('https://custom.server.com')).toBe('https://custom.server.com')
    })

    it('should return config serverUrl when set', () => {
      config.set('serverUrl', 'https://config.server.com')
      expect(resolve.serverUrl()).toBe('https://config.server.com')
    })

    it('should prefer option over config', () => {
      config.set('serverUrl', 'https://config.server.com')
      expect(resolve.serverUrl('https://option.server.com')).toBe('https://option.server.com')
    })
  })

  describe('token', () => {
    it('should return undefined when not set', () => {
      expect(resolve.token()).toBeUndefined()
    })

    it('should return token when set', () => {
      config.set('token', 'jwt-token')
      expect(resolve.token()).toBe('jwt-token')
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when token not set', () => {
      expect(resolve.isAuthenticated()).toBe(false)
    })

    it('should return true when token is set', () => {
      config.set('token', 'jwt-token')
      expect(resolve.isAuthenticated()).toBe(true)
    })

    it('should return false when token is empty string', () => {
      config.set('token', '')
      expect(resolve.isAuthenticated()).toBe(false)
    })
  })
})
