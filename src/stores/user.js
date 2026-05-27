import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi } from '@/api/user'

const LS_USER_ID = 'user_id'
const LS_USERNAME = 'username'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: localStorage.getItem(LS_USER_ID) ? Number(localStorage.getItem(LS_USER_ID)) : null,
    username: localStorage.getItem(LS_USERNAME) || '',
    isLoggedIn: !!localStorage.getItem(LS_USER_ID),
  }),

  getters: {
    displayName: (state) => state.username || '游客',
    isLogin: (state) => state.isLoggedIn,
  },

  actions: {
    async login(username, password) {
      if (!username?.trim() || !password) {
        throw new Error('请输入用户名和密码')
      }
      const data = await loginApi(username.trim(), password)
      this.userId = data.userId
      this.username = data.username
      this.isLoggedIn = true
      localStorage.setItem(LS_USER_ID, data.userId)
      localStorage.setItem(LS_USERNAME, data.username)
    },

    async register(username, password) {
      if (!username?.trim() || !password) {
        throw new Error('请输入用户名和密码')
      }
      const data = await registerApi(username.trim(), password)
      this.userId = data.userId
      this.username = data.username
      this.isLoggedIn = true
      localStorage.setItem(LS_USER_ID, data.userId)
      localStorage.setItem(LS_USERNAME, data.username)
    },

    logout() {
      this.userId = null
      this.username = ''
      this.isLoggedIn = false
      localStorage.removeItem(LS_USER_ID)
      localStorage.removeItem(LS_USERNAME)
    },
  },
})
