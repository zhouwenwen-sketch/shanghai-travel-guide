import { DatabaseService } from '../database/database.service'
import { Prisma } from '../generated/prisma/client'
import { ORIGINAL_HOTELS } from './original-hotels'

type HotelSnapshot = Prisma.hotelsGetPayload<{ include: { hotel_tags: true; rooms: true; reviews: true } }>
export type RestoreSnapshot = { hotels: HotelSnapshot[]; actions: string[] }

const JINJIANG = '上海锦江饭店'
const LEGACY_ROOM = { name: '豪华大床房', area: '45㎡', bed: '1张大床', price: 2099, breakfast: '含双早', cancel_rule: '入住前一天可免费取消' }

function matches(actual: object, expected: object): boolean {
  return Object.entries(expected).every(([key, value]) => (actual as Record<string, unknown>)[key] === value)
}

// The caller must persist this snapshot successfully before any mutation starts.
// Run sequentially: hotel names intentionally have no database unique constraint.
export async function restoreOriginalHotels(
  db: Pick<DatabaseService, '$transaction'>,
  saveSnapshot: (snapshot: RestoreSnapshot) => Promise<void>,
): Promise<Array<{ id: bigint; name: string }>> {
  return db.$transaction(async (tx) => {
    const names = ORIGINAL_HOTELS.map(({ hotel }) => hotel.name)
    const hotels = await tx.hotels.findMany({
      where: { OR: [{ name: { in: [...names, JINJIANG] } }, { recommended: true }] },
      include: { hotel_tags: true, rooms: true, reviews: true },
      orderBy: { id: 'asc' },
    })
    const conflicts: string[] = []
    const actions: string[] = []
    for (const source of ORIGINAL_HOTELS) {
      const found = hotels.filter((row) => row.name === source.hotel.name)
      if (found.length > 1) { conflicts.push(`${source.hotel.name}: duplicate name`); continue }
      const row = found[0]
      actions.push(`${row ? `restore ID ${row.id}` : 'create'}: ${source.hotel.name}`)
      if (!row) continue
      if (row.phone !== source.hotel.phone) conflicts.push(`${row.name}: phone identity mismatch`)
      const peace = source.hotel.name === ORIGINAL_HOTELS[0].hotel.name
      for (const { tag } of row.hotel_tags) {
        if (!source.tags.includes(tag) && !(peace && ['外滩', '江景'].includes(tag))) conflicts.push(`${row.name}: unknown tag ${tag}`)
      }
      for (const room of row.rooms) {
        const original = source.rooms.find((item) => item.name === room.name)
        if (!original || (!matches(room, original) && !(peace && matches(room, LEGACY_ROOM)))) conflicts.push(`${row.name}: custom room ${room.name}`)
      }
      for (const review of row.reviews) {
        const original = source.reviews.find((item) => item.review_user === review.review_user && item.date === review.date)
        if (!original || !matches(review, original)) conflicts.push(`${row.name}: custom review ${review.review_user}/${review.date}`)
      }
    }
    const jinjiang = hotels.filter((row) => row.name === JINJIANG)
    if (jinjiang.length > 1) conflicts.push(`${JINJIANG}: duplicate name`)
    for (const row of hotels.filter((item) => item.recommended && !names.includes(item.name ?? ''))) {
      if (row.name !== JINJIANG || !matches(row, {
        phone: '021-62582582', img_url: '/images/hotel-2.jpg', star_level: 5,
        transport: '距淮海中路地铁站约300米', area: '静安区', price_level: 'high', price: 1088,
        description: '市中心花园式历史酒店。', rating: 4.7, review_count: 860, review_desc: '交通便利，环境安静。',
      })) conflicts.push(`${row.name}: unrecognized extra recommended hotel ID ${row.id}`)
      else actions.push(`disable recommendation only: ${row.name} ID ${row.id}`)
    }
    if (conflicts.length) throw new Error(`Hotel restore conflicts; no changes made:\n${conflicts.join('\n')}`)
    await saveSnapshot({ hotels, actions })
    const result: Array<{ id: bigint; name: string }> = []
    for (const source of ORIGINAL_HOTELS) {
      const existing = hotels.find((row) => row.name === source.hotel.name)
      const row = existing
        ? await tx.hotels.update({ where: { id: existing.id }, data: source.hotel })
        : await tx.hotels.create({ data: source.hotel })
      // Only the known simplified tags are removed; existing original tag rows survive.
      if (source.hotel.name === ORIGINAL_HOTELS[0].hotel.name) {
        await tx.hotel_tags.deleteMany({ where: { hotel_id: row.id, tag: { in: ['外滩', '江景'] } } })
      }
      for (const tag of source.tags) {
        await tx.hotel_tags.upsert({ where: { hotel_id_tag: { hotel_id: row.id, tag } }, create: { hotel_id: row.id, tag }, update: {} })
      }
      for (const room of source.rooms) {
        await tx.rooms.upsert({ where: { hotel_id_name: { hotel_id: row.id, name: room.name } }, create: { hotel_id: row.id, ...room }, update: room })
      }
      for (const review of source.reviews) {
        await tx.reviews.upsert({ where: { hotel_id_review_user_date: { hotel_id: row.id, review_user: review.review_user, date: review.date } }, create: { hotel_id: row.id, ...review }, update: review })
      }
      result.push({ id: row.id, name: source.hotel.name })
    }
    for (const row of jinjiang.filter((item) => item.recommended)) {
      await tx.hotels.update({ where: { id: row.id }, data: { recommended: false } })
    }
    return result
  }, { timeout: 30000 })
}
