import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router/index'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/css/common.css'
import '@/assets/css/index.css'
import '@/assets/css/dark-mode.css'
import '@/assets/font/iconfont.css'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { configureAuth } from '@/api'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
useThemeStore().init()
const userStore = useUserStore()
userStore.clearExpiredSession()
configureAuth({
  getAccessToken: () => userStore.getValidAccessToken(),
  onUnauthorized: (requestToken) => {
    if (userStore.accessToken !== requestToken) return
    userStore.logout()
    if (router.currentRoute.value.meta.requiresAuth) {
      router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    }
  },
})
app.use(router).mount('#app')
