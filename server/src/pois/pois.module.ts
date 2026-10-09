import { Module } from '@nestjs/common'
import { PoisController } from './pois.controller'
import { AdminPoisController } from './admin-pois.controller'
import { PoisService } from './pois.service'
import { UsersModule } from '../users/users.module'

@Module({ imports: [UsersModule], controllers: [PoisController, AdminPoisController], providers: [PoisService] })
export class PoisModule {}
