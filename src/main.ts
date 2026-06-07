import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/css/common.css'
import '@/assets/css/index.css'
import '@/assets/css/dark-mode.css'
import '@/assets/font/iconfont.css'
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
useThemeStore().init()
app.use(router).mount('#app')
