import { config } from 'dotenv'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../generated/prisma/client'
import { benchConnection } from './seed-hotels-bench'

config({ path: '.env.bench.local', quiet: true })
const statements = {
  areaStar: "EXPLAIN ANALYZE SELECT id FROM hotels WHERE area='黄浦区' AND star_level=5 ORDER BY id LIMIT 24",
  price: 'EXPLAIN ANALYZE SELECT id FROM hotels WHERE price>=300 AND price<600 ORDER BY price,id LIMIT 24',
  keywordContains: "EXPLAIN ANALYZE SELECT id FROM hotels WHERE name LIKE '%基准酒店%' ORDER BY id LIMIT 24",
  deepPage: 'EXPLAIN ANALYZE SELECT id FROM hotels ORDER BY id LIMIT 24 OFFSET 49920',
} as const

async function main():Promise<void>{const connection=benchConnection(process.env.BENCH_DATABASE_URL);const db=new PrismaClient({adapter:new PrismaMariaDb({...connection,connectionLimit:2})});try{await db.$connect();for(const [scenario,sql] of Object.entries(statements)){const rows=await db.$queryRawUnsafe<unknown[]>(sql);console.log(JSON.stringify({scenario,plan:rows},(_,value)=>typeof value==='bigint'?value.toString():value))}}finally{await db.$disconnect()}}
if(require.main===module)void main().catch((error:unknown)=>{console.error(error instanceof Error?error.message:'EXPLAIN failed');process.exitCode=1})
