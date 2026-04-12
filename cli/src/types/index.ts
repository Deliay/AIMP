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
  submit_label: string
}

export type Message = TextMessage | FormMessage

export interface LoginResponse {
  token: string
  user_id: string
}

export interface Subaccount {
  id: string
  name: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface CreateSubaccountResponse {
  request_id: string
  status: 'pending'
}

export interface SendMessageResponse {
  message_id: string
  created_at: string
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
  user_id?: string
  api_key?: string
  server_url: string
  active_subaccount_id?: string
}

export interface GlobalOptions {
  server?: string
  json?: boolean
  verbose?: boolean
}
