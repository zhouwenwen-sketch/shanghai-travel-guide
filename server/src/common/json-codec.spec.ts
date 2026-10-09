import { asSafeNumber, toJsonValue } from './json-codec'
import { ok } from './api-result'

describe('JSON contract helpers', () => {
  it('converts nested bigint and dates without mutating the source value', () => {
    const source = { id: 42n, nested: { createdAt: new Date('2026-09-22T00:00:00.000Z') }, ids: [1n, 2n] }
    expect(toJsonValue(source)).toEqual({ id: 42, nested: { createdAt: '2026-09-22T00:00:00.000Z' }, ids: [1, 2] })
    expect(source.id).toBe(42n)
    expect(source.ids[0]).toBe(1n)
  })

  it('rejects BIGINT values that cannot be represented safely by the existing number contract', () => {
    expect(() => asSafeNumber(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toThrow('数据库编号超出 JavaScript 安全整数范围')
  })

  it('uses the uniform successful response shape', () => {
    const response = ok({ value: 1 }, 'trace-test')
    expect(response).toMatchObject({ code: 200, message: 'success', data: { value: 1 }, traceId: 'trace-test' })
    expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp)
  })
})
