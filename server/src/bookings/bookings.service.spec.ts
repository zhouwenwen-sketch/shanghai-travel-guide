import { BadRequestException, ConflictException } from '@nestjs/common'
import { BookingsService, parseVersion, validateDates, validateKey } from './bookings.service'
import { Prisma } from '../generated/prisma/client'

describe('booking boundary rules', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-09-22T04:00:00.000Z')))
  afterEach(() => jest.useRealTimers())

  it('accepts supported idempotency keys and rejects blank, oversized, and unsafe keys', () => {
    expect(validateKey(' key-1._:ok ')).toBe('key-1._:ok')
    expect(() => validateKey('')).toThrow(BadRequestException)
    expect(() => validateKey('a'.repeat(65))).toThrow(BadRequestException)
    expect(() => validateKey('has space')).toThrow(BadRequestException)
  })

  it('uses Shanghai calendar dates for booking boundaries', () => {
    expect(() => validateDates('2026-09-22', '2026-09-23')).toThrow('入住日期必须晚于今天')
    expect(() => validateDates('2026-09-23', '2026-09-23')).toThrow('离店日期必须晚于入住日期')
    expect(() => validateDates('2026-02-30', '2026-03-01')).toThrow('日期格式无效')
    expect(() => validateDates('2026-09-23', '2026-09-24')).not.toThrow()
  })

  it('parses all documented If-Match variants and rejects unsafe values', () => {
    expect(parseVersion('4')).toBe(4)
    expect(parseVersion('"4"')).toBe(4)
    expect(parseVersion('W/"4"')).toBe(4)
    expect(() => parseVersion('*')).toThrow(BadRequestException)
    expect(() => parseVersion('9007199254740992')).toThrow(BadRequestException)
  })
})

describe('booking creation regressions', () => {
  const input = { hotelId: 1, checkIn: '2026-10-03', checkOut: '2026-10-05', guestCount: 1, contactName: ' 小雯 ', contactPhone: ' 13800138000 ' }
  let db: any
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-02T04:00:00Z'))
    db = {
      hotels: { findUnique: jest.fn().mockResolvedValue({ id: 1n, price: 300 }) },
      bookings: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(async ({ data }) => ({ ...data, id: 2n, version: 0n, cancelled_at: null, hotels: { name: '测试酒店', img_url: null } })),
      },
    }
  })
  afterEach(() => jest.useRealTimers())

  it('creates a normal two-night booking with the existing response fields', async () => {
    expect(await new BookingsService(db).create(7n, 'key-1', input)).toMatchObject({ id: 2, nightlyPrice: 300, totalPrice: 600, contactName: '小雯', contactPhone: '13800138000', status: 'CONFIRMED', version: 0 })
    expect(db.bookings.create).toHaveBeenCalledTimes(1)
  })

  it('replays at and after the check-in boundary, including a cancelled booking, without writing or reading a new price', async () => {
    const service = new BookingsService(db)
    await service.create(7n, 'key-1', input)
    const row = await db.bookings.create.mock.results[0].value
    db.bookings.findFirst.mockResolvedValue(row)
    jest.setSystemTime(new Date('2026-10-03T00:00:00Z'))
    expect((await service.create(7n, 'key-1', input)).id).toBe(2)
    row.status = 'CANCELLED'
    row.version = 1n
    row.cancelled_at = new Date()
    jest.setSystemTime(new Date('2026-10-06T00:00:00Z'))
    expect((await service.create(7n, 'key-1', input)).status).toBe('CANCELLED')
    await expect(service.create(7n, 'key-1', { ...input, guestCount: 2 })).rejects.toBeInstanceOf(ConflictException)
    expect(db.bookings.create).toHaveBeenCalledTimes(1)
    expect(db.hotels.findUnique).toHaveBeenCalledTimes(1)
  })

  it('still rejects an expired date when the key has never been used', async () => {
    jest.setSystemTime(new Date('2026-10-03T00:00:00Z'))
    await expect(new BookingsService(db).create(7n, 'new-key', input)).rejects.toBeInstanceOf(BadRequestException)
    expect(db.bookings.create).not.toHaveBeenCalled()
  })

  it.each(['      ', '++++++', '(---) '])('rejects meaningless phones without writes: %s', async contactPhone => {
    const service = new BookingsService(db)
    for (let i = 0; i < 2; i++) await expect(service.create(7n, 'key-1', { ...input, contactPhone })).rejects.toBeInstanceOf(BadRequestException)
    expect(db.bookings.create).not.toHaveBeenCalled()
  })

  it('accepts the largest whole-yuan total that fits Decimal(12,2) and rejects the next night', async () => {
    db.hotels.findUnique.mockResolvedValue({ id: 1n, price: 1_000_000_000 })
    const service = new BookingsService(db)
    expect((await service.create(7n, 'max', { ...input, checkOut: '2026-10-12' })).totalPrice).toBe(9_000_000_000)
    for (let i = 0; i < 2; i++) await expect(service.create(7n, 'overflow', { ...input, checkOut: '2026-10-13' })).rejects.toBeInstanceOf(BadRequestException)
    expect(db.bookings.create).toHaveBeenCalledTimes(1)
  })

  it('replays the winning booking after a concurrent unique-key collision', async () => {
    const row = { id: 2n, version: 0n, hotel_id: 1n, check_in: new Date('2026-10-03'), check_out: new Date('2026-10-05'), guest_count: 1, contact_name: '小雯', contact_phone: '13800138000', nightly_price: new Prisma.Decimal(300), total_price: new Prisma.Decimal(600), status: 'CONFIRMED', created_at: new Date(), cancelled_at: null, hotels: { name: '测试酒店', img_url: null } }
    db.bookings.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(row)
    db.bookings.create.mockRejectedValueOnce({ code: 'P2002' })
    expect((await new BookingsService(db).create(7n, 'raced', input)).id).toBe(2)
  })
})
