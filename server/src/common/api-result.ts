export interface ApiResult<T> {
  code: number
  message: string
  data: T | null
  traceId?: string
  timestamp: string
}

export function ok<T>(data: T | null = null, traceId?: string): ApiResult<T> {
  return { code: 200, message: 'success', data, traceId, timestamp: new Date().toISOString() }
}
