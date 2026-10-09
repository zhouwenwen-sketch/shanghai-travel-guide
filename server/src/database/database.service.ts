import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    const host = requireValue(config, 'DATABASE_HOST')
    const user = requireValue(config, 'DATABASE_USER')
    const password = requireValue(config, 'DATABASE_PASSWORD')
    const database = requireValue(config, 'DATABASE_NAME')
    const port = parsePositiveInt(config.get<string>('DATABASE_PORT') ?? '3306', 'DATABASE_PORT')
    const connectionLimit = parsePositiveInt(config.get<string>('DATABASE_CONNECTION_LIMIT') ?? '5', 'DATABASE_CONNECTION_LIMIT')
    const adapter = new PrismaMariaDb({ host, user, password, database, port, connectionLimit })
    super({ adapter })
  }

  async onModuleInit(): Promise<void> { await this.$connect() }
  async onModuleDestroy(): Promise<void> { await this.$disconnect() }
}

function requireValue(config: ConfigService, name: string): string {
  const value = config.get<string>(name)?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

function parsePositiveInt(value: string, name: string): number {
  const result = Number(value)
  if (!Number.isSafeInteger(result) || result <= 0) throw new Error(`${name} must be a positive integer`)
  return result
}
