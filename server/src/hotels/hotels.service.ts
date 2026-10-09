import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client'
import { asSafeNumber } from '../common/json-codec'
import { DatabaseService } from '../database/database.service'
import { HotelSearchQueryDto } from './hotel-search-query.dto'

const include = { hotel_tags: { select: { tag: true } } } as const
const listSelect = { id: true, name: true, recommended: true, star_level: true, img_url: true, banner_url: true, starimg_url: true, transport: true, phone: true, area: true, price_level: true, price: true, description: true, rating: true, review_count: true, review_desc: true, hotel_tags: { select: { tag: true } } } as const

@Injectable()
export class HotelsService {
  constructor(private readonly db: DatabaseService) {}

  async list() { return (await this.db.hotels.findMany({ include, orderBy: { id: 'asc' } })).map(toListItem) }
  async recommended() { return (await this.db.hotels.findMany({ where: { recommended: true }, include, orderBy: { id: 'asc' } })).map(toListItem) }

  async search(keyword?: string, area?: string, starLevel?: number, minPrice?: number, maxPrice?: number) {
    const filters: Prisma.hotelsWhereInput[] = []
    if (keyword?.trim()) filters.push({ name: { contains: keyword.trim() } })
    if (area?.trim()) filters.push({ area: area.trim() })
    if (starLevel !== undefined) filters.push({ star_level: starLevel })
    if (minPrice !== undefined || maxPrice !== undefined) filters.push({ price: { gte: minPrice, lte: maxPrice } })
    return (await this.db.hotels.findMany({ where: filters.length ? { AND: filters } : undefined, include, orderBy: { id: 'asc' } })).map(toListItem)
  }

  async searchPaged(query: HotelSearchQueryDto) {
    const where = pagedWhere(query)
    const skip = query.page * query.size
    const [rows, totalElements] = await this.db.$transaction([
      this.db.hotels.findMany({ where, select: listSelect, skip, take: query.size, orderBy: pagedOrder(query.sort) }),
      this.db.hotels.count({ where }),
    ])
    return { items: rows.map(toListItem), page: query.page, size: query.size, totalElements, totalPages: Math.ceil(totalElements / query.size) }
  }

  async detail(id: number) {
    const hotel = await this.db.hotels.findUnique({ where: { id: BigInt(id) }, include: { hotel_tags: { select: { tag: true } }, rooms: true, reviews: true } })
    if (!hotel) throw new NotFoundException('酒店不存在')
    return { ...toListItem(hotel), rooms: hotel.rooms.map((room) => ({ id: asSafeNumber(room.id), name: room.name, area: room.area, bed: room.bed, price: room.price, breakfast: room.breakfast, cancel: room.cancel_rule })), reviews: hotel.reviews.map((review) => ({ id: asSafeNumber(review.id), user: review.review_user, rating: review.rating, date: review.date, content: review.content, reply: review.reply })) }
  }
}

function pagedWhere(query: HotelSearchQueryDto): Prisma.hotelsWhereInput | undefined {
  const and: Prisma.hotelsWhereInput[] = []
  const keyword = query.keyword?.trim()
  if (keyword) and.push({ name: { contains: keyword } })
  if (query.areas?.length) and.push({ area: { in: [...new Set(query.areas)] } })
  if (query.starLevels?.length) and.push({ star_level: { in: [...new Set(query.starLevels.map(Number))] } })
  if (query.priceBands?.length) and.push({ OR: [...new Set(query.priceBands)].map(priceBandWhere) })
  return and.length ? { AND: and } : undefined
}

function priceBandWhere(band: string): Prisma.hotelsWhereInput {
  if (band === 'under150') return { price: { lt: 150 } }
  if (band === '150to299') return { price: { gte: 150, lt: 300 } }
  if (band === '300to449') return { price: { gte: 300, lt: 450 } }
  if (band === '450to599') return { price: { gte: 450, lt: 600 } }
  return { price: { gte: 600 } }
}

function pagedOrder(sort: HotelSearchQueryDto['sort']): Prisma.hotelsOrderByWithRelationInput[] {
  // MySQL orders NULL first for ASC and last for DESC; id makes equal and NULL values deterministic.
  if (sort === 'priceAsc') return [{ price: 'asc' }, { id: 'asc' }]
  if (sort === 'priceDesc') return [{ price: 'desc' }, { id: 'asc' }]
  if (sort === 'ratingDesc') return [{ rating: 'desc' }, { id: 'asc' }]
  return [{ id: 'asc' }]
}

function toListItem(hotel: Prisma.hotelsGetPayload<{ include: typeof include }>) {
  return { id: asSafeNumber(hotel.id), name: hotel.name, recommended: hotel.recommended, starLevel: hotel.star_level, img_url: hotel.img_url, banner_url: hotel.banner_url, starimg_url: hotel.starimg_url, transport: hotel.transport, phone: hotel.phone, area: hotel.area, priceLevel: hotel.price_level, price: hotel.price, description: hotel.description, tag: hotel.hotel_tags.map(({ tag }) => tag), rating: hotel.rating, reviewCount: hotel.review_count, reviewDesc: hotel.review_desc }
}
