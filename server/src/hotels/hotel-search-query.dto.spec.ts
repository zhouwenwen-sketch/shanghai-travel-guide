import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { HotelSearchQueryDto } from './hotel-search-query.dto'

const errors = async (input: Record<string, unknown>) => validate(plainToInstance(HotelSearchQueryDto, input))

describe('HotelSearchQueryDto', () => {
  it('applies defaults and parses repeatable comma separated filters', async () => {
    const dto = plainToInstance(HotelSearchQueryDto, { areas: ['黄浦区,静安区', '徐汇区'], starLevels: '4,5', priceBands: 'under150,600plus' })
    expect(await validate(dto)).toHaveLength(0)
    expect(dto).toMatchObject({ page: 0, size: 6, sort: 'idAsc', areas: ['黄浦区', '静安区', '徐汇区'], starLevels: ['4', '5'] })
  })

  it.each([
    { page: '' }, { page: ' ' }, { page: '0x10' }, { page: ['1'] }, { size: '' }, { page: '-1' }, { page: '1.5' }, { page: '10001' }, { page: '9007199254740991' }, { size: '100' },
    { sort: 'unknown' }, { starLevels: '1,5' }, { priceBands: 'low' }, { keyword: 'x'.repeat(101) },
    { areas: ',' },
  ])('rejects illegal query %#', async (input) => expect((await errors(input)).length).toBeGreaterThan(0))

  it('rejects empty array overflow and accepts maximum page boundary', async () => {
    expect((await errors({ areas: Array.from({ length: 11 }, (_, i) => `区域${i}`) })).length).toBeGreaterThan(0)
    expect(await errors({ page: '10000', size: '24' })).toHaveLength(0)
  })
})
