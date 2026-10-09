import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { HealthModule } from './health/health.module'
import { CommonModule } from './common/common.module'
import { UsersModule } from './users/users.module'
import { HotelsModule } from './hotels/hotels.module'
import { PoisModule } from './pois/pois.module'
import { UserDataModule } from './user-data/user-data.module'
import { BookingsModule } from './bookings/bookings.module'
import { ItinerariesModule } from './itineraries/itineraries.module'
import { AnalyticsModule } from './analytics/analytics.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }), DatabaseModule, CommonModule, HealthModule, UsersModule, HotelsModule, PoisModule, UserDataModule, BookingsModule, ItinerariesModule, AnalyticsModule],
})
export class AppModule {}
