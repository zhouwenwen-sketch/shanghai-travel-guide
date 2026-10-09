import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { Request, Response } from 'express'
import { AppModule } from './app.module'
import { ApiExceptionFilter } from './common/api-exception.filter'
import { traceIdMiddleware } from './common/trace-id.middleware'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] })
  app.use(traceIdMiddleware)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  app.useGlobalFilters(new ApiExceptionFilter())
  const origins = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:8080').split(',').map((value) => value.trim()).filter(Boolean)
  app.enableCors({ origin: origins, credentials: false })
  app.use((request: Request, response: Response, next: () => void) => {
    response.setHeader('Cache-Control', 'no-store')
    next()
  })
  const port = Number(process.env.PORT ?? 8082)
  await app.listen(port, '127.0.0.1')
}

void bootstrap()
