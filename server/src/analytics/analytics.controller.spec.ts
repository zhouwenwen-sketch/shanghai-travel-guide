import { ValidationPipe } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { AnalyticsController } from './analytics.controller'
import { HomeViewDto } from './home-view.dto'

const valid = { eventId: '550e8400-e29b-41d4-a716-446655440000', visitorId: '550e8400-e29b-41d4-a716-446655440001', sessionId: '550e8400-e29b-41d4-a716-446655440002' }

describe('AnalyticsController', () => {
  it('wraps an accepted anonymous event in the common response', async () => {
    const service = { recordHomeView: jest.fn().mockResolvedValue({ accepted: true }) }
    const controller = new AnalyticsController(service as never)
    await expect(controller.recordHomeView(valid)).resolves.toMatchObject({ code: 200, message: 'success', data: { accepted: true } })
    expect(service.recordHomeView).toHaveBeenCalledWith(valid)
  })

  it.each([
    {},
    { ...valid, eventId: '' },
    { ...valid, visitorId: 'not-a-uuid' },
    { ...valid, sessionId: '550e8400-e29b-11d4-a716-446655440002' },
  ])('rejects missing, empty, invalid, and non-v4 identifiers', async (body) => {
    expect(await validate(plainToInstance(HomeViewDto, body))).not.toHaveLength(0)
  })

  it('rejects unknown fields with the application validation settings', async () => {
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
    await expect(pipe.transform({ ...valid, clientTime: '2020-01-01' }, { type: 'body', metatype: HomeViewDto })).rejects.toMatchObject({ status: 400 })
  })
})
