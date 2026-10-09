import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common'
import { IsNotEmpty, IsString, Length } from 'class-validator'
import { ok } from '../common/api-result'
import { UsersService } from './users.service'

class LoginRequest {
  @IsString() @IsNotEmpty() @Length(2, 50) username!: string
  @IsString() @IsNotEmpty() @Length(6, 64) password!: string
}

@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('register')
  async register(@Body() request: LoginRequest) { return ok(await this.users.register(request)) }

  @Post('login')
  async login(@Body() request: LoginRequest) { return ok(await this.users.login(request)) }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
    if (!token) throw new UnauthorizedException('未登录或登录已过期')
    return ok(await this.users.me(token))
  }
}
