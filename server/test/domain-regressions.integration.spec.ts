import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { parse } from 'dotenv'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import mariadb = require('mariadb')
import request = require('supertest')
import { DatabaseService } from '../src/database/database.service'
import { UserDataService } from '../src/user-data/user-data.service'
import { UsersService } from '../src/users/users.service'
import { UsersController } from '../src/users/users.controller'
import { BookingsService } from '../src/bookings/bookings.service'
import { BookingsController } from '../src/bookings/bookings.controller'
import { ItinerariesService } from '../src/itineraries/itineraries.service'
import { ItinerariesController } from '../src/itineraries/itineraries.controller'
import { PoisService } from '../src/pois/pois.service'
import { AdminPoisController } from '../src/pois/admin-pois.controller'
import { FavoritesController } from '../src/user-data/favorites.controller'
import { HistoryController } from '../src/user-data/history.controller'
import { ApiExceptionFilter } from '../src/common/api-exception.filter'

// Opt-in only: copies table structures into a unique empty local database, never copies business rows.
const databaseTests = process.env.RUN_DATABASE_REGRESSIONS === '1' ? describe : describe.skip

databaseTests('isolated MySQL HTTP and concurrency regressions', () => {
  const databaseName = `travel_regression_${randomUUID().replaceAll('-', '')}`
  let admin: mariadb.Connection | undefined
  let db: DatabaseService | undefined
  let app: INestApplication | undefined
  let createdDatabase = false
  let token: string
  let userId: bigint
  let hotels: number[]
  let data: UserDataService
  let itineraryId: number

  beforeAll(async () => {
    const settings = parse(readFileSync(resolve(process.cwd(), process.env.REGRESSION_ENV_FILE ?? '.env.local')))
    if (!['localhost', '127.0.0.1', '::1'].includes(settings.DATABASE_HOST)) throw new Error('Database regressions require a local MySQL host')
    if (!/^[A-Za-z0-9_]+$/.test(settings.DATABASE_NAME) || !/^travel_regression_[a-f0-9]{32}$/.test(databaseName)) throw new Error('Invalid test database identifier')
    admin = await mariadb.createConnection({ host: settings.DATABASE_HOST, port: Number(settings.DATABASE_PORT ?? 3306), user: settings.DATABASE_USER, password: settings.DATABASE_PASSWORD, allowPublicKeyRetrieval: true })
    await admin.query(`CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    createdDatabase = true
    await admin.query(`USE \`${databaseName}\``)
    for (const table of ['users', 'hotels', 'hotel_tags', 'favorites', 'browse_history', 'bookings', 'pois', 'poi_tags', 'itineraries', 'itinerary_items']) {
      const [definition] = await admin.query(`SHOW CREATE TABLE \`${settings.DATABASE_NAME}\`.\`${table}\``)
      await admin.query(definition['Create Table'])
    }
    db = new DatabaseService(new ConfigService({ ...settings, DATABASE_NAME: databaseName, DATABASE_CONNECTION_LIMIT: '10' }))
    await db.$connect()
    const users = new UsersService(db, new ConfigService({ JWT_SECRET: 'isolated-test-secret-with-at-least-32-bytes', JWT_TTL_SECONDS: '7200' }))
    const registered = await users.register({ username: 'test-admin', password: 'secure123' })
    token = registered.accessToken
    userId = BigInt(registered.user.userId)
    await db.users.update({ where: { id: userId }, data: { role: 'ADMIN' } })
    hotels = []
    for (let i = 0; i < 21; i++) hotels.push(Number((await db.hotels.create({ data: { name: `测试酒店${i}`, price: 300 } })).id))
    data = new UserDataService(db)
    const module = await Test.createTestingModule({
      controllers: [UsersController, BookingsController, ItinerariesController, AdminPoisController, FavoritesController, HistoryController],
      providers: [
        { provide: UsersService, useValue: users }, { provide: BookingsService, useValue: new BookingsService(db) },
        { provide: ItinerariesService, useValue: new ItinerariesService(db) }, { provide: PoisService, useValue: new PoisService(db) },
        { provide: UserDataService, useValue: data },
      ],
    }).compile()
    app = module.createNestApplication({ logger: false })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new ApiExceptionFilter())
    await app.init()
  }, 60000)

  afterAll(async () => {
    try {
      if (app) await app.close()
      if (db) await db.$disconnect()
    } finally {
      try {
        if (createdDatabase && admin && /^travel_regression_[a-f0-9]{32}$/.test(databaseName)) await admin.query(`DROP DATABASE \`${databaseName}\``)
      } finally { if (admin) await admin.end() }
    }
  }, 30000)

  const http = () => request(app!.getHttpServer())
  const auth = () => `Bearer ${token}`

  it('rejects blank credentials with HTTP 400 and leaves the user count unchanged', async () => {
    for (let i = 0; i < 2; i++) await http().post('/api/users/register').send({ username: '  ', password: '      ' }).expect(400)
    expect(await db!.users.count()).toBe(1)
  })

  it('creates a normal booking, rejects a whitespace phone, and replays after check-in without a second row', async () => {
    const input = { hotelId: hotels[0], checkIn: '2099-01-02', checkOut: '2099-01-04', guestCount: 1, contactName: '小雯', contactPhone: '13800138000' }
    const first = await http().post('/api/bookings').set('Authorization', auth()).set('Idempotency-Key', 'same-booking').send(input).expect(201)
    expect(first.body.data.totalPrice).toBe(600)
    await http().post('/api/bookings').set('Authorization', auth()).set('Idempotency-Key', 'bad-phone').send({ ...input, contactPhone: '      ' }).expect(400)
    const time = jest.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockReturnValue([{ type: 'year', value: '2099' }, { type: 'month', value: '01' }, { type: 'day', value: '02' }])
    try {
      const replay = await http().post('/api/bookings').set('Authorization', auth()).set('Idempotency-Key', 'same-booking').send(input).expect(201)
      expect(replay.body.data).toEqual(first.body.data)
      await http().post('/api/bookings').set('Authorization', auth()).set('Idempotency-Key', 'new-booking').send(input).expect(400)
    } finally { time.mockRestore() }
    expect(await db!.bookings.count()).toBe(1)
  })

  it('preserves monetary boundaries and rejects overflow without inserting', async () => {
    await db!.hotels.update({ where: { id: BigInt(hotels[1]) }, data: { price: 1_000_000_000 } })
    const input = { hotelId: hotels[1], checkIn: '2099-01-02', checkOut: '2099-01-11', guestCount: 10, contactName: '小雯', contactPhone: '13800138000' }
    const normal = await http().post('/api/bookings').set('Authorization', auth()).set('Idempotency-Key', 'max-price').send(input).expect(201)
    expect(normal.body.data.totalPrice).toBe(9_000_000_000)
    for (let i = 0; i < 2; i++) await http().post('/api/bookings').set('Authorization', auth()).set('Idempotency-Key', 'price-overflow').send({ ...input, checkOut: '2099-01-12' }).expect(400)
    expect(await db!.bookings.count({ where: { idempotency_key: 'price-overflow' } })).toBe(0)
  })

  it('creates a 31-day plan and rejects invalid dates and blank titles with 400', async () => {
    const input = { title: '上海旅行', startDate: '2099-01-01', endDate: '2099-01-31' }
    const result = await http().post('/api/itineraries').set('Authorization', auth()).send(input).expect(201)
    itineraryId = result.body.data.id
    for (const patch of [{ startDate: '2099-13-01' }, { title: '   ' }, { endDate: '2099-02-01' }]) {
      await http().post('/api/itineraries').set('Authorization', auth()).send({ ...input, ...patch }).expect(400)
    }
    expect(await db!.itineraries.count()).toBe(1)
  })

  it('rejects invalid/zero-duration item times and blank titles without version or timestamp changes', async () => {
    const before = await db!.itineraries.findUniqueOrThrow({ where: { id: BigInt(itineraryId) } })
    const input = { title: '散步', itemDate: '2099-01-01', type: 'NOTE', sortOrder: 0 }
    for (const patch of [{ startTime: '25:00', endTime: '26:00' }, { startTime: '09:00', endTime: '09:00:00' }, { title: '   ' }, { itemDate: '2099-13-01' }]) {
      for (let i = 0; i < 2; i++) await http().post(`/api/itineraries/${itineraryId}/items`).set('Authorization', auth()).set('If-Match', '0').send({ ...input, ...patch }).expect(400)
    }
    expect(await db!.itineraries.findUniqueOrThrow({ where: { id: BigInt(itineraryId) } })).toEqual(before)
    expect(await db!.itinerary_items.count()).toBe(0)
    const result = await http().post(`/api/itineraries/${itineraryId}/items`).set('Authorization', auth()).set('If-Match', '0').send({ ...input, startTime: '23:59', endTime: '23:59:59' }).expect(201)
    expect(result.body.data).toMatchObject({ version: 1, items: [{ startTime: '23:59:00', endTime: '23:59:59' }] })
    await http().post(`/api/itineraries/${itineraryId}/items`).set('Authorization', auth()).set('If-Match', '0').send(input).expect(409)
    expect(await db!.itinerary_items.count()).toBe(1)
  })

  it('rolls back the parent version and timestamp when deleting an absent item', async () => {
    const before = await db!.itineraries.findUniqueOrThrow({ where: { id: BigInt(itineraryId) } })
    await http().delete(`/api/itineraries/${itineraryId}/items/999999`).set('Authorization', auth()).set('If-Match', String(before.version)).expect(404)
    expect(await db!.itineraries.findUniqueOrThrow({ where: { id: BigInt(itineraryId) } })).toEqual(before)
    expect(await db!.itinerary_items.count()).toBe(1)
  })

  it('supports POI header-only and body-version updates, rejects bad input, and preserves tags after stale updates', async () => {
    const input = { name: '外滩', type: 'ATTRACTION', area: '黄浦', address: '中山东一路', latitude: -90, longitude: 180, ticketPrice: 99999999.99, rating: 5, suggestedDurationMinutes: 1440, active: true, recommended: false, tags: ['城市漫步'] }
    const first = await http().post('/api/admin/pois').set('Authorization', auth()).send(input).expect(201)
    const id = first.body.data.id
    const result = await http().put(`/api/admin/pois/${id}`).set('Authorization', auth()).set('If-Match', 'W/"0"').send(input).expect(200)
    expect(result.body.data.version).toBe(1)
    await http().put(`/api/admin/pois/${id}`).set('Authorization', auth()).send({ ...input, version: 1 }).expect(200)
    const before = await db!.pois.findUniqueOrThrow({ where: { id: BigInt(id) }, include: { poi_tags: true } })
    for (const patch of [{ version: 'abc' }, { version: 2, tags: {} }, { version: 2, ticketPrice: -1 }, { version: 2, rating: 9 }, { version: 2, name: 123 }]) {
      await http().put(`/api/admin/pois/${id}`).set('Authorization', auth()).send({ ...input, ...patch }).expect(400)
    }
    await http().put(`/api/admin/pois/${id}`).set('Authorization', auth()).set('If-Match', '0').send({ ...input, tags: ['购物'] }).expect(409)
    await http().put(`/api/admin/pois/${id}`).set('Authorization', auth()).set('If-Match', '1').send({ ...input, version: 2 }).expect(400)
    expect(await db!.pois.findUniqueOrThrow({ where: { id: BigInt(id) }, include: { poi_tags: true } })).toEqual(before)
    expect(await db!.pois.count()).toBe(1)
  })

  it('returns one successful favorite and 409 for concurrent duplicates, then permits repeated removal', async () => {
    const results = await Promise.all(Array.from({ length: 8 }, () => http().post('/api/favorites').set('Authorization', auth()).send({ hotelId: hotels[0] })))
    expect(results.filter(result => result.status === 201)).toHaveLength(1)
    expect(results.filter(result => result.status === 409)).toHaveLength(7)
    expect(await db!.favorites.count()).toBe(1)
    for (let i = 0; i < 2; i++) await http().delete('/api/favorites').set('Authorization', auth()).query({ hotelId: hotels[0] }).expect(200)
    expect(await db!.favorites.count()).toBe(0)
  })

  it('serializes concurrent first visits to the same hotel into one row', async () => {
    await Promise.all(Array.from({ length: 8 }, () => data.addHistory(userId, hotels[0])))
    expect(await db!.browse_history.count({ where: { user_id: userId, hotel_id: BigInt(hotels[0]) } })).toBe(1)
    expect(await data.listHistory(userId)).toHaveLength(1)
  })

  it('keeps exactly 20 rows with deterministic ordering at tied timestamps, reorders revisits, and isolates users', async () => {
    await data.clearHistory(userId)
    const time = jest.spyOn(Date, 'now').mockReturnValue(1800000000000)
    try {
      for (const hotel of hotels) await data.addHistory(userId, hotel)
      const initial = await data.listHistory(userId)
      expect(initial).toHaveLength(20)
      expect(initial.map(row => row.hotelId)).toEqual(hotels.slice(1).reverse())
      await data.addHistory(userId, hotels[0])
      const revisited = await data.listHistory(userId)
      expect(revisited).toHaveLength(20)
      expect(revisited[0].hotelId).toBe(hotels[0])
      await Promise.all(hotels.map(hotel => data.addHistory(userId, hotel)))
      const concurrent = await data.listHistory(userId)
      expect(concurrent).toHaveLength(20)
      expect(new Set(concurrent.map(row => row.hotelId)).size).toBe(20)
      expect(concurrent.map(row => row.id)).toEqual(concurrent.map(row => row.id).sort((a, b) => b - a))
    } finally { time.mockRestore() }
    const other = await db!.users.create({ data: { username: 'other-user', password: 'test-only', role: 'USER' } })
    await data.addHistory(other.id, hotels[0])
    await Promise.all([data.addHistory(userId, hotels[0]), data.clearHistory(userId)])
    const afterRace = await data.listHistory(userId)
    expect(afterRace.length).toBeLessThanOrEqual(1)
    await data.clearHistory(userId)
    await data.clearHistory(userId)
    expect(await data.listHistory(userId)).toEqual([])
    expect(await data.listHistory(other.id)).toHaveLength(1)
  }, 30000)
})
