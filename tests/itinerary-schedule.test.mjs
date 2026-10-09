import test from 'node:test'
import assert from 'node:assert/strict'
import { inspectSchedule } from '../src/utils/itinerary-schedule.ts'

const trip = { startDate: '2026-10-01', endDate: '2026-10-03' }
const draft = (overrides = {}) => ({ itemDate: '2026-10-01', type: 'ATTRACTION', title: '新项目', sortOrder: 0, startTime: '10:00:00', endTime: '11:00:00', ...overrides })
const existing = [
  { ...draft({ title: '博物馆', startTime: '09:00:00', endTime: '10:00:00' }), id: 1, dayNumber: 1 },
  { ...draft({ title: '午餐', startTime: '11:00:00', endTime: '12:00:00' }), id: 2, dayNumber: 1 },
]
const codes = (value, items = existing, editingId = null) => inspectSchedule(value, trip, items, editingId).map(issue => issue.code)

test('adjacent slots and empty times are valid', () => {
  assert.deepEqual(codes(draft()), [])
  assert.deepEqual(codes(draft({ startTime: undefined, endTime: undefined })), [])
})
test('overlap checks same day and excludes the item being edited', () => {
  assert.deepEqual(codes(draft({ startTime: '09:30:00' })), ['OVERLAP'])
  assert.deepEqual(codes(draft({ startTime: '09:30:00' }), existing, 1), [])
  assert.deepEqual(codes(draft({ itemDate: '2026-10-02', startTime: '09:30:00' })), [])
  assert.deepEqual(codes(draft({ startTime: '09:30:00', endTime: '11:30:00' })), ['OVERLAP', 'OVERLAP'])
})
test('rejects invalid and out-of-range dates without system-time dependence', () => {
  assert.deepEqual(codes(draft({ itemDate: '2026-02-30' })), ['INVALID_DATE'])
  assert.deepEqual(codes(draft({ itemDate: '2026-09-30' })), ['OUTSIDE_TRIP'])
  assert.deepEqual(codes(draft({ itemDate: '2026-10-04' })), ['OUTSIDE_TRIP'])
})
test('rejects incomplete, invalid, equal and reversed times', () => {
  assert.deepEqual(codes(draft({ endTime: undefined })), ['INCOMPLETE_TIME'])
  assert.deepEqual(codes(draft({ startTime: '25:00:00' })), ['INVALID_TIME'])
  assert.deepEqual(codes(draft({ endTime: '10:00:00' })), ['REVERSED_TIME'])
  assert.deepEqual(codes(draft({ endTime: '09:00:00' })), ['REVERSED_TIME'])
})
test('does not mutate input objects or shared state across calls', () => {
  const input = draft({ startTime: '09:30:00' })
  const before = structuredClone({ input, existing })
  assert.deepEqual(codes(input), ['OVERLAP'])
  assert.deepEqual(codes(input), ['OVERLAP'])
  assert.deepEqual({ input, existing }, before)
})
