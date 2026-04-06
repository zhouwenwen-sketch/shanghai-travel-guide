import { defineStore } from 'pinia'

const LS_LOGIN = 'isLogin'
const LS_USERNAME = 'username'
/* 模拟「注册表」：{ 用户名: 密码 }，仅本地演示用，勿用于真实项目 */
const LS_MOCK_USERS = 'mock_users'

function loadMockUsers() {
  try {
    const raw = localStorage.getItem(LS_MOCK_USERS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveMockUsers(users) {
  localStorage.setItem(LS_MOCK_USERS, JSON.stringify(users))
}

/*
 * 用户登录状态（Pinia 集中管理 + localStorage 持久化，刷新不丢）
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    /* 是否已登录 */
    isLoggedIn: localStorage.getItem(LS_LOGIN) === 'true',
    /* 当前用户名 */
    username: localStorage.getItem(LS_USERNAME) || '',
  }),

  getters: {
    /* 展示用：未登录显示「游客」等 */
    displayName: (state) => state.username || '游客',
    /* 是否已登录（与 state 同步，模板里可读性更好） */
    isLogin: (state) => state.isLoggedIn,
  },

  actions: {
    /*
     * 登录（前端模拟）
     * - 该用户名第一次登录：视为注册，保存用户名+密码
     * - 之后同一用户名：必须密码与首次一致，否则拒绝
     * 真实项目应改为请求后端校验，切勿在本地存明文密码
     */
    login(username, password) {
      if (!username?.trim() || !password) {
        return { ok: false, message: '请输入用户名和密码' }
      }
      const name = username.trim()
      const users = loadMockUsers()

      if (Object.prototype.hasOwnProperty.call(users, name)) {
        if (users[name] !== password) {
          return { ok: false, message: '密码错误' }
        }
      } else {
        users[name] = password
        saveMockUsers(users)
      }

      this.isLoggedIn = true
      this.username = name
      localStorage.setItem(LS_LOGIN, 'true')
      localStorage.setItem(LS_USERNAME, name)
      return { ok: true }
    },

    /* 退出登录 */
    logout() {
      this.isLoggedIn = false
      this.username = ''
      localStorage.removeItem(LS_LOGIN)
      localStorage.removeItem(LS_USERNAME)
    },

    /* 与 localStorage 对齐（多标签页等场景可扩展） */
    syncFromStorage() {
      this.isLoggedIn = localStorage.getItem(LS_LOGIN) === 'true'
      this.username = localStorage.getItem(LS_USERNAME) || ''
    },
  },
})
