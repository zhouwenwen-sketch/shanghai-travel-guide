import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { AdminAnalyticsController, AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'
import { UsersModule } from '../users/users.module'

@Module({ imports: [CommonModule, UsersModule], controllers: [AnalyticsController, AdminAnalyticsController], providers: [AnalyticsService] })
export class AnalyticsModule {}
