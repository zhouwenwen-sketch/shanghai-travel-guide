import { BadRequestException, ConflictException } from '@nestjs/common'
import { PoisService } from './pois.service'

const valid = { name: '外滩', type: 'ATTRACTION', area: '黄浦', address: '中山东一路', latitude: 31.24, longitude: 121.49, recommended: true, active: true, tags: ['城市漫步'], ticketPrice: 0, rating: 5, suggestedDurationMinutes: 60 }

describe('POI input and version regressions', () => {
  let db: any
  let row: any
  beforeEach(() => {
    row = { id: 1n, version: 0n }
    const makeRow = (data: any) => ({ ...row, ...data, poi_tags: (data.poi_tags?.create ?? []).map((x: any) => ({ tag: x.tag })) })
    db = {
      pois: {
        create: jest.fn(async ({ data }) => makeRow({ ...data, version: 0n })),
        findUnique: jest.fn(async () => row),
        updateMany: jest.fn(async ({ where, data }) => {
          if (where.version !== row.version) return { count: 0 }
          row = makeRow({ ...data, version: row.version + 1n })
          return { count: 1 }
        }),
        findUniqueOrThrow: jest.fn(async () => row),
      },
      poi_tags: { deleteMany: jest.fn(), createMany: jest.fn(async ({ data }) => { row.poi_tags = data }) },
      $transaction: jest.fn(async action => action(db)),
    }
  })

  it('creates valid POIs and trims/deduplicates string tags without changing response fields', async () => {
    expect(await new PoisService(db).create({ ...valid, tags: ['城市漫步', ' 城市漫步 '] })).toMatchObject({ id: 1, version: 0, ticketPrice: 0, rating: 5, tags: ['城市漫步'] })
    expect(db.pois.create).toHaveBeenCalledTimes(1)
  })

  it('accepts exact text, coordinate, cost, duration and tag boundaries', async () => {
    const result = await new PoisService(db).create({ ...valid, name: '景'.repeat(120), area: '区'.repeat(50), address: '址'.repeat(200), latitude: '-90', longitude: '180', ticketPrice: '99999999.99', averagePrice: 0, suggestedDurationMinutes: 1440, rating: 0, tags: Array.from({ length: 10 }, (_, i) => `${i}${'标'.repeat(49)}`) })
    expect(result).toMatchObject({ latitude: -90, longitude: 180, ticketPrice: 99999999.99, suggestedDurationMinutes: 1440, rating: 0 })
    expect(result.tags).toHaveLength(10)
  })

  it.each([
    { name: 123 }, { name: ' ' }, { name: '景'.repeat(121) }, { area: '区'.repeat(51) }, { address: '址'.repeat(201) },
    { latitude: null }, { latitude: true }, { latitude: '' }, { latitude: 91 }, { longitude: -181 }, { latitude: 31.12345678 },
    { ticketPrice: -1 }, { ticketPrice: 100000000 }, { averagePrice: 'NaN' }, { ticketPrice: 'Infinity' }, { ticketPrice: 0.001 },
    { rating: 5.1 }, { rating: 4.55 }, { suggestedDurationMinutes: 0 }, { suggestedDurationMinutes: 1441 }, { suggestedDurationMinutes: 1.5 },
    { tags: {} }, { tags: [123] }, { tags: [' '] }, { tags: ['标'.repeat(51)] }, { tags: Array(11).fill('标签') },
    { openingHours: 123 }, { openingHours: '时'.repeat(201) }, { description: '描'.repeat(5001) }, { imageUrl: 'a'.repeat(501) },
    { active: 'true' },
  ])('returns 400 for malformed values before any write: %j', async patch => {
    const service = new PoisService(db)
    for (let i = 0; i < 2; i++) await expect(service.create({ ...valid, ...patch })).rejects.toBeInstanceOf(BadRequestException)
    expect(db.pois.create).not.toHaveBeenCalled()
    expect(db.$transaction).not.toHaveBeenCalled()
  })

  it.each([undefined, null, [], 'bad'])('rejects malformed update bodies without querying or writing: %j', async body => {
    await expect(new PoisService(db).update(1, body, '0')).rejects.toBeInstanceOf(BadRequestException)
    expect(db.pois.findUnique).not.toHaveBeenCalled()
    expect(db.$transaction).not.toHaveBeenCalled()
  })

  it.each([
    [{ ...valid, version: 0 }, undefined],
    [valid, '0'], [valid, '"0"'], [valid, ' W/"0" '],
    [{ ...valid, version: 0 }, '"0"'],
  ])('supports both existing body.version and documented If-Match: %j / %s', async (body, header) => {
    expect((await new PoisService(db).update(1, body, header)).version).toBe(1)
    expect(db.poi_tags.deleteMany).toHaveBeenCalledTimes(1)
    expect(db.poi_tags.createMany).toHaveBeenCalledTimes(1)
  })

  it('rejects repeating an update with a stale version without changing tags or version again', async () => {
    const service = new PoisService(db)
    await service.update(1, { ...valid, version: 0 })
    await expect(service.update(1, { ...valid, version: 0 })).rejects.toBeInstanceOf(ConflictException)
    expect(row.version).toBe(1n)
    expect(db.poi_tags.deleteMany).toHaveBeenCalledTimes(1)
    expect(db.poi_tags.createMany).toHaveBeenCalledTimes(1)
  })

  it.each([
    [{ ...valid, version: 'abc' }, undefined], [{ ...valid, version: null }, undefined],
    [{ ...valid, version: -1 }, undefined], [{ ...valid, version: 1.5 }, undefined],
    [{ ...valid, version: 9007199254740992 }, undefined], [valid, '9007199254740992'],
    [valid, '*'], [{ ...valid, version: 0 }, '1'],
  ])('rejects malformed or conflicting versions with 400: %j / %s', async (body, header) => {
    await expect(new PoisService(db).update(1, body, header)).rejects.toBeInstanceOf(BadRequestException)
    expect(db.$transaction).not.toHaveBeenCalled()
    expect(db.poi_tags.deleteMany).not.toHaveBeenCalled()
  })

  it('does not replace tags when a concurrent update wins the CAS', async () => {
    db.pois.updateMany.mockResolvedValue({ count: 0 })
    await expect(new PoisService(db).update(1, valid, '0')).rejects.toBeInstanceOf(ConflictException)
    expect(db.poi_tags.deleteMany).not.toHaveBeenCalled()
    expect(db.poi_tags.createMany).not.toHaveBeenCalled()
  })

  it('keeps missing versions as conflicts and rejects invalid DELETE headers before writing', async () => {
    const service = new PoisService(db)
    await expect(service.update(1, valid)).rejects.toBeInstanceOf(ConflictException)
    await expect(service.deactivate(1, '9007199254740992')).rejects.toBeInstanceOf(BadRequestException)
    expect(db.pois.updateMany).not.toHaveBeenCalled()
  })
})
