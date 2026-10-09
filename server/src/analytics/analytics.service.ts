import { Injectable } from '@nestjs/common'
import { ClockService } from '../common/clock.service'
import { DatabaseService } from '../database/database.service'
import { HomeViewDto } from './home-view.dto'
import { Prisma } from '../generated/prisma/client'

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService, private readonly clock: ClockService) {}

  async recordHomeView(event: HomeViewDto): Promise<{ accepted: true }> {
    const occurredAt = this.clock.now()
    const visitDate = this.clock.dateInShanghai(occurredAt)
    try {
      await this.db.home_page_views.create({
        data: {
          event_id: event.eventId,
          visitor_id: event.visitorId,
          session_id: event.sessionId,
          visit_date: visitDate,
          occurred_at: occurredAt,
        },
      })
    } catch (error) {
      if (!isUniqueConstraint(error)) throw error
      const existing = await this.db.home_page_views.findUnique({ where: { event_id: event.eventId }, select: { id: true } })
      if (!existing) throw error
    }
    return { accepted: true }
  }

  async homeStats(start: string, end: string) {
    const startDate = new Date(`${start}T00:00:00.000Z`)
    const endExclusive = new Date(`${end}T00:00:00.000Z`)
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1)
    const rows = await this.db.$queryRaw<Array<{ date: string; pv: bigint; uv: bigint; sessions: bigint }>>(Prisma.sql`
      SELECT DATE_FORMAT(visit_date, '%Y-%m-%d') AS date, COUNT(*) AS pv,
        COUNT(DISTINCT visitor_id) AS uv, COUNT(DISTINCT session_id) AS sessions
      FROM home_page_views
      WHERE visit_date >= ${startDate} AND visit_date < ${endExclusive}
      GROUP BY visit_date ORDER BY visit_date ASC
    `)
    const counts = new Map(rows.map((row) => [row.date, row]))
    const daily = []
    const cursor = new Date(`${start}T00:00:00.000Z`)
    const last = new Date(`${end}T00:00:00.000Z`)
    while (cursor <= last) {
      const date = cursor.toISOString().slice(0, 10)
      const row = counts.get(date)
      const item = { date, pv: Number(row?.pv ?? 0n), uv: Number(row?.uv ?? 0n), sessions: Number(row?.sessions ?? 0n) }
      if (![item.pv, item.uv, item.sessions].every(Number.isSafeInteger)) throw new RangeError('访问统计超出安全整数范围')
      daily.push(item)
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    const [summary] = await this.db.$queryRaw<Array<{ pv: bigint; uv: bigint; sessions: bigint }>>(Prisma.sql`
      SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv, COUNT(DISTINCT session_id) AS sessions
      FROM home_page_views WHERE visit_date >= ${startDate} AND visit_date < ${endExclusive}
    `)
    const totals = { pv: Number(summary?.pv ?? 0n), uv: Number(summary?.uv ?? 0n), sessions: Number(summary?.sessions ?? 0n) }
    if (!Object.values(totals).every(Number.isSafeInteger)) throw new RangeError('访问统计超出安全整数范围')
    return { summary: totals, daily }
  }
}

function isUniqueConstraint(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
}
