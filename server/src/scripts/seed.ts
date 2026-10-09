import { writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { ConfigService } from '@nestjs/config'
import { restoreOriginalHotels } from './seed-hotels'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { DatabaseService } from '../database/database.service'

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false })
  try {
    const config = app.get(ConfigService)
    const host = config.get<string>('DATABASE_HOST')?.trim()
    if (!['127.0.0.1', 'localhost', '::1'].includes(host ?? '')) throw new Error('Hotel restoration is limited to a local development database')
    const db = app.get(DatabaseService)
    const hadHotels = (await db.hotels.count()) > 0
    console.log('Local seed target:', host, config.get<string>('DATABASE_NAME'))
    const hotels = await restoreOriginalHotels(db, async (snapshot) => {
      const backup = resolve(__dirname, '../../', 'hotel-restore-' + Date.now() + '-' + randomUUID() + '.local')
      await writeFile(backup, JSON.stringify(snapshot, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2), { flag: 'wx' })
      console.log('Hotel backup:', backup)
      console.log(snapshot.actions.join('\n'))
    })
    console.log('Restored hotels:', hotels.map((hotel) => hotel.name + ' (ID ' + hotel.id + ')').join(', '))
    if (hadHotels) return
  await db.pois.createMany({ data: [
    { name: '外滩', type: 'ATTRACTION', area: '黄浦区', address: '中山东一路', latitude: '31.2400100', longitude: '121.4904900', opening_hours: '全天开放', ticket_price: '0', suggested_duration_minutes: 120, description: '上海经典滨水景观。', image_url: '/images/banner-1.jpg', rating: '4.8', recommended: true, active: true },
    { name: '豫园', type: 'ATTRACTION', area: '黄浦区', address: '福佑路168号', latitude: '31.2271000', longitude: '121.4921200', opening_hours: '09:00-16:30', ticket_price: '40', suggested_duration_minutes: 120, description: '江南古典园林。', image_url: '/images/banner-3.jpg', rating: '4.6', recommended: true, active: true },
    { name: '小杨生煎黄河路店', type: 'RESTAURANT', area: '黄浦区', address: '黄河路97号', latitude: '31.2358200', longitude: '121.4701300', opening_hours: '07:00-21:30', average_price: '35', suggested_duration_minutes: 60, description: '上海本地小吃。', image_url: '/images/1.jpg', rating: '4.5', recommended: true, active: true },
  ] })
  const pois = await db.pois.findMany({ select: { id: true, name: true } })
  await db.poi_tags.createMany({ data: pois.flatMap((poi) => poi.name === '外滩' ? [{ poi_id: poi.id, tag: '城市地标' }, { poi_id: poi.id, tag: '夜景' }] : [{ poi_id: poi.id, tag: poi.name === '豫园' ? '古典园林' : '上海小吃' }]) })
  console.log(`Seeded ${hotels.length} hotels and ${pois.length} POIs.`)
  } finally {
    await app.close()
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Hotel seed failed')
  process.exitCode = 1
})
