import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

export interface TraceRequest extends Request {
  traceId?: string
}

export function traceIdMiddleware(request: TraceRequest, response: Response, next: NextFunction): void {
  const incoming = request.header('X-Request-Id')?.trim()
  request.traceId = incoming && incoming.length <= 128 ? incoming : randomUUID().replaceAll('-', '')
  response.setHeader('X-Request-Id', request.traceId)
  next()
}
