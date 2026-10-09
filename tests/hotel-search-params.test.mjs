import test from 'node:test'
import assert from 'node:assert/strict'
import { hotelSearchParams, normalizeSearchListParam } from '../src/utils/hotel-search.ts'

test('serializes multi-value filters without mutating input', () => {
  const input = { areas: ['黄浦区','静安区'], starLevels: [4,5], priceBands: ['under150','600plus'], page: 0, size: 6 }
  const before = structuredClone(input)
  assert.deepEqual(hotelSearchParams(input), { areas:'黄浦区,静安区', starLevels:'4,5', priceBands:'under150,600plus', page:0, size:6 })
  assert.deepEqual(input, before)
})

test('normalizes URL list values safely and deterministically', () => {
  const input = [' 黄浦区,静安区 ', '黄浦区', '', '徐汇区,浦东新区']
  const before = structuredClone(input)
  assert.deepEqual(normalizeSearchListParam(input, 3), ['黄浦区', '静安区', '徐汇区'])
  assert.deepEqual(normalizeSearchListParam(input, 3), ['黄浦区', '静安区', '徐汇区'])
  assert.deepEqual(input, before)
})

test('normalizes empty and extreme URL list inputs', () => {
  assert.deepEqual(normalizeSearchListParam(undefined), [])
  assert.deepEqual(normalizeSearchListParam(null), [])
  assert.deepEqual(normalizeSearchListParam(' , , '), [])
  assert.deepEqual(normalizeSearchListParam('a,b,c,d', 2), ['a', 'b'])
})
