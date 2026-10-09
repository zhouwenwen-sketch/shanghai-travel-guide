import { HotelsService } from './hotels.service'
import { HotelSearchQueryDto } from './hotel-search-query.dto'

const row = { id: 1n, name: '酒店', recommended: false, star_level: 5, img_url: '', banner_url: '', starimg_url: '', transport: '', phone: '', area: '黄浦区', price_level: 'high', price: 500, description: '', rating: 4.8, review_count: 1, review_desc: '', hotel_tags: [] }

describe('HotelsService paged search', () => {
  it('uses the same filters for count and rows, deduplicates inputs, and returns page metadata', async () => {
    const findMany = jest.fn(); const count = jest.fn()
    const db = { hotels: { findMany, count }, $transaction: jest.fn().mockResolvedValue([[row], 25]) }
    const service = new HotelsService(db as never)
    const query = Object.assign(new HotelSearchQueryDto(), { keyword: ' 酒店 ', areas: ['黄浦区', '黄浦区'], starLevels: ['5'], priceBands: ['under150', '600plus'], page: 1, size: 12, sort: 'priceDesc' as const })
    await expect(service.searchPaged(query)).resolves.toMatchObject({ page: 1, size: 12, totalElements: 25, totalPages: 3, items: [{ id: 1 }] })
    const listArgs = db.hotels.findMany.mock.calls[0][0]
    const countArgs = db.hotels.count.mock.calls[0][0]
    expect(listArgs.where).toEqual(countArgs.where)
    expect(listArgs).toMatchObject({ skip: 12, take: 12, orderBy: [{ price: 'desc' }, { id: 'asc' }] })
    expect(listArgs.where.AND).toEqual(expect.arrayContaining([
      { name: { contains: '酒店' } }, { area: { in: ['黄浦区'] } }, { star_level: { in: [5] } },
    ]))
  })

  it('returns a stable empty out-of-range page without side effects', async () => {
    const findMany = jest.fn(); const count = jest.fn()
    const db = { hotels: { findMany, count }, $transaction: jest.fn().mockResolvedValue([[], 2]) }
    const service = new HotelsService(db as never)
    const query = Object.assign(new HotelSearchQueryDto(), { page: 9, size: 6, sort: 'idAsc' as const })
    const first = await service.searchPaged(query); const second = await service.searchPaged(query)
    expect(first).toEqual({ items: [], page: 9, size: 6, totalElements: 2, totalPages: 1 })
    expect(second).toEqual(first)
    expect(query).toMatchObject({ page: 9, size: 6 })
  })

  it('maps every price boundary to contiguous non-overlapping ranges', async () => {
    const findMany=jest.fn();const count=jest.fn();const db={hotels:{findMany,count},$transaction:jest.fn().mockResolvedValue([[],0])};const service=new HotelsService(db as never)
    const query=Object.assign(new HotelSearchQueryDto(),{priceBands:['under150','150to299','300to449','450to599','600plus'],page:0,size:6,sort:'ratingDesc' as const})
    await service.searchPaged(query)
    const args=findMany.mock.calls[0][0]
    expect(args.where.AND[0].OR).toEqual([{price:{lt:150}},{price:{gte:150,lt:300}},{price:{gte:300,lt:450}},{price:{gte:450,lt:600}},{price:{gte:600}}])
    expect(args.orderBy).toEqual([{rating:'desc'},{id:'asc'}])
  })
})
