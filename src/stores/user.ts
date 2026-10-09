import { defineStore } from 'pinia'
import type { UserRole } from '@/types'
import { login as loginApi, register as registerApi } from '@/api/user'

interface UserState {
  userId: number | null
  username: string
  accessToken: string
  expiresAt: string
  role: UserRole
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userId: null,
    username: '',
    accessToken: '',
    expiresAt: '',
    role: 'USER',
  }),

  getters: {
    isLoggedIn: (state): boolean => Boolean(
      state.userId !== null &&
      state.accessToken &&
      state.expiresAt &&
      Date.parse(state.expiresAt) > Date.now()
    ),
    displayName: (state): string => state.username || '游客',
    isAdmin: (state): boolean => state.role === 'ADMIN',
  },

  actions: {
    getValidAccessToken(): string | null {
      if (!this.isLoggedIn) {
        if (this.userId !== null || this.username || this.accessToken || this.expiresAt) {
          this.logout()
        }
        return null
      }
      return this.accessToken
    },

    clearExpiredSession(): void {
      this.getValidAccessToken()
    },

    async login(username: string, password: string): Promise<void> {
      if (!username?.trim() || !password) {
        throw new Error('请输入用户名和密码')
      }
      const data = await loginApi(username.trim(), password)
      this.applySession(data)
    },

    async register(username: string, password: string): Promise<void> {
      if (!username?.trim() || !password) {
        throw new Error('请输入用户名和密码')
      }
      const data = await registerApi(username.trim(), password)
      this.applySession(data)
    },

    applySession(data: import('@/types').LoginResult): void {
      this.userId = data.user.userId
      this.username = data.user.username
      this.accessToken = data.accessToken
      this.expiresAt = data.expiresAt
      this.role = data.user.role || 'USER'
    },

    logout(): void {
      this.userId = null
      this.username = ''
      this.accessToken = ''
      this.expiresAt = ''
      this.role = 'USER'
    },
  },

  persist: {
    key: 'user',
    pick: ['userId', 'username', 'accessToken', 'expiresAt', 'role'],
  },
})
