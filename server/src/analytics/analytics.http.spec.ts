import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { ApiExceptionFilter } from '../common/api-exception.filter'
import { traceIdMiddleware } from '../common/trace-id.middleware'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'

const valid = { eventId: '550e8400-e29b-41d4-a716-446655440000', visitorId: '550e8400-e29b-41d4-a716-446655440001', sessionId: '550e8400-e29b-41d4-a716-446655440002' }

describe('AnalyticsController HTTP contract', () => {
  let app: INestApplication
  const analytics = { recordHomeView: jest.fn() }

  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [AnalyticsController], providers: [{ provide: AnalyticsService, useValue: analytics }] }).compile()
    app = module.createNestApplication()
    app.use(traceIdMiddleware)
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    app.useGlobalFilters(new ApiExceptionFilter())
    await app.init()
  })
  afterAll(() => app.close())
  beforeEach(() => analytics.recordHomeView.mockReset().mockResolvedValue({ accepted: true }))

  it('accepts a valid anonymous event with HTTP 200 and supports replay', async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      await request(app.getHttpServer()).post('/api/analytics/home-view').send(valid).expect(200).expect(({ body }) => {
        expect(body).toMatchObject({ code: 200, message: 'success', data: { accepted: true } })
      })
    }
    expect(analytics.recordHomeView).toHaveBeenCalledTimes(2)
  })

  it.each([
    [{ ...valid, eventId: 'not-a-uuid' }],
    [{ ...valid, extra: true }],
  ])('returns the common 400 envelope for an invalid body', async (body) => {
    await request(app.getHttpServer()).post('/api/analytics/home-view').send(body).expect(400).expect(({ body: response }) => {
      expect(response).toMatchObject({ code: 400, data: expect.any(Object), traceId: expect.any(String) })
    })
    expect(analytics.recordHomeView).not.toHaveBeenCalled()
  })

  it('returns the common generic 500 envelope without leaking the database error', async () => {
    analytics.recordHomeView.mockRejectedValueOnce(new Error('database password must stay private'))
    await request(app.getHttpServer()).post('/api/analytics/home-view').send(valid).expect(500).expect(({ body }) => {
      expect(body).toMatchObject({ code: 500, message: '服务器暂时无法处理请求', data: null, traceId: expect.any(String) })
      expect(JSON.stringify(body)).not.toContain('database password')
    })
  })
})
