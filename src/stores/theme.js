import { defineStore } from 'pinia'

const STORAGE_KEY = 'app-theme'

/** @typedef {'light' | 'dark'} ThemeMode */

function readStoredMode() {
  if (typeof localStorage === 'undefined') return 'light'
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'dark' ? 'dark' : 'light'
}

/**
 * 全局主题（浅色 / 深色）
 * - 与 html 根节点 class「dark」联动，供 Element Plus 深色变量使用
 * - localStorage 持久化，键名：app-theme
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    /** @type {ThemeMode} */
    mode: readStoredMode(),
  }),

  getters: {
    isDark: (state) => state.mode === 'dark',
  },

  actions: {
    /** 将当前 mode 同步到 <html class="dark"> 与 localStorage */
    apply() {
      const root = document.documentElement
      if (this.mode === 'dark') {
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
      } else {
        root.classList.remove('dark')
        root.style.colorScheme = 'light'
      }
      localStorage.setItem(STORAGE_KEY, this.mode)
    },

    /** 应用存储中的主题（启动时调用，与 index.html 内联脚本一致） */
    init() {
      this.mode = readStoredMode()
      this.apply()
    },

    /** @param {ThemeMode} mode */
    setMode(mode) {
      this.mode = mode
      this.apply()
    },

    toggle() {
      this.setMode(this.mode === 'dark' ? 'light' : 'dark')
    },
  },
})
