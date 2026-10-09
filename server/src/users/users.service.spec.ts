import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common'
import { createHmac } from 'node:crypto'
import * as bcrypt from 'bcryptjs'
import { UsersService } from './users.service'

const config = { get: jest.fn((key: string) => key === 'JWT_SECRET' ? 'test-secret-with-at-least-thirty-two-bytes' : key === 'JWT_TTL_SECONDS' ? '3600' : undefined) } as any

describe('UsersService', () => {
  it('registers only USER accounts and returns the documented userId field', async () => {
    const db = { users: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 7n, username: 'alice', role: 'USER' }) } } as any
    const result = await new UsersService(db, config).register({ username: 'alice', password: 'secure123' })
    expect(db.users.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ role: 'USER' }) }))
    expect(result.user).toEqual({ userId: 7, username: 'alice', role: 'USER' })
    expect(result.tokenType).toBe('Bearer')
  })

  it('rejects duplicate usernames before writing', async () => {
    const db = { users: { findUnique: jest.fn().mockResolvedValue({ id: 1n }), create: jest.fn() } } as any
    await expect(new UsersService(db, config).register({ username: 'alice', password: 'secure123' })).rejects.toBeInstanceOf(ConflictException)
    expect(db.users.create).not.toHaveBeenCalled()
  })

  it('does not issue a token when password verification fails', async () => {
    const db = { users: { findUnique: jest.fn().mockResolvedValue({ id: 1n, username: 'alice', role: 'USER', password: '$2b$10$Z8U60rC5cuzQ46P4yA8Yx.n07WTXI9srPE2AJ.IiznN1nlnz9I4Dy' }) } } as any
    await expect(new UsersService(db, config).login({ username: 'alice', password: 'wrong-password' })).rejects.toBeInstanceOf(UnauthorizedException)
  })
})

describe('credential and JWT regressions', () => {
  const user = { id: 7n, username: 'alice', role: 'USER' }
  const validClaims = () => ({ sub: '7', roles: ['USER'], exp: Math.floor(Date.now() / 1000) + 3600, iss: 'shanghai-travel-backend' })
  function signed(claims: unknown, header: unknown = { alg: 'HS256', typ: 'JWT' }) {
    const input = [header, claims].map(value => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.')
    return `${input}.${createHmac('sha256', config.get('JWT_SECRET')!).update(input).digest('base64url')}`
  }

  it('keeps normal registration, login and repeated profile reads working', async () => {
    const db = { users: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn(async ({ data }) => ({ ...user, password: data.password })) } } as any
    const service = new UsersService(db, config)
    const registered = await service.register({ username: 'alice', password: 'secure123' })
    db.users.findUnique.mockResolvedValue({ ...user, password: await bcrypt.hash('secure123', 4) })
    expect((await service.login({ username: 'alice', password: 'secure123' })).user).toEqual(registered.user)
    for (let i = 0; i < 2; i++) expect(await service.me(registered.accessToken)).toEqual(registered.user)
    expect(db.users.create).toHaveBeenCalledTimes(1)
  })

  it.each([{ username: '  ', password: 'secure123' }, { username: 'alice', password: '      ' }])('rejects blank credentials before any database operation: %j', async credentials => {
    const db = { users: { findUnique: jest.fn(), create: jest.fn() } } as any
    const service = new UsersService(db, config)
    for (let i = 0; i < 2; i++) {
      await expect(service.register(credentials)).rejects.toBeInstanceOf(BadRequestException)
      await expect(service.login(credentials)).rejects.toBeInstanceOf(BadRequestException)
    }
    expect(db.users.findUnique).not.toHaveBeenCalled()
    expect(db.users.create).not.toHaveBeenCalled()
  })

  it('accepts one second before expiry and rejects the exact expiry boundary', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-02T00:00:00Z'))
    try {
      const db = { users: { findUnique: jest.fn().mockResolvedValue(user) } } as any
      const service = new UsersService(db, config)
      expect(await service.requireUser(signed({ ...validClaims(), exp: Math.floor(Date.now() / 1000) + 1 }))).toEqual(user)
      await expect(service.requireUser(signed({ ...validClaims(), exp: Math.floor(Date.now() / 1000) }))).rejects.toBeInstanceOf(UnauthorizedException)
      expect(db.users.findUnique).toHaveBeenCalledTimes(1)
    } finally { jest.useRealTimers() }
  })

  it.each([
    { exp: undefined }, { exp: 'tomorrow' }, { exp: String(Math.floor(Date.now() / 1000) + 3600) },
    { exp: 1.5 }, { sub: 'abc' }, { sub: '0' }, { sub: '9223372036854775808' }, { sub: 7 }, { roles: [1] },
  ])('rejects signed malformed claims with 401 before querying the database: %j', async patch => {
    const db = { users: { findUnique: jest.fn() } } as any
    const service = new UsersService(db, config)
    await expect(service.requireUser(signed({ ...validClaims(), ...patch }))).rejects.toBeInstanceOf(UnauthorizedException)
    expect(db.users.findUnique).not.toHaveBeenCalled()
  })

  it('rejects a signed token declaring an unsupported algorithm', async () => {
    const db = { users: { findUnique: jest.fn() } } as any
    await expect(new UsersService(db, config).requireUser(signed(validClaims(), { alg: 'none' }))).rejects.toBeInstanceOf(UnauthorizedException)
    expect(db.users.findUnique).not.toHaveBeenCalled()
  })
})
