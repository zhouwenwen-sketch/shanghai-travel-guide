import type { HotelSearchQuery } from '../types/index.ts'

export function hotelSearchParams(params: HotelSearchQuery): Record<string, unknown> {
  return { ...params, areas: params.areas?.join(','), starLevels: params.starLevels?.join(','), priceBands: params.priceBands?.join(',') }
}

export function normalizeSearchListParam(value: unknown, limit = 10): string[] {
  if (value === undefined || value === null || value === '') return []
  const source = Array.isArray(value) ? value : [value]
  return [...new Set(source.flatMap(item => String(item).split(',')).map(item => item.trim()).filter(Boolean))].slice(0, limit)
}
