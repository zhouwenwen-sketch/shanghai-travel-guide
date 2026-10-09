import { Controller, Get, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  async getHealth(): Promise<{ status: 'ok'; database: 'ok' }> {
    await this.database.$queryRaw`SELECT 1`
    return { status: 'ok', database: 'ok' }
  }

  @Get('bench')
  async getBenchmarkIdentity(): Promise<{ database: string; mysqlVersion: string; reservedHotels: number; heapUsedBytes: number }> {
    if (process.env.NODE_ENV !== 'benchmark') throw new NotFoundException()
    const rows = await this.database.$queryRaw<Array<{ databaseName: string; mysqlVersion: string }>>`SELECT DATABASE() AS databaseName, VERSION() AS mysqlVersion`
    if (rows[0]?.databaseName !== 'travel_bench') throw new ServiceUnavailableException('Benchmark API must use travel_bench')
    const reservedHotels = await this.database.hotels.count({ where: { id: { gte: 8_000_000_000_000n, lt: 8_000_000_050_000n } } })
    return { database: 'travel_bench', mysqlVersion: rows[0].mysqlVersion, reservedHotels, heapUsedBytes: process.memoryUsage().heapUsed }
  }
}
