import { config } from 'dotenv'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'

config({ path: '.env.bench.local', quiet: true })

const BASE_ID = 8_000_000_000_000n
const SEED = 20260922
const BATCH_SIZE = 500
const AREAS = ['黄浦区', '静安区', '徐汇区', '浦东新区', '长宁区', '虹口区', '普陀区', '杨浦区']
export const BENCH_SEED = SEED
export const BENCH_BASE_ID = BASE_ID

export function benchConnection(raw: string | undefined): { host: string; port: number; user: string; password: string; database: string } {
  if (!raw) throw new Error('BENCH_DATABASE_URL is required; use an isolated travel_bench database')
  const url = new URL(raw)
  const database = decodeURIComponent(url.pathname.slice(1))
  if (url.protocol !== 'mysql:' || !['127.0.0.1', 'localhost'].includes(url.hostname) || database !== 'travel_bench' || url.search || url.hash) {
    throw new Error('Benchmark seeding only permits a local MySQL travel_bench database')
  }
  const port = Number(url.port || '3306')
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535 || !url.username) throw new Error('Invalid benchmark database URL')
  return { host: url.hostname, port, user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), database }
}

function random(index: number): number {
  let value = (SEED ^ index) >>> 0
  value ^= value << 13
  value ^= value >>> 17
  value ^= value << 5
  return value >>> 0
}

export function hotelAt(index: number) {
  if (!Number.isSafeInteger(index) || index < 0 || index >= 50_000) throw new RangeError('hotel index must be in [0, 50000)')
  const value = random(index)
  const star = 2 + (value % 4)
  const price = 100 + ((value >>> 3) % 1900)
  return {
    id: BASE_ID + BigInt(index),
    name: `基准酒店 ${String(index + 1).padStart(5, '0')}`,
    area: AREAS[(value >>> 7) % AREAS.length],
    star_level: star,
    price,
    price_level: price < 300 ? 'low' : price < 800 ? 'mid' : price < 1400 ? 'high' : 'luxury',
    recommended: index % 10 === 0,
    rating: 3 + ((value >>> 12) % 21) / 10,
    review_count: (value >>> 17) % 2000,
    img_url: `/images/hotel-${index % 2 + 1}.jpg`,
    banner_url: `/images/hotel-${index % 2 + 1}.jpg`,
    description: '酒店搜索性能测试数据',
  }
}

type ExistingHotel = { id: bigint } & { [K in Exclude<keyof ReturnType<typeof hotelAt>, 'id'>]?: ReturnType<typeof hotelAt>[K] | null }
const hotelFields = ['name', 'area', 'star_level', 'price', 'price_level', 'recommended', 'rating', 'review_count', 'img_url', 'banner_url', 'description'] as const

export function verifyReservedHotels(rows: ExistingHotel[], count: number): void {
  for (const row of rows) {
    const index = Number(row.id - BASE_ID)
    if (!Number.isSafeInteger(index) || index < 0 || index >= count) throw new Error(`Unexpected benchmark ID ${row.id}`)
    const expected = hotelAt(index)
    for (const field of hotelFields) {
      if (row[field] !== expected[field]) throw new Error(`Corrupt benchmark hotel ${row.id}: ${field}`)
    }
  }
}

async function verifyExisting(db: PrismaClient, count: number): Promise<number> {
  let seen = 0
  for (let start = 0; start < 50_000; start += BATCH_SIZE) {
    const rows = await db.hotels.findMany({
      where: { id: { gte: BASE_ID + BigInt(start), lt: BASE_ID + BigInt(start + BATCH_SIZE) } },
      select: { id: true, name: true, area: true, star_level: true, price: true, price_level: true, recommended: true, rating: true, review_count: true, img_url: true, banner_url: true, description: true },
    })
    verifyReservedHotels(rows, count)
    seen += rows.length
  }
  return seen
}

function targetCount(raw: string | undefined): number {
  const count = Number(raw)
  if (count !== 10_000 && count !== 50_000) throw new Error('Pass --count 10000 or --count 50000')
  return count
}

export function isReprepareError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const details = `${error.message} ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`
  return /(?:\b1615\b|Prepared statement needs to be re-prepared)/i.test(details)
}

async function createBatch(db: PrismaClient, data: ReturnType<typeof hotelAt>[]): Promise<void> {
  const maxAttempts = 5
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await db.hotels.createMany({ data, skipDuplicates: true })
      return
    } catch (error) {
      if (!isReprepareError(error) || attempt === maxAttempts) throw error
      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** (attempt - 1)))
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.length !== 2 || args[0] !== '--count') throw new Error('Usage: npm run seed:hotels:bench -- --count 10000|50000')
  const count = targetCount(args[1])
  const connection = benchConnection(process.env.BENCH_DATABASE_URL)
  const db = new PrismaClient({ adapter: new PrismaMariaDb({ ...connection, connectionLimit: 5 }) })
  try {
    await db.$connect()
    const existing = await verifyExisting(db, count)
    if (existing > count) throw new Error('Benchmark range already has more rows than requested')
    for (let start = 0; start < count; start += BATCH_SIZE) {
      const data = Array.from({ length: Math.min(BATCH_SIZE, count - start) }, (_, offset) => hotelAt(start + offset))
      await createBatch(db, data)
    }
    const actual = await db.hotels.count({ where: { id: { gte: BASE_ID, lt: BASE_ID + BigInt(count) } } })
    if (actual !== count) throw new Error(`Expected ${count} benchmark hotels, found ${actual}`)
    await verifyExisting(db, count)
    console.log(JSON.stringify({ database: connection.database, seed: SEED, count: actual, batchSize: BATCH_SIZE, areas: AREAS.length, starLevels: [2, 3, 4, 5], imagePaths: ['/images/hotel-1.jpg', '/images/hotel-2.jpg'] }))
  } finally { await db.$disconnect() }
}

if (require.main === module) void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Benchmark seed failed')
  process.exitCode = 1
})
