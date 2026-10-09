import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { asSafeNumber } from '../common/json-codec'
import { DatabaseService } from '../database/database.service'
import { Prisma } from '../generated/prisma/client'

const hotelInclude = { hotels: { include: { hotel_tags: { select: { tag: true } } } } } as const

@Injectable()
export class UserDataService {
  constructor(private readonly db: DatabaseService) {}

  async listFavorites(userId: bigint) { return (await this.db.favorites.findMany({ where: { user_id: userId }, include: hotelInclude, orderBy: { created_at: 'desc' } })).map(favoriteResponse) }
  async isFavorite(userId: bigint, hotelId: number) { return !!(await this.db.favorites.findFirst({ where: { user_id: userId, hotel_id: BigInt(hotelId) } })) }
  async addFavorite(userId: bigint, hotelId: number) {
    const hotel = await this.requireHotel(hotelId)
    if (await this.isFavorite(userId, hotelId)) throw new ConflictException('该酒店已收藏')
    try {
      const favorite = await this.db.favorites.create({ data: { user_id: userId, hotel_id: hotel.id, created_at: new Date() }, include: hotelInclude })
      return favoriteResponse(favorite)
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') throw new ConflictException('该酒店已收藏')
      throw error
    }
  }
  async removeFavorite(userId: bigint, hotelId: number) { await this.db.favorites.deleteMany({ where: { user_id: userId, hotel_id: BigInt(hotelId) } }) }

  async listHistory(userId: bigint) { return (await this.db.browse_history.findMany({ where: { user_id: userId }, include: hotelInclude, orderBy: [{ browse_time: 'desc' }, { id: 'desc' }] })).map(historyResponse) }
  async addHistory(userId: bigint, hotelId: number) {
    const hotel = await this.requireHotel(hotelId)
    return this.db.$transaction(async (tx) => {
      // Serialize this user's history writes before delete/create/prune, including concurrent first visits.
      await tx.$queryRaw(Prisma.sql`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`)
      await tx.browse_history.deleteMany({ where: { user_id: userId, hotel_id: hotel.id } })
      const history = await tx.browse_history.create({ data: { user_id: userId, hotel_id: hotel.id, browse_time: BigInt(Date.now()) }, include: hotelInclude })
      const overflow = await tx.browse_history.findMany({ where: { user_id: userId }, orderBy: [{ browse_time: 'desc' }, { id: 'desc' }], skip: 20, select: { id: true } })
      if (overflow.length) await tx.browse_history.deleteMany({ where: { id: { in: overflow.map(({ id }) => id) } } })
      return historyResponse(history)
    })
  }
  async clearHistory(userId: bigint) { await this.db.$transaction(async tx => { await tx.$queryRaw(Prisma.sql`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`); await tx.browse_history.deleteMany({ where: { user_id: userId } }) }) }
  private async requireHotel(id: number) { const hotel = await this.db.hotels.findUnique({ where: { id: BigInt(id) } }); if (!hotel) throw new NotFoundException('酒店不存在'); return hotel }
}

function summary(hotel: NonNullable<Parameters<typeof favoriteResponse>[0]['hotels']>) { return { id: asSafeNumber(hotel.id), name: hotel.name, img_url: hotel.img_url, transport: hotel.transport, price: hotel.price, rating: hotel.rating, tag: hotel.hotel_tags.map(({ tag }) => tag) } }
function favoriteResponse(favorite: { id: bigint; hotel_id: bigint | null; created_at: Date | null; hotels: { id: bigint; name: string | null; img_url: string | null; transport: string | null; price: number | null; rating: number | null; hotel_tags: { tag: string }[] } | null }) { if (!favorite.hotels || !favorite.hotel_id) throw new Error('收藏酒店数据不完整'); return { id: asSafeNumber(favorite.id), hotelId: asSafeNumber(favorite.hotel_id), hotel: summary(favorite.hotels), createdAt: favorite.created_at?.toISOString() ?? null } }
function historyResponse(history: { id: bigint; hotel_id: bigint | null; browse_time: bigint | null; hotels: { id: bigint; name: string | null; img_url: string | null; transport: string | null; price: number | null; rating: number | null; hotel_tags: { tag: string }[] } | null }) { if (!history.hotels || !history.hotel_id) throw new Error('浏览酒店数据不完整'); return { id: asSafeNumber(history.id), hotelId: asSafeNumber(history.hotel_id), hotel: summary(history.hotels), visitedAt: history.browse_time ? asSafeNumber(history.browse_time) : null } }
