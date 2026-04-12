import { config } from './config'
import { getApiClient, ApiError } from './api-client'
import { LoginResponse } from '../types'

export const auth = {
  async login(apiKey: string, serverUrl?: string): Promise<LoginResponse> {
    const client = getApiClient(serverUrl)

    try {
      const response = await client.post<LoginResponse>('/api/auth/login', {
        api_key: apiKey
      })

      config.set('token', response.token)
      config.set('user_id', response.user_id)
      config.set('api_key', apiKey)

      return response
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, '登录失败')
    }
  },

  logout(): void {
    config.clear()
  },

  isAuthenticated(): boolean {
    return config.has('token') && !!config.get('token')
  },

  getToken(): string | undefined {
    return config.get('token') as string | undefined
  },

  getUserId(): string | undefined {
    return config.get('user_id') as string | undefined
  }
}
