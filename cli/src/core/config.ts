import Conf from 'conf'

const store = new Conf({
  projectName: 'aimp',
  defaults: {
    serverUrl: 'https://api.aimp.dev'
  }
})

export const config = {
  get(key: string): unknown {
    return store.get(key)
  },

  set(key: string, value: unknown): void {
    store.set(key, value)
  },

  has(key: string): boolean {
    return store.has(key)
  },

  clear(): void {
    store.clear()
  },

  getAll(): Record<string, unknown> {
    return store.store as Record<string, unknown>
  }
}

export const resolve = {
  serverUrl: (serverOption?: string): string => {
    return serverOption || (config.get('serverUrl') as string) || 'https://api.aimp.dev'
  },

  token: (): string | undefined => {
    return config.get('token') as string | undefined
  },

  isAuthenticated: (): boolean => {
    return !!config.get('token')
  }
}
