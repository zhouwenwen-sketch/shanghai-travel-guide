import { Module } from '@nestjs/common'
import { FavoritesController } from './favorites.controller'
import { HistoryController } from './history.controller'
import { UserDataService } from './user-data.service'
import { UsersModule } from '../users/users.module'

@Module({ imports: [UsersModule], controllers: [FavoritesController, HistoryController], providers: [UserDataService] })
export class UserDataModule {}
