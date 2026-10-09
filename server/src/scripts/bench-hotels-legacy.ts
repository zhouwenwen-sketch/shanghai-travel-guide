import { performance } from 'node:perf_hooks'
import { cpus, totalmem } from 'node:os'
import { spawnSync } from 'node:child_process'
import { config } from 'dotenv'
import { benchConnection } from './seed-hotels-bench'

config({ path: '.env.bench.local', quiet: true })
const BASE_URL = process.env.BENCH_API_URL ?? 'http://127.0.0.1:8082'
const WARMUP = 5
const SAMPLES = 20
const TIMEOUT_MS = 10_000

export function verifyBenchmarkIdentity(identity: unknown, expectedCount: number): number {
  if (!identity || typeof identity !== 'object') throw new Error('Benchmark API identity missing')
  const value = identity as Record<string, unknown>
  if (value.database !== 'travel_bench' || value.reservedHotels !== expectedCount) {
    throw new Error(`Benchmark API must use travel_bench with ${expectedCount} reserved hotels`)
  }
  if (typeof value.heapUsedBytes !== 'number' || !Number.isFinite(value.heapUsedBytes)) throw new Error('Benchmark heap reading missing')
  return value.heapUsedBytes
}

async function identity(expectedCount: number): Promise<{ heap: number; mysqlVersion: string }> {
  const response = await fetch(`${BASE_URL}/health/bench`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!response.ok) throw new Error(`Benchmark identity refused: HTTP ${response.status}`)
  const body = await response.json() as Record<string, unknown>
  return { heap: verifyBenchmarkIdentity(body, expectedCount), mysqlVersion: String(body.mysqlVersion ?? 'unknown') }
}

function percentile(values: number[], rank: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.ceil(rank * sorted.length) - 1] ?? NaN
}

async function sample(query: string): Promise<{ ms: number; bytes: number }> {
  const start = performance.now()
  const response = await fetch(`${BASE_URL}/api/hotels/search${query}`, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: 'application/json' } })
  const payload = await response.arrayBuffer()
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return { ms: performance.now() - start, bytes: payload.byteLength }
}

async function main(): Promise<void> {
  const connection = benchConnection(process.env.BENCH_DATABASE_URL)
  const expectedCount = Number(process.env.BENCH_COUNT)
  if (expectedCount !== 10_000 && expectedCount !== 50_000) throw new Error('BENCH_COUNT must be 10000 or 50000')
  const url = new URL(BASE_URL)
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.protocol !== 'http:' || url.pathname !== '/' || url.search || url.hash) throw new Error('BENCH_API_URL must be a local HTTP origin')
  const firstIdentity = await identity(expectedCount)
  const git = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' })
  console.log(JSON.stringify({ kind: 'metadata', apiUrl: BASE_URL, database: connection.database, count: expectedCount, seed: 20260922, gitCommit: git.status === 0 ? git.stdout.trim() : null, mysqlVersion: firstIdentity.mysqlVersion, node: process.version, platform: process.platform, arch: process.arch, cpu: cpus()[0]?.model, logicalCpus: cpus().length, totalMemoryBytes: totalmem(), timestamp: new Date().toISOString(), heapMetric: 'sampled server heapUsedBytes after requests' }))
  const scenarios = [
    ['all', ''],
    ['area-star', '?area=%E9%BB%84%E6%B5%A6%E5%8C%BA&starLevel=5'],
    ['price', '?minPrice=300&maxPrice=800'],
    ['keyword', '?keyword=%E5%9F%BA%E5%87%86%E9%85%92%E5%BA%97'],
  ] as const
  for (const [name, query] of scenarios) {
    let heapPeak = (await identity(expectedCount)).heap
    const values: number[] = []
    let bytes = 0
    let timeout = false
    for (let index = 0; index < WARMUP + SAMPLES; index++) {
      try {
        const result = await sample(query)
        if (index >= WARMUP) { values.push(result.ms); bytes = result.bytes }
        heapPeak = Math.max(heapPeak, (await identity(expectedCount)).heap)
      } catch (error) {
        if ((error as Error).name === 'TimeoutError') { timeout = true; break }
        throw error
      }
    }
    console.log(JSON.stringify({ scenario: name, warmup: WARMUP, samples: values.length, timeout, p50Ms: values.length ? percentile(values, 0.5) : null, p95Ms: values.length ? percentile(values, 0.95) : null, responseKB: bytes ? bytes / 1024 : null, sampledServerHeapPeakBytes: heapPeak }))
  }
}

if (require.main === module) void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Benchmark failed')
  process.exitCode = 1
})
