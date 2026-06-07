import { defineStore } from 'pinia'
import type { ThemeMode } from '@/types'

const STORAGE_KEY = 'app-theme'

function readStoredMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light'
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'dark' ? 'dark' : 'light'
}

interface ThemeState {
  mode: ThemeMode
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    mode: readStoredMode(),
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
      localStorage.setItem(STORAGE_KEY, this.mode)
    },

    init(): void {
      this.mode = readStoredMode()
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
})
