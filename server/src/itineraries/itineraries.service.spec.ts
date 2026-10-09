import { BadRequestException, ConflictException } from '@nestjs/common'
import { ItinerariesService, validatePlan } from './itineraries.service'

describe('itinerary date boundaries', () => {
  it('allows one through thirty-one calendar days inclusively', () => {
    expect(() => validatePlan({ title: '一天', startDate: '2026-10-01', endDate: '2026-10-01' })).not.toThrow()
    expect(() => validatePlan({ title: '三十一天', startDate: '2026-10-01', endDate: '2026-10-31' })).not.toThrow()
  })

  it('rejects reversed, invalid, and thirty-two-day ranges', () => {
    expect(() => validatePlan({ title: '反向', startDate: '2026-10-02', endDate: '2026-10-01' })).toThrow(BadRequestException)
    expect(() => validatePlan({ title: '日期', startDate: '2026-02-30', endDate: '2026-03-01' })).toThrow(BadRequestException)
    expect(() => validatePlan({ title: '超长', startDate: '2026-10-01', endDate: '2026-11-01' })).toThrow('单个行程最多31天')
  })
})

describe('itinerary input regressions', () => {
  const planInput = { title: '一天', startDate: '2026-10-01', endDate: '2026-10-01' }
  const itemInput = { title: '散步', itemDate: '2026-10-01', type: 'NOTE', sortOrder: 0, startTime: '09:00', endTime: '10:00:00' }
  let db: any
  let old: any
  beforeEach(() => {
    old = { id: 1n, version: 0n, title: '一天', start_date: new Date('2026-10-01'), end_date: new Date('2026-10-01'), created_at: new Date(), updated_at: new Date(), itinerary_items: [] }
    db = { itineraries: { findFirst: jest.fn().mockResolvedValue(old), create: jest.fn().mockResolvedValue(old), updateMany: jest.fn(async () => { old.version++; return { count: 1 } }) }, itinerary_items: { create: jest.fn() }, $transaction: jest.fn(async action => action(db)) }
  })

  it('keeps normal creation and mixed-format positive-duration items working', async () => {
    const service = new ItinerariesService(db)
    expect((await service.create(7n, planInput)).title).toBe('一天')
    expect((await service.addItem(7n, 1, '0', itemInput)).version).toBe(1)
    expect(db.itinerary_items.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ start_time: new Date('1970-01-01T09:00:00Z'), end_time: new Date('1970-01-01T10:00:00Z') }) }))
  })

  it('accepts the last second of a day and rejects a repeated operation using the old version', async () => {
    const service = new ItinerariesService(db)
    await service.addItem(7n, 1, '0', { ...itemInput, startTime: '23:59', endTime: '23:59:59' })
    await expect(service.addItem(7n, 1, '0', itemInput)).rejects.toBeInstanceOf(ConflictException)
    expect(old.version).toBe(1n)
    expect(db.itinerary_items.create).toHaveBeenCalledTimes(1)
  })

  it.each(['2026-13-01', '2026-00-01', '2026-02-30', '0999-12-31'])('rejects invalid or unsupported dates as 400 before writing: %s', async startDate => {
    await expect(new ItinerariesService(db).create(7n, { ...planInput, startDate })).rejects.toBeInstanceOf(BadRequestException)
    expect(db.itineraries.create).not.toHaveBeenCalled()
  })

  it.each([
    ['25:00', '26:00'], ['12:60', '13:00'], ['09:00:60', '10:00'],
    ['09:00', '09:00:00'], ['09:00:00', '09:00'], ['10:00', '09:00'], ['09:00', undefined],
  ])('rejects invalid or zero-duration times without changing the parent: %s - %s', async (startTime, endTime) => {
    const service = new ItinerariesService(db)
    for (let i = 0; i < 2; i++) await expect(service.addItem(7n, 1, '0', { ...itemInput, startTime, endTime })).rejects.toBeInstanceOf(BadRequestException)
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(old.version).toBe(0n)
    expect(db.itinerary_items.create).not.toHaveBeenCalled()
  })

  it('rejects blank plan and item titles without any write', async () => {
    const service = new ItinerariesService(db)
    await expect(service.create(7n, { ...planInput, title: '   ' })).rejects.toBeInstanceOf(BadRequestException)
    await expect(service.addItem(7n, 1, '0', { ...itemInput, title: '   ' })).rejects.toBeInstanceOf(BadRequestException)
    expect(db.itineraries.create).not.toHaveBeenCalled()
    expect(db.$transaction).not.toHaveBeenCalled()
  })
})
