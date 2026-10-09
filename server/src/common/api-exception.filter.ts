import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Response } from 'express'
import { AppException } from './app-exception'

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()
    const traceId = host.switchToHttp().getRequest<{ traceId?: string }>().traceId
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const app = exception instanceof AppException ? exception : undefined
    const raw = exception instanceof HttpException ? exception.getResponse() : undefined
    const message = app?.message ?? responseMessage(raw) ?? '服务器暂时无法处理请求'
    const fieldErrors = app?.fieldErrors ?? validationErrors(raw)
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) this.logger.error(exception)
    response.status(status).json({
      code: status,
      message,
      data: fieldErrors ?? null,
      traceId,
      timestamp: new Date().toISOString(),
    })
  }
}

function responseMessage(value: unknown): string | null {
  if (typeof value === 'object' && value !== null && 'message' in value) {
    const message = value.message
    return typeof message === 'string' ? message : null
  }
  return null
}

function validationErrors(value: unknown): Record<string, string> | undefined {
  if (typeof value !== 'object' || value === null || !('message' in value)) return undefined
  const messages = value.message
  if (!Array.isArray(messages)) return undefined
  return messages.reduce<Record<string, string>>((result, message, index) => {
    if (typeof message === 'string') result[`field${index}`] = message
    return result
  }, {})
}
