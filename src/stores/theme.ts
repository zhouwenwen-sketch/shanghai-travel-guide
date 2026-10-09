import { defineStore } from 'pinia'
import type { ThemeMode } from '@/types'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'light' as ThemeMode,
  }),

  getters: {
    isDark: (state): boolean => state.mode === 'dark',
  },

  actions: {
    apply(): void {
      const root = document.documentElement
      if (this.mode === 'dark') {
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
      } else {
        root.classList.remove('dark')
        root.style.colorScheme = 'light'
      }
    },

    init(): void {
      // 持久化状态已被插件自动水合，只需应用到 DOM
      this.apply()
    },

    setMode(mode: ThemeMode): void {
      this.mode = mode
      this.apply()
    },

    toggle(): void {
      this.setMode(this.mode === 'dark' ? 'light' : 'dark')
    },
  },

  persist: {
    key: 'app-theme',
    pick: ['mode'],
  },
})
