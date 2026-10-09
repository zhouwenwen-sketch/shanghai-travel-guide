import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, UnauthorizedException } from '@nestjs/common'
import { IsInt, IsNotEmpty, IsPositive, IsString, Length, Matches, Max, Min } from 'class-validator'
import { ok } from '../common/api-result'
import { UsersService } from '../users/users.service'
import { BookingsService } from './bookings.service'

class CreateBookingRequest {
  @IsInt() @IsPositive() hotelId!: number
  @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) checkIn!: string
  @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) checkOut!: string
  @IsInt() @Min(1) @Max(10) guestCount!: number
  @IsString() @IsNotEmpty() @Matches(/\S/) @Length(1, 80) contactName!: string
  @IsString() @Matches(/^[0-9+() -]{6,30}$/) contactPhone!: string
}

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly users: UsersService, private readonly bookings: BookingsService) {}
  @Post() async create(@Headers('authorization') authorization: string | undefined, @Headers('idempotency-key') key: string | undefined, @Body() body: CreateBookingRequest) { return ok(await this.bookings.create(await this.userId(authorization), key, body)) }
  @Get() async list(@Headers('authorization') authorization?: string) { return ok(await this.bookings.list(await this.userId(authorization))) }
  @Get(':id') async get(@Headers('authorization') authorization: string | undefined, @Param('id', ParseIntPipe) id: number) { return ok(await this.bookings.get(await this.userId(authorization), id)) }
  @Post(':id/cancel') async cancel(@Headers('authorization') authorization: string | undefined, @Headers('if-match') ifMatch: string | undefined, @Param('id', ParseIntPipe) id: number) { return ok(await this.bookings.cancel(await this.userId(authorization), id, ifMatch)) }
  private async userId(value?: string) { const token = value?.match(/^Bearer\s+(.+)$/i)?.[1]; if (!token) throw new UnauthorizedException('未登录或登录已过期'); return this.users.requireUserId(token) }
}
