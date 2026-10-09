import { Body, Controller, Delete, Get, Headers, ParseIntPipe, Post, Query, UnauthorizedException } from '@nestjs/common'
import { IsInt, IsPositive } from 'class-validator'
import { ok } from '../common/api-result'
import { UsersService } from '../users/users.service'
import { UserDataService } from './user-data.service'

class HotelIdRequest { @IsInt() @IsPositive() hotelId!: number }

@Controller('api/favorites')
export class FavoritesController {
  constructor(private readonly users: UsersService, private readonly data: UserDataService) {}
  @Get() async list(@Headers('authorization') authorization?: string) { return ok(await this.data.listFavorites(await this.userId(authorization))) }
  @Post() async add(@Headers('authorization') authorization: string | undefined, @Body() body: HotelIdRequest) { return ok(await this.data.addFavorite(await this.userId(authorization), body.hotelId)) }
  @Delete() async remove(@Headers('authorization') authorization: string | undefined, @Query('hotelId', ParseIntPipe) hotelId: number) { await this.data.removeFavorite(await this.userId(authorization), hotelId); return ok() }
  @Get('check') async check(@Headers('authorization') authorization: string | undefined, @Query('hotelId', ParseIntPipe) hotelId: number) { return ok(await this.data.isFavorite(await this.userId(authorization), hotelId)) }
  private async userId(value?: string) { const token = value?.match(/^Bearer\s+(.+)$/i)?.[1]; if (!token) throw new UnauthorizedException('未登录或登录已过期'); return this.users.requireUserId(token) }
}
