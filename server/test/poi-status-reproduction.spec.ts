import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { PoisService } from '../src/pois/pois.service'
import { PoisController } from '../src/pois/pois.controller'
import { AdminPoisController } from '../src/pois/admin-pois.controller'
import { UsersService } from '../src/users/users.service'
import { Prisma } from '../src/generated/prisma/client'

// Real controllers and service, isolated in-memory persistence and test-only identity.
// This reproduces the API semantics; it does not test MySQL or browser rendering.
describe('POI enabled versus recommended: integration misunderstanding reproduction', () => {
  let app: INestApplication
  let row: any
  const body = { name: '状态复现地点', type: 'ATTRACTION', area: '黄浦区', address: '测试地址', latitude: 31.24, longitude: 121.49, tags: [], active: true, recommended: true }
  const matches = (where: any): boolean => !where || Object.entries(where).every(([key, value]) => {
    if (key === 'AND') return (value as any[]).every(matches)
    return row[key] === value
  })

  beforeEach(async () => {
    row = { ...body, id: 1n, version: 0n, latitude: new Prisma.Decimal(body.latitude), longitude: new Prisma.Decimal(body.longitude), poi_tags: [] }
    const db: any = {
      pois: {
        count: async ({ where }: any) => matches(where) ? 1 : 0,
        findMany: async ({ where }: any) => matches(where) ? [row] : [],
        findFirst: async ({ where }: any) => matches(where) ? row : null,
        findUnique: async ({ where }: any) => matches(where) ? row : null,
        findUniqueOrThrow: async () => row,
        updateMany: async ({ where, data }: any) => {
          if (!matches(where)) return { count: 0 }
          row = { ...row, ...data, version: row.version + BigInt(data.version.increment) }
          return { count: 1 }
        },
      },
      poi_tags: { deleteMany: async () => ({ count: 0 }), createMany: async () => ({ count: 0 }) },
      $transaction: async (action: any) => typeof action === 'function' ? action(db) : Promise.all(action),
    }
    const module = await Test.createTestingModule({
      controllers: [PoisController, AdminPoisController],
      providers: [
        { provide: PoisService, useValue: new PoisService(db) },
        { provide: UsersService, useValue: { requireUser: async () => ({ role: 'ADMIN' }) } },
      ],
    }).compile()
    app = module.createNestApplication({ logger: false })
    await app.init()
  })
  afterEach(async () => { await app?.close() })
  const http = () => request(app.getHttpServer())
  const update = (active: boolean, recommended: boolean, version: number) => http().put('/api/admin/pois/1')
    .set('Authorization', 'Bearer isolated-test-admin').send({ ...body, active, recommended, version })

  it('normal: enabled and recommended is returned publicly', async () => {
    const result = await http().get('/api/pois?page=0&size=9').expect(200)
    expect(result.body.data.items).toEqual([expect.objectContaining({ id: 1, active: true, recommended: true })])
  })

  it('reproduction: removing recommendation does not hide an enabled POI', async () => {
    const updated = await update(true, false, 0).expect(200)
    expect(updated.body.data).toMatchObject({ active: true, recommended: false, version: 1 })
    const result = await http().get('/api/pois?page=0&size=9').expect(200)
    expect(result.body.data.items).toEqual([expect.objectContaining({ id: 1, active: true, recommended: false })])
    await http().get('/api/pois/1').expect(200)
  })

  it('boundary: recommended but disabled is hidden publicly and retained in admin', async () => {
    await http().delete('/api/admin/pois/1').set('Authorization', 'Bearer isolated-test-admin').set('If-Match', '"0"').expect(200)
    const result = await http().get('/api/pois?page=0&size=9').expect(200)
    expect(result.body.data.items).toEqual([])
    await http().get('/api/pois/1').expect(404)
    const admin = await http().get('/api/admin/pois').set('Authorization', 'Bearer isolated-test-admin').expect(200)
    expect(admin.body.data.items).toEqual([expect.objectContaining({ active: false, recommended: true, version: 1 })])
  })

  it('sequence: disabled/unrecommended is hidden; re-enabling without recommendation restores visibility', async () => {
    await update(false, false, 0).expect(200)
    expect((await http().get('/api/pois').expect(200)).body.data.items).toEqual([])
    await update(true, false, 1).expect(200)
    expect((await http().get('/api/pois').expect(200)).body.data.items).toHaveLength(1)
  })

  it('repeat: stale version returns 409 and leaves both flags unchanged', async () => {
    await update(true, false, 0).expect(200)
    await update(false, true, 0).expect(409)
    expect(row).toMatchObject({ active: true, recommended: false, version: 1n })
  })
})
