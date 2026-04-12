import { vi } from 'vitest'

global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
} as unknown as Storage

Object.defineProperty(window, 'sessionStorage', { value: global.sessionStorage })
