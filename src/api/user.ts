import api from './index'
import type { LoginResult, User } from '@/types'

export async function login(username: string, password: string): Promise<LoginResult> {
  return await api.post('/users/login', { username, password })
}

export async function register(username: string, password: string): Promise<LoginResult> {
  return await api.post('/users/register', { username, password })
}

export async function getMe(): Promise<User> {
  return await api.get('/users/me')
}
