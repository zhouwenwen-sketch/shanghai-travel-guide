import api from './index'
import type { LoginResult } from '@/types'

const DEMO_USER = { userId: 1, username: 'demo', password: '123456' }

export async function login(username: string, password: string): Promise<LoginResult> {
  try {
    return await api.post('/users/login', { username, password })
  } catch {
    if (username === DEMO_USER.username && password === DEMO_USER.password) {
      return { userId: DEMO_USER.userId, username: DEMO_USER.username }
    }
    throw new Error('用户名或密码错误（演示账号: demo / 123456）')
  }
}

export async function register(username: string, password: string): Promise<LoginResult> {
  try {
    return await api.post('/users/register', { username, password })
  } catch {
    return { userId: Date.now(), username }
  }
}
