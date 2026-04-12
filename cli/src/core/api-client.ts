import axios, { AxiosInstance, AxiosError } from 'axios'
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

export class ApiClient {
  private client: AxiosInstance

  constructor(baseURL?: string, token?: string) {
    const url = baseURL || resolve.serverUrl()
    const authToken = token || resolve.token()

    this.client = axios.create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      }
    })

    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status
          let message = 'Unknown error'

          switch (status) {
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
              message = error.response.statusText || 'Unknown error'
          }

          throw new ApiError(status, message)
        }

        if (error.request) {
          throw new ApiError(0, '无法连接到服务器，请检查网络连接')
        }

        throw error
      }
    )
  }

  async get<T>(path: string): Promise<T> {
    const response = await this.client.get<T>(path)
    return response.data
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(path, data)
    return response.data
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(path, data)
    return response.data
  }

  async delete<T>(path: string): Promise<T> {
    const response = await this.client.delete<T>(path)
    return response.data
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
