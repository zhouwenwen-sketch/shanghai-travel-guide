import { defineStore } from 'pinia'
import type { User } from '@/types'
import { login as loginApi, register as registerApi } from '@/api/user'

const LS_USER_ID = 'user_id'
const LS_USERNAME = 'username'

interface UserState {
  userId: number | null
  username: string
  isLoggedIn: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userId: localStorage.getItem(LS_USER_ID) ? Number(localStorage.getItem(LS_USER_ID)) : null,
    username: localStorage.getItem(LS_USERNAME) || '',
    isLoggedIn: !!localStorage.getItem(LS_USER_ID),
  }),

  getters: {
    displayName: (state): string => state.username || '游客',
    isLogin: (state): boolean => state.isLoggedIn,
  },

  actions: {
    async login(username: string, password: string): Promise<void> {
      if (!username?.trim() || !password) {
        throw new Error('请输入用户名和密码')
      }
      const data = await loginApi(username.trim(), password)
      this.userId = data.userId
      this.username = data.username
      this.isLoggedIn = true
      localStorage.setItem(LS_USER_ID, String(data.userId))
      localStorage.setItem(LS_USERNAME, data.username)
    },

    async register(username: string, password: string): Promise<void> {
      if (!username?.trim() || !password) {
        throw new Error('请输入用户名和密码')
      }
      const data = await registerApi(username.trim(), password)
      this.userId = data.userId
      this.username = data.username
      this.isLoggedIn = true
      localStorage.setItem(LS_USER_ID, String(data.userId))
      localStorage.setItem(LS_USERNAME, data.username)
    },

    logout(): void {
      this.userId = null
      this.username = ''
      this.isLoggedIn = false
      localStorage.removeItem(LS_USER_ID)
      localStorage.removeItem(LS_USERNAME)
    },
  },
})
