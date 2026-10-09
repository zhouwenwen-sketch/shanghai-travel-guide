import { config } from 'dotenv'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { benchConnection } from './seed-hotels-bench'

config({ path: '.env.bench.local', quiet: true })

export function benchSchemaCommand(raw: string | undefined): { url: string; database: string } {
  const connection = benchConnection(raw)
  return { url: raw!, database: connection.database }
}

if (require.main === module) {
  try {
    const target = benchSchemaCommand(process.env.BENCH_DATABASE_URL)
    const prismaCli = resolve('node_modules/prisma/build/index.js')
    const result = spawnSync(process.execPath, [prismaCli, 'db', 'push'], {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: target.url },
    })
    if (result.error) throw result.error
    process.exitCode = result.status ?? 1
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Benchmark schema setup failed')
    process.exitCode = 1
  }
}
