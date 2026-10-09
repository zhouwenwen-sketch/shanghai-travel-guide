export function toJsonValue(value: unknown): unknown {
  if (typeof value === 'bigint') return asSafeNumber(value)
  if (isDecimal(value)) return value.toNumber()
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(toJsonValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, toJsonValue(nested)]))
  }
  return value
}

function isDecimal(value: unknown): value is { toNumber(): number } {
  return typeof value === 'object' && value !== null &&
    'toNumber' in value && typeof value.toNumber === 'function' &&
    value.constructor?.name === 'Decimal'
}

export function asSafeNumber(value: bigint): number {
  const numberValue = Number(value)
  if (!Number.isSafeInteger(numberValue)) throw new RangeError('数据库编号超出 JavaScript 安全整数范围')
  return numberValue
}
