import { Module } from '@nestjs/common'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { UsersModule } from '../users/users.module'

@Module({ imports: [UsersModule], controllers: [BookingsController], providers: [BookingsService] })
export class BookingsModule {}
