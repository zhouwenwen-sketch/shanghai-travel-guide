import { AnalyticsService } from './analytics.service'

const event = {
  eventId: '550e8400-e29b-41d4-a716-446655440000',
  visitorId: '550e8400-e29b-41d4-a716-446655440001',
  sessionId: '550e8400-e29b-41d4-a716-446655440002',
}

describe('AnalyticsService home view recording', () => {
  it.each([
    ['2026-09-26T15:59:59.999Z', '2026-09-26T00:00:00.000Z'],
    ['2026-09-26T16:00:00.000Z', '2026-09-27T00:00:00.000Z'],
  ])('uses one server time at the Shanghai date boundary: %s', async (instant, expectedDate) => {
    const now = new Date(instant)
    const db = { home_page_views: { create: jest.fn().mockResolvedValue({}), findUnique: jest.fn() } }
    const clock = {
      now: jest.fn().mockReturnValue(now),
      dateInShanghai: jest.fn((at: Date) => new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(at)}T00:00:00.000Z`)),
    }
    const service = new AnalyticsService(db as never, clock as never)

    await expect(service.recordHomeView(event)).resolves.toEqual({ accepted: true })

    expect(clock.now).toHaveBeenCalledTimes(1)
    expect(clock.dateInShanghai).toHaveBeenCalledWith(now)
    expect(db.home_page_views.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      event_id: event.eventId,
      visitor_id: event.visitorId,
      session_id: event.sessionId,
      occurred_at: now,
      visit_date: new Date(expectedDate),
    }) })
  })

  it('treats a duplicate event id as a successful idempotent replay', async () => {
    const duplicate = Object.assign(new Error('duplicate'), { code: 'P2002' })
    const db = { home_page_views: { create: jest.fn().mockRejectedValue(duplicate), findUnique: jest.fn().mockResolvedValue({ id: 1n }) } }
    const clock = { now: jest.fn().mockReturnValue(new Date('2026-09-26T00:00:00Z')), dateInShanghai: jest.fn().mockReturnValue(new Date('2026-09-26T00:00:00Z')) }
    const service = new AnalyticsService(db as never, clock as never)
    await expect(service.recordHomeView(event)).resolves.toEqual({ accepted: true })
  })

  it('keeps concurrent duplicate submissions successful while the unique key keeps one row', async () => {
    const stored = new Set<string>()
    const db = { home_page_views: { create: jest.fn(async ({ data }: { data: { event_id: string } }) => {
      await Promise.resolve()
      if (stored.has(data.event_id)) throw Object.assign(new Error('duplicate'), { code: 'P2002' })
      stored.add(data.event_id)
      return data
    }), findUnique: jest.fn(({ where }: { where: { event_id: string } }) => Promise.resolve(stored.has(where.event_id) ? { id: 1n } : null)) } }
    const clock = { now: jest.fn().mockReturnValue(new Date('2026-09-26T00:00:00Z')), dateInShanghai: jest.fn().mockReturnValue(new Date('2026-09-26T00:00:00Z')) }
    const service = new AnalyticsService(db as never, clock as never)

    await expect(Promise.all([service.recordHomeView(event), service.recordHomeView(event)])).resolves.toEqual([
      { accepted: true }, { accepted: true },
    ])
    expect(stored).toEqual(new Set([event.eventId]))
  })

  it('rethrows a P2002 that is not confirmed as this event id', async () => {
    const conflict = Object.assign(new Error('other unique conflict'), { code: 'P2002' })
    const db = { home_page_views: { create: jest.fn().mockRejectedValue(conflict), findUnique: jest.fn().mockResolvedValue(null) } }
    const clock = { now: jest.fn().mockReturnValue(new Date()), dateInShanghai: jest.fn().mockReturnValue(new Date('2026-09-26T00:00:00Z')) }
    const service = new AnalyticsService(db as never, clock as never)
    await expect(service.recordHomeView(event)).rejects.toBe(conflict)
  })

  it('does not hide database failures unrelated to idempotency', async () => {
    const db = { home_page_views: { create: jest.fn().mockRejectedValue(new Error('database unavailable')), findUnique: jest.fn() } }
    const clock = { now: jest.fn().mockReturnValue(new Date()), dateInShanghai: jest.fn().mockReturnValue(new Date('2026-09-26T00:00:00Z')) }
    const service = new AnalyticsService(db as never, clock as never)
    await expect(service.recordHomeView(event)).rejects.toThrow('database unavailable')
  })
})
