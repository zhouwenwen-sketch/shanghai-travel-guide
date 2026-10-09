const validIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** Validates date-only search input without reading the current clock. */
export function validateSearchDates(checkIn: string, checkOut: string): boolean {
  if (!checkIn && !checkOut) return true
  return validIsoDate(checkIn) && validIsoDate(checkOut) && checkOut > checkIn
}
