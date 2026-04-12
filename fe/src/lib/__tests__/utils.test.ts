import { describe, it, expect } from 'vitest'

describe('lib/utils', () => {
  describe('cn', () => {
    it('should be a function', async () => {
      const { cn } = await import('../utils')
      expect(typeof cn).toBe('function')
    })

    it('should handle string inputs', async () => {
      const { cn } = await import('../utils')
      const result = cn('class1', 'class2')
      expect(typeof result).toBe('string')
    })

    it('should handle falsy values', async () => {
      const { cn } = await import('../utils')
      const result = cn('class1', false, null, undefined, 'class2')
      expect(typeof result).toBe('string')
    })
  })
})
