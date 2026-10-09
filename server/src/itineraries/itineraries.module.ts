import { Module } from '@nestjs/common'
import { ItinerariesController } from './itineraries.controller'
import { ItinerariesService } from './itineraries.service'
import { UsersModule } from '../users/users.module'

@Module({ imports: [UsersModule], controllers: [ItinerariesController], providers: [ItinerariesService] })
export class ItinerariesModule {}
