import type {
  TextMessage,
  FormMessage,
  FormField,
  Message,
  LoginResponse,
  Subaccount,
  CreateSubaccountResponse,
  SendMessageResponse,
  FormSubmitResponse,
  ChatMessage,
  Config,
  GlobalOptions
} from '../types'

describe('types', () => {
  describe('TextMessage', () => {
    it('should have correct structure', () => {
      const msg: TextMessage = {
        type: 'text',
        content: 'Hello World'
      }
      expect(msg.type).toBe('text')
      expect(msg.content).toBe('Hello World')
    })
  })

  describe('FormMessage', () => {
    it('should have correct structure', () => {
      const fields: FormField[] = [
        { type: 'text', name: 'name', label: 'Name' },
        { type: 'select', name: 'env', label: 'Environment', options: ['dev', 'prod'] }
      ]
      const msg: FormMessage = {
        type: 'form',
        title: 'Configuration',
        fields,
        submitLabel: 'Submit'
      }
      expect(msg.type).toBe('form')
      expect(msg.title).toBe('Configuration')
      expect(msg.fields).toHaveLength(2)
      expect(msg.submitLabel).toBe('Submit')
    })

    it('should support multiselect field type', () => {
      const field: FormField = {
        type: 'multiselect',
        name: 'features',
        label: 'Features',
        options: ['analytics', 'monitoring']
      }
      expect(field.type).toBe('multiselect')
      expect(field.options).toEqual(['analytics', 'monitoring'])
    })
  })

  describe('Message', () => {
    it('should accept text message', () => {
      const msg: Message = {
        type: 'text',
        content: 'Test'
      }
      expect(msg.type).toBe('text')
    })

    it('should accept form message', () => {
      const msg: Message = {
        type: 'form',
        title: 'Test',
        fields: [],
        submitLabel: 'Submit'
      }
      expect(msg.type).toBe('form')
    })
  })

  describe('LoginResponse', () => {
    it('should have correct structure', () => {
      const response: LoginResponse = {
        token: 'jwt-token',
        userId: 'user-123'
      }
      expect(response.token).toBe('jwt-token')
      expect(response.userId).toBe('user-123')
    })
  })

  describe('Subaccount', () => {
    it('should support all status types', () => {
      const pending: Subaccount = {
        id: '1',
        name: 'test',
        purpose: 'testing',
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z'
      }
      expect(pending.status).toBe('pending')

      const approved: Subaccount = { ...pending, status: 'approved' }
      expect(approved.status).toBe('approved')

      const rejected: Subaccount = { ...pending, status: 'rejected' }
      expect(rejected.status).toBe('rejected')
    })
  })

  describe('CreateSubaccountResponse', () => {
    it('should have correct structure', () => {
      const response: CreateSubaccountResponse = {
        requestId: 'req-123',
        status: 'pending'
      }
      expect(response.requestId).toBe('req-123')
      expect(response.status).toBe('pending')
    })
  })

  describe('SendMessageResponse', () => {
    it('should have correct structure', () => {
      const response: SendMessageResponse = {
        messageId: 'msg-456',
        createdAt: '2024-01-01T12:00:00Z'
      }
      expect(response.messageId).toBe('msg-456')
      expect(response.createdAt).toBe('2024-01-01T12:00:00Z')
    })
  })

  describe('FormSubmitResponse', () => {
    it('should allow dynamic key-value pairs', () => {
      const response: FormSubmitResponse = {
        env: 'prod',
        features: ['analytics', 'monitoring'],
        reason: 'Production deployment'
      }
      expect(response.env).toBe('prod')
      expect(response.features).toEqual(['analytics', 'monitoring'])
      expect(response.reason).toBe('Production deployment')
    })
  })

  describe('ChatMessage', () => {
    it('should have correct structure', () => {
      const msg: ChatMessage = {
        id: 'msg-123',
        from: 'agent-1',
        to: 'agent-2',
        type: 'text',
        content: '{"type":"text","content":"Hello"}',
        created_at: '2024-01-01T00:00:00Z'
      }
      expect(msg.id).toBe('msg-123')
      expect(msg.from).toBe('agent-1')
      expect(msg.to).toBe('agent-2')
      expect(msg.type).toBe('text')
      expect(msg.content).toBe('{"type":"text","content":"Hello"}')
    })
  })

  describe('Config', () => {
    it('should have correct structure', () => {
      const cfg: Config = {
        token: 'token',
        userId: 'user',
        apiKey: 'ak_xxx',
        serverUrl: 'https://api.aimp.dev',
        activeSubaccountId: 'sub-1'
      }
      expect(cfg.serverUrl).toBe('https://api.aimp.dev')
    })

    it('should allow partial configuration', () => {
      const cfg: Config = {
        serverUrl: 'https://api.aimp.dev'
      }
      expect(cfg.serverUrl).toBe('https://api.aimp.dev')
    })
  })

  describe('GlobalOptions', () => {
    it('should have correct structure', () => {
      const opts: GlobalOptions = {
        server: 'https://custom.server.com',
        json: true,
        verbose: false
      }
      expect(opts.server).toBe('https://custom.server.com')
      expect(opts.json).toBe(true)
      expect(opts.verbose).toBe(false)
    })
  })
})
