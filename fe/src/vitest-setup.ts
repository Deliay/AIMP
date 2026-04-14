import { vi } from 'vitest'

globalThis.__API_HTTP__ = '';

globalThis.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
} as unknown as Storage

Object.defineProperty(globalThis, 'sessionStorage', { value: globalThis.sessionStorage })
