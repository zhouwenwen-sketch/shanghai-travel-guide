import test from 'node:test'
import assert from 'node:assert/strict'
import { LatestRequest } from '../src/utils/latest-request.ts'

test('starting a new request aborts the previous request and makes only the latest current', () => {
  const requests = new LatestRequest()
  const first = requests.begin(); const second = requests.begin()
  assert.equal(first.signal.aborted, true)
  assert.equal(requests.isCurrent(first.id), false)
  assert.equal(requests.isCurrent(second.id), true)
})

test('cancel is idempotent and invalidates the active request', () => {
  const requests = new LatestRequest(); const active = requests.begin()
  requests.cancel(); requests.cancel()
  assert.equal(active.signal.aborted, true)
  assert.equal(requests.isCurrent(active.id), false)
})
