import { config } from 'dotenv'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import { AnalyticsService } from '../analytics/analytics.service'
import { ClockService } from '../common/clock.service'
import { DatabaseService } from '../database/database.service'

config({ path: '.env.local', quiet: true })

async function main(): Promise<void> {
  if (process.env.DATABASE_NAME !== 'travel_node') throw new Error('Concurrent analytics check only permits DATABASE_NAME=travel_node')
  const db = new DatabaseService(new ConfigService())
  const analytics = new AnalyticsService(db, new ClockService())
  const eventId = randomUUID()
  const input = { eventId, visitorId: randomUUID(), sessionId: randomUUID() }
  let count = 0
  let passed = false
  await db.$connect()
  try {
    const results = await Promise.all(Array.from({ length: 8 }, () => analytics.recordHomeView(input)))
    count = await db.home_page_views.count({ where: { event_id: eventId } })
    if (results.some((result) => result.accepted !== true) || count !== 1) throw new Error(`Expected one row after concurrent replay, found ${count}`)
    passed = true
  } finally {
    const deleted = await db.home_page_views.deleteMany({ where: { event_id: eventId } })
    await db.$disconnect()
    console.log(JSON.stringify({ database: process.env.DATABASE_NAME, attempts: 8, rows: count, passed, cleanupDeleted: deleted.count }))
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Concurrent analytics check failed')
  process.exitCode = 1
})
