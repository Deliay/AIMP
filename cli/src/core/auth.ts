import { config } from './config'
import { getApiClient, ApiError } from './api-client'
import { LoginResponse } from '../types'

export const auth = {
    async login(apiKey: string, serverUrl?: string): Promise<LoginResponse> {

    const client = getApiClient(serverUrl)

    try {
      const response = await client.post<LoginResponse>('/api/auth/cli-login', {
        apiKey: apiKey
      })

      config.set('token', response.token)
      config.set('userId', response.userId)
      config.set('apiKey', apiKey)
      if (serverUrl) {
        config.set('serverUrl', serverUrl)
      }

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
    return config.get('userId') as string | undefined
  }
}
