import { performance } from 'node:perf_hooks'
import { cpus, totalmem } from 'node:os'
import { spawnSync } from 'node:child_process'
import { config } from 'dotenv'
import { benchConnection } from './seed-hotels-bench'
import { verifyBenchmarkIdentity } from './bench-hotels-legacy'

config({ path: '.env.bench.local', quiet: true })
const BASE_URL = process.env.BENCH_API_URL ?? 'http://127.0.0.1:8082'
const WARMUP = 5; const SAMPLES = 20; const TIMEOUT_MS = 10_000

const percentile = (values:number[], rank:number):number => [...values].sort((a,b)=>a-b)[Math.ceil(rank*values.length)-1] ?? Number.NaN
async function identity(expected:number):Promise<{heap:number;mysqlVersion:string}>{const response=await fetch(`${BASE_URL}/health/bench`,{signal:AbortSignal.timeout(TIMEOUT_MS)});if(!response.ok)throw new Error(`Benchmark identity refused: HTTP ${response.status}`);const body=await response.json() as Record<string,unknown>;return {heap:verifyBenchmarkIdentity(body,expected),mysqlVersion:String(body.mysqlVersion??'unknown')}}
async function sample(query:string):Promise<{ms:number;bytes:number}>{const start=performance.now();const response=await fetch(`${BASE_URL}/api/hotels/search/paged${query}`,{signal:AbortSignal.timeout(TIMEOUT_MS),headers:{accept:'application/json'}});const payload=await response.arrayBuffer();if(!response.ok)throw new Error(`HTTP ${response.status}`);return {ms:performance.now()-start,bytes:payload.byteLength}}

async function main():Promise<void>{
  const connection=benchConnection(process.env.BENCH_DATABASE_URL);const expected=Number(process.env.BENCH_COUNT)
  if(expected!==10_000&&expected!==50_000)throw new Error('BENCH_COUNT must be 10000 or 50000')
  const url=new URL(BASE_URL);if(!['127.0.0.1','localhost'].includes(url.hostname)||url.protocol!=='http:'||url.pathname!=='/'||url.search||url.hash)throw new Error('BENCH_API_URL must be a local HTTP origin')
  const first=await identity(expected);const git=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'})
  console.log(JSON.stringify({kind:'metadata',variant:'paged',apiUrl:BASE_URL,database:connection.database,count:expected,seed:20260922,gitCommit:git.status===0?git.stdout.trim():null,mysqlVersion:first.mysqlVersion,node:process.version,platform:process.platform,arch:process.arch,cpu:cpus()[0]?.model,logicalCpus:cpus().length,totalMemoryBytes:totalmem(),timestamp:new Date().toISOString()}))
  const scenarios=[['all','?page=0&size=24'],['area-star','?areas=%E9%BB%84%E6%B5%A6%E5%8C%BA&starLevels=5&page=0&size=24'],['price','?priceBands=300to449%2C450to599&page=0&size=24'],['keyword','?keyword=%E5%9F%BA%E5%87%86%E9%85%92%E5%BA%97&page=0&size=24']] as const
  for(const [name,query] of scenarios){const values:number[]=[];let bytes=0;let timeout=false;let heapPeak=(await identity(expected)).heap;for(let index=0;index<WARMUP+SAMPLES;index++){try{const result=await sample(query);if(index>=WARMUP){values.push(result.ms);bytes=result.bytes}heapPeak=Math.max(heapPeak,(await identity(expected)).heap)}catch(error){if((error as Error).name==='TimeoutError'){timeout=true;break}throw error}}console.log(JSON.stringify({scenario:name,warmup:WARMUP,samples:values.length,timeout,p50Ms:values.length?percentile(values,.5):null,p95Ms:values.length?percentile(values,.95):null,responseKB:bytes?bytes/1024:null,sampledServerHeapPeakBytes:heapPeak}))}
}
if(require.main===module)void main().catch((error:unknown)=>{console.error(error instanceof Error?error.message:'Paged benchmark failed');process.exitCode=1})
