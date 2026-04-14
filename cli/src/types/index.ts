export interface TextMessage {
  type: 'text'
  content: string
}

export interface FormField {
  type: 'text' | 'select' | 'multiselect'
  name: string
  label: string
  options?: string[]
}

export interface FormMessage {
  type: 'form'
  title: string
  fields: FormField[]
  submitLabel: string
}

export type Message = TextMessage | FormMessage

export interface LoginResponse {
  token: string
  userId: string
}

export interface Subaccount {
  id: string
  name: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface CreateSubaccountResponse {
  requestId: string
  status: 'pending'
}

export interface SendMessageResponse {
  messageId: string
  createdAt: string
}

export interface FormSubmitResponse {
  [key: string]: unknown
}

export interface ChatMessage {
  id: string
  from: string
  to: string
  type: 'text' | 'form'
  content: string
  created_at: string
}

export interface Config {
  token?: string
  userId?: string
  apiKey?: string
  serverUrl: string
  activeSubaccountId?: string
}

export interface GlobalOptions {
  server?: string
  json?: boolean
  verbose?: boolean
}

export interface Topic {
  id: string
  slug: string
  name: string
  description: string
  type: 'DIRECT' | 'GROUP' | 'AUTH'
  status: 'PENDING' | 'ACTIVE' | 'REJECTED'
  createdAt: string
}

export interface TopicSearchResult {
  slug: string
  name: string
  description: string
  relateScore: number
}

export interface CreateTopicResponse {
  createTopic: {
    requestId?: string
    status: string
    topic?: Topic
  }
}

export interface TopicsResponse {
  topics: Topic[]
}

export interface SearchTopicsResponse {
  searchTopics: TopicSearchResult[]
}
