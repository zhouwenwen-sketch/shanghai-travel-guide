import { BadRequestException, Body, Controller, ForbiddenException, Get, Headers, HttpCode, Post, Query, UnauthorizedException } from '@nestjs/common'
import { ok } from '../common/api-result'
import { ClockService } from '../common/clock.service'
import { UsersService } from '../users/users.service'
import { AnalyticsService } from './analytics.service'
import { HomeViewDto } from './home-view.dto'

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('home-view')
  @HttpCode(200)
  async recordHomeView(@Body() body: HomeViewDto) {
    return ok(await this.analytics.recordHomeView(body))
  }

}

@Controller('api/admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly analytics: AnalyticsService, private readonly users: UsersService, private readonly clock: ClockService) {}

  @Get('home')
  async homeStats(@Headers('authorization') authorization: string | undefined, @Query('start') start?: string, @Query('end') end?: string) {
    await this.admin(authorization)
    const today = this.clock.todayInShanghai()
    const rangeEnd = end ?? today
    if (!isDate(rangeEnd)) throw new BadRequestException('日期范围无效')
    const rangeStart = start ?? shiftDate(rangeEnd, -6)
    if (!isDate(rangeStart) || !isDate(rangeEnd) || rangeStart > rangeEnd) throw new BadRequestException('日期范围无效')
    const days = (Date.parse(`${rangeEnd}T00:00:00Z`) - Date.parse(`${rangeStart}T00:00:00Z`)) / 86400000 + 1
    if (days > 90) throw new BadRequestException('日期范围不能超过90天')
    return ok(await this.analytics.homeStats(rangeStart, rangeEnd))
  }

  private async admin(value?: string) {
    const token = value?.match(/^Bearer\s+(.+)$/i)?.[1]
    if (!token) throw new UnauthorizedException('未登录或登录已过期')
    if ((await this.users.requireUser(token)).role !== 'ADMIN') throw new ForbiddenException('无权限访问')
  }
}

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}
function shiftDate(value: string, offset: number): string {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}
