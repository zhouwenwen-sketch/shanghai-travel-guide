import { benchConnection, hotelAt, isReprepareError, verifyReservedHotels } from './seed-hotels-bench'
import { benchSchemaCommand } from './bench-schema'
import { verifyBenchmarkIdentity } from './bench-hotels-legacy'

describe('hotel benchmark seeding safeguards', () => {
  it('only accepts the isolated local database', () => {
    expect(() => benchConnection(undefined)).toThrow()
    expect(() => benchConnection('mysql://u:p@127.0.0.1:3306/travel_node')).toThrow()
    expect(() => benchConnection('mysql://u:p@example.com:3306/travel_bench')).toThrow()
    expect(benchConnection('mysql://u:p@127.0.0.1:3306/travel_bench').database).toBe('travel_bench')
  })

  it('produces stable, distinct IDs and bounded hotel values', () => {
    const first = hotelAt(0)
    expect(hotelAt(0)).toEqual(first)
    expect(hotelAt(1).id).toBe(first.id + 1n)
    expect(first.img_url).toBe('/images/hotel-1.jpg')
    for (let index = 0; index < 1000; index++) {
      const hotel = hotelAt(index)
      expect(hotel.price).toBeGreaterThanOrEqual(100)
      expect(hotel.star_level).toBeGreaterThanOrEqual(2)
      expect(hotel.star_level).toBeLessThanOrEqual(5)
    }
    expect(() => hotelAt(50_000)).toThrow(RangeError)
    expect(hotelAt(0).price_level).not.toBe('medium')
  })

  it('rejects corrupt middle rows and rows outside requested range before writing', () => {
    const middle = hotelAt(5000)
    expect(() => verifyReservedHotels([{ ...middle, price: middle.price + 1 }], 10_000)).toThrow('Corrupt benchmark hotel')
    expect(() => verifyReservedHotels([hotelAt(10_000)], 10_000)).toThrow('Unexpected benchmark ID')
    expect(() => verifyReservedHotels([middle], 10_000)).not.toThrow()
  })

  it('only permits bench schema setup and refuses APIs with the wrong database or row count', () => {
    expect(() => benchSchemaCommand('mysql://u:p@127.0.0.1/travel_node')).toThrow()
    expect(benchSchemaCommand('mysql://u:p@127.0.0.1/travel_bench').database).toBe('travel_bench')
    expect(() => verifyBenchmarkIdentity({ database: 'travel_node', reservedHotels: 10_000, heapUsedBytes: 1 }, 10_000)).toThrow()
    expect(() => verifyBenchmarkIdentity({ database: 'travel_bench', reservedHotels: 9_999, heapUsedBytes: 1 }, 10_000)).toThrow()
    expect(verifyBenchmarkIdentity({ database: 'travel_bench', reservedHotels: 10_000, heapUsedBytes: 42 }, 10_000)).toBe(42)
  })

  it('only classifies MySQL prepared statement reprepare failures as retryable', () => {
    expect(isReprepareError(new Error('Database error. Code: `1615`. Message: `Prepared statement needs to be re-prepared`'))).toBe(true)
    expect(isReprepareError(new Error('Access denied'))).toBe(false)
    expect(isReprepareError(null)).toBe(false)
  })
})
