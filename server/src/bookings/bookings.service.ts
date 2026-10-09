import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client'
import { asSafeNumber } from '../common/json-codec'
import { DatabaseService } from '../database/database.service'

type CreateRequest = { hotelId: number; checkIn: string; checkOut: string; guestCount: number; contactName: string; contactPhone: string }
const include = { hotels: { select: { id: true, name: true, img_url: true } } } as const

@Injectable()
export class BookingsService {
  constructor(private readonly db: DatabaseService) {}

  async create(userId: bigint, rawKey: string | undefined, request: CreateRequest) {
    const key = validateKey(rawKey)
    const normalized = normalize(request)
    const existing = await this.db.bookings.findFirst({ where: { user_id: userId, idempotency_key: key }, include })
    if (existing) return replay(existing, normalized)
    validateDates(normalized.checkIn, normalized.checkOut)
    const hotel = await this.db.hotels.findUnique({ where: { id: BigInt(normalized.hotelId) } })
    if (!hotel) throw new NotFoundException('酒店不存在')
    if (!hotel.price || hotel.price <= 0) throw new ConflictException('酒店价格暂不可用')
    const nights = calendarDays(normalized.checkIn, normalized.checkOut)
    const nightlyPrice = new Prisma.Decimal(hotel.price)
    const totalPrice = nightlyPrice.mul(nights)
    if (nightlyPrice.gt('9999999999.99') || totalPrice.gt('9999999999.99')) throw new BadRequestException('预订金额超出支持范围')
    try {
      const booking = await this.db.bookings.create({ data: { user_id: userId, hotel_id: hotel.id, check_in: dateValue(normalized.checkIn), check_out: dateValue(normalized.checkOut), guest_count: normalized.guestCount, contact_name: normalized.contactName, contact_phone: normalized.contactPhone, nightly_price: nightlyPrice, total_price: totalPrice, status: 'CONFIRMED', created_at: new Date(), idempotency_key: key }, include })
      return response(booking)
    } catch (error) {
      if (isUniqueConstraint(error)) {
        const raced = await this.db.bookings.findFirst({ where: { user_id: userId, idempotency_key: key }, include })
        if (raced) return replay(raced, normalized)
      }
      throw error
    }
  }

  async list(userId: bigint) { return (await this.db.bookings.findMany({ where: { user_id: userId }, include, orderBy: { created_at: 'desc' } })).map(response) }
  async get(userId: bigint, id: number) { return response(await this.requireOwned(userId, id)) }
  async cancel(userId: bigint, id: number, header: string | undefined) {
    const expected = parseVersion(header)
    const current = await this.requireOwned(userId, id)
    if (current.status === 'CANCELLED') return response(current)
    if (current.version !== BigInt(expected)) throw new ConflictException('预订记录已被更新，请刷新后重试')
    const updated = await this.db.bookings.updateMany({ where: { id: current.id, user_id: userId, version: current.version, status: 'CONFIRMED' }, data: { status: 'CANCELLED', cancelled_at: new Date(), version: { increment: 1 } } })
    if (updated.count !== 1) throw new ConflictException('预订记录已被更新，请刷新后重试')
    return this.get(userId, id)
  }
  private async requireOwned(userId: bigint, id: number) { const booking = await this.db.bookings.findFirst({ where: { id: BigInt(id), user_id: userId }, include }); if (!booking) throw new NotFoundException('预订记录不存在'); return booking }
}

export function validateKey(value: string | undefined) { const key = value?.trim(); if (!key || key.length > 64 || !/^[A-Za-z0-9._:-]+$/.test(key)) throw new BadRequestException('Idempotency-Key 格式不正确'); return key }
function normalize(request: CreateRequest): CreateRequest {
  const contactName = request.contactName.trim()
  const contactPhone = request.contactPhone.trim()
  if (!contactName || !/[0-9]/.test(contactPhone)) throw new BadRequestException('联系人和联系电话不能为空或无效')
  return { ...request, contactName, contactPhone }
}
export function validateDates(checkIn: string, checkOut: string) { if (!validDate(checkIn) || !validDate(checkOut)) throw new BadRequestException('日期格式无效'); if (checkIn <= todayInShanghai()) throw new BadRequestException('入住日期必须晚于今天'); if (checkOut <= checkIn) throw new BadRequestException('离店日期必须晚于入住日期') }
function validDate(value: string) { const date = new Date(`${value}T00:00:00Z`); return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value }
function todayInShanghai() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}
function calendarDays(from: string, to: string) { return Math.round((dateValue(to).valueOf() - dateValue(from).valueOf()) / 86_400_000) }
function dateValue(value: string) { return new Date(`${value}T00:00:00.000Z`) }
export function parseVersion(value: string | undefined) { const match = value?.trim().match(/^(?:W\/)?"([0-9]+)"$|^([0-9]+)$/); if (!match) throw new BadRequestException('If-Match 必须是非负版本号，例如 4、"4" 或 W/"4"'); const number = match[1] ?? match[2]; const parsed = Number(number); if (!Number.isSafeInteger(parsed) || parsed < 0) throw new BadRequestException('If-Match 必须是非负版本号，例如 4、"4" 或 W/"4"'); return parsed }
function replay(booking: Prisma.bookingsGetPayload<{ include: typeof include }>, request: CreateRequest) { if (asSafeNumber(booking.hotel_id) !== request.hotelId || isoDate(booking.check_in) !== request.checkIn || isoDate(booking.check_out) !== request.checkOut || booking.guest_count !== request.guestCount || booking.contact_name !== request.contactName || booking.contact_phone !== request.contactPhone) throw new ConflictException('同一 Idempotency-Key 不能用于不同的预订请求'); return response(booking) }
function response(booking: Prisma.bookingsGetPayload<{ include: typeof include }>) { return { id: asSafeNumber(booking.id), version: asSafeNumber(booking.version), hotelId: asSafeNumber(booking.hotel_id), hotelName: booking.hotels.name, hotelImage: booking.hotels.img_url, checkIn: isoDate(booking.check_in), checkOut: isoDate(booking.check_out), guestCount: booking.guest_count, contactName: booking.contact_name, contactPhone: booking.contact_phone, nightlyPrice: booking.nightly_price.toNumber(), totalPrice: booking.total_price.toNumber(), status: booking.status, createdAt: booking.created_at.toISOString(), cancelledAt: booking.cancelled_at?.toISOString() ?? null } }
function isoDate(value: Date) { return value.toISOString().slice(0, 10) }
function isUniqueConstraint(error: unknown): boolean { return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002' }
