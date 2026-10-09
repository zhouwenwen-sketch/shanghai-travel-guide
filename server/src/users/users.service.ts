import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { DatabaseService } from '../database/database.service'

type Credentials = { username: string; password: string }
type Claims = { sub: string; roles: string[]; exp: number; iss: string }

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService, private readonly config: ConfigService) {}

  async register(request: Credentials) {
    validateCredentials(request)
    const existing = await this.db.users.findUnique({ where: { username: request.username } })
    if (existing) throw new ConflictException('用户名已存在')
    let user
    try {
      user = await this.db.users.create({ data: { username: request.username, password: await bcrypt.hash(request.password, 10), created_at: new Date(), role: 'USER' } })
    } catch (error) {
      if (isUniqueConstraint(error)) throw new ConflictException('用户名已存在')
      throw error
    }
    return this.issue(user)
  }

  async login(request: Credentials) {
    validateCredentials(request)
    const user = await this.db.users.findUnique({ where: { username: request.username } })
    if (!user || !(await bcrypt.compare(request.password, user.password))) throw new UnauthorizedException('用户名或密码错误')
    return this.issue(user)
  }

  async me(token: string) {
    const user = await this.requireUser(token)
    if (!user) throw new UnauthorizedException('未登录或登录已过期')
    return userSummary(user)
  }

  async requireUserId(token: string): Promise<bigint> { return (await this.requireUser(token)).id }

  async requireUser(token: string) {
    const claims = this.verify(token)
    const user = await this.db.users.findUnique({ where: { id: BigInt(claims.sub) } })
    if (!user) throw new UnauthorizedException('未登录或登录已过期')
    return user
  }

  private issue(user: { id: bigint; username: string; role: string }) {
    const ttl = Number(this.config.get<string>('JWT_TTL_SECONDS') ?? 7200)
    const expiresAt = new Date(Date.now() + ttl * 1000)
    const payload: Claims = { sub: user.id.toString(), roles: [user.role], exp: Math.floor(expiresAt.getTime() / 1000), iss: 'shanghai-travel-backend' }
    const token = this.sign(payload)
    return { accessToken: token, tokenType: 'Bearer', expiresAt: expiresAt.toISOString(), user: userSummary(user) }
  }

  private sign(payload: Claims): string {
    const encodedHeader = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const encodedPayload = base64url(JSON.stringify(payload))
    const input = `${encodedHeader}.${encodedPayload}`
    return `${input}.${createHmac('sha256', this.secret()).update(input).digest('base64url')}`
  }

  private verify(token: string): Claims {
    const [header, payload, signature, extra] = token.split('.')
    if (!header || !payload || !signature || extra) throw new UnauthorizedException('未登录或登录已过期')
    const input = `${header}.${payload}`
    const expected = createHmac('sha256', this.secret()).update(input).digest()
    let actual: Buffer
    try { actual = Buffer.from(signature, 'base64url') } catch { throw new UnauthorizedException('未登录或登录已过期') }
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new UnauthorizedException('未登录或登录已过期')
    try {
      const decodedHeader = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'))
      if (decodedHeader?.alg !== 'HS256' || (decodedHeader.typ !== undefined && decodedHeader.typ !== 'JWT')) throw new Error()
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Claims
      if (claims?.iss !== 'shanghai-travel-backend' || typeof claims.sub !== 'string' || !/^[1-9]\d{0,18}$/.test(claims.sub) || BigInt(claims.sub) > 9223372036854775807n || !Array.isArray(claims.roles) || !claims.roles.length || !claims.roles.every(role => typeof role === 'string') || !Number.isSafeInteger(claims.exp) || claims.exp <= Math.floor(Date.now() / 1000)) throw new Error()
      return claims
    } catch { throw new UnauthorizedException('未登录或登录已过期') }
  }

  private secret(): string {
    const secret = this.config.get<string>('JWT_SECRET')
    if (!secret || Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET must contain at least 32 bytes')
    return secret
  }
}

function validateCredentials(request: Credentials): void {
  if (typeof request.username !== 'string' || !request.username.trim() || typeof request.password !== 'string' || !request.password.trim()) throw new BadRequestException('用户名和密码不能为空白')
}

function base64url(value: string): string { return Buffer.from(value).toString('base64url') }

function userSummary(user: { id: bigint; username: string; role: string }) {
  return { userId: Number(user.id), username: user.username, role: user.role }
}

function isUniqueConstraint(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
}
