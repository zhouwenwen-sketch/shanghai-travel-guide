import { Body, Controller, Delete, Get, Headers, Post, UnauthorizedException } from '@nestjs/common'
import { IsInt, IsPositive } from 'class-validator'
import { ok } from '../common/api-result'
import { UsersService } from '../users/users.service'
import { UserDataService } from './user-data.service'

class HotelIdRequest { @IsInt() @IsPositive() hotelId!: number }

@Controller('api/history')
export class HistoryController {
  constructor(private readonly users: UsersService, private readonly data: UserDataService) {}
  @Get() async list(@Headers('authorization') authorization?: string) { return ok(await this.data.listHistory(await this.userId(authorization))) }
  @Post() async add(@Headers('authorization') authorization: string | undefined, @Body() body: HotelIdRequest) { return ok(await this.data.addHistory(await this.userId(authorization), body.hotelId)) }
  @Delete() async clear(@Headers('authorization') authorization?: string) { await this.data.clearHistory(await this.userId(authorization)); return ok() }
  private async userId(value?: string) { const token = value?.match(/^Bearer\s+(.+)$/i)?.[1]; if (!token) throw new UnauthorizedException('未登录或登录已过期'); return this.users.requireUserId(token) }
}
