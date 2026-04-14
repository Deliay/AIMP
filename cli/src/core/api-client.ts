import chalk from 'chalk'
import { config, resolve } from './config'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export class ApiClient {
  private baseURL: string
  private token?: string

  constructor(baseURL?: string, token?: string) {
    this.baseURL = baseURL || resolve.serverUrl()
    this.token = token || resolve.token()
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = 'Unknown error'

      switch (response.status) {
        case 401:
          message = '认证失败，请重新登录'
          break
        case 403:
          message = '权限不足'
          break
        case 404:
          message = '资源不存在'
          break
        case 422:
          message = '参数校验失败'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = response.statusText || 'Unknown error'
      }

      throw new ApiError(response.status, message)
    }

    return response.json() as Promise<T>
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'GET',
      headers: this.getHeaders()
    })
    return this.handleResponse<T>(response)
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse<T>(response)
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse<T>(response)
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    return this.handleResponse<T>(response)
  }

  async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseURL}/graphql`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query, variables })
    })

    const result = await response.json() as GraphQLResponse<T>

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message)
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL')
    }

    return result.data
  }
}

let apiClientInstance: ApiClient | null = null

export const getApiClient = (serverUrl?: string): ApiClient => {
  if (!apiClientInstance || serverUrl) {
    apiClientInstance = new ApiClient(serverUrl)
  }
  return apiClientInstance
}

export const resetApiClient = (): void => {
  apiClientInstance = null
}

export const handleApiError = (error: unknown): void => {
  if (error instanceof ApiError) {
    console.error(chalk.red(`Error [${error.statusCode}]: ${error.message}`))
    if (error.statusCode === 401) {
      console.error(chalk.yellow('请运行 aimp login 重新登录'))
    }
  } else if (error instanceof Error) {
    console.error(chalk.red(`Error: ${error.message}`))
  }
}