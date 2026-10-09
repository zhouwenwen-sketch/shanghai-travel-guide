import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from 'axios'
import type { ApiResponse } from '@/types'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly traceId?: string,
    public readonly fieldErrors?: Record<string, string>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

let getAccessToken: () => string | null = () => null
let onUnauthorized: (requestToken: string) => void = () => {}

export function configureAuth(options: {
  getAccessToken: () => string | null
  onUnauthorized: (requestToken: string) => void
}): void {
  getAccessToken = options.getAccessToken
  onUnauthorized = options.onUnauthorized
}

client.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  undefined,
  (error: unknown) => {
    if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
      if (error.response?.status === 401) {
        const requestToken = bearerToken(error.config?.headers)
        if (requestToken && requestToken === getAccessToken()) {
          onUnauthorized(requestToken)
        }
      }
      const body = error.response?.data
      if (body && typeof body.code === 'number') {
        return Promise.reject(createApiError(body))
      }
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new ApiError('请求超时，请稍后重试'))
      }
      return Promise.reject(new ApiError(error.message || '网络错误'))
    }
    return Promise.reject(error instanceof Error ? error : new ApiError('未知错误'))
  }
)

function bearerToken(headers?: AxiosRequestHeaders): string | null {
  const authorization = headers?.get('Authorization')
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return null
  const token = authorization.slice('Bearer '.length).trim()
  return token || null
}

function unwrap<T>(body: ApiResponse<T>): T {
  if (body.code !== 200) throw createApiError(body)
  return body.data as T
}

const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await client.get<ApiResponse<T>>(url, config)
    return unwrap(response.data)
  },
  async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
    const response = await client.post<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(url, data, config)
    return unwrap(response.data)
  },
  async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
    const response = await client.put<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(url, data, config)
    return unwrap(response.data)
  },
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await client.delete<ApiResponse<T>>(url, config)
    return unwrap(response.data)
  },
}

function createApiError(body: ApiResponse<unknown>): ApiError {
  const fieldErrors = isFieldErrors(body.data) ? body.data : undefined
  const detail = fieldErrors ? Object.values(fieldErrors)[0] : undefined
  return new ApiError(detail || body.message || '请求失败', body.code, body.traceId, fieldErrors)
}

function isFieldErrors(data: unknown): data is Record<string, string> {
  return Boolean(
    data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      Object.values(data).every((value) => typeof value === 'string')
  )
}

export default api
