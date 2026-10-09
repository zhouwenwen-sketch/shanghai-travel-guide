import test from 'node:test'
import assert from 'node:assert/strict'
import { validateSearchDates } from '../src/utils/search-dates.ts'

test('empty dates and valid ordered dates are accepted', () => {
  assert.equal(validateSearchDates('', ''), true)
  assert.equal(validateSearchDates('2026-10-01', '2026-10-02'), true)
  assert.equal(validateSearchDates('2028-02-28', '2028-02-29'), true)
})

test('partial, reversed, equal and malformed dates are rejected', () => {
  for (const [start, end] of [
    ['2026-10-01', ''], ['', '2026-10-02'],
    ['2026-10-01', '2026-10-01'], ['2026-10-02', '2026-10-01'],
    ['2026-02-30', '2026-03-01'], ['2026/10/01', '2026-10-02'],
  ]) assert.equal(validateSearchDates(start, end), false)
})

test('repeated validation is deterministic and does not depend on today', () => {
  assert.equal(validateSearchDates('2000-01-01', '2000-01-02'), true)
  assert.equal(validateSearchDates('2000-01-01', '2000-01-02'), true)
})
