import { createApp } from 'vue'
import { createPinia } from 'pinia'
//import './style.css'
import App from './App.vue'
import router from './router/index.js'//导入路由 ./表示当前目录，../表示上一级目录,@/表示src根目录
// Element Plus 深色模式 CSS 变量（依赖 html.dark）
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/css/common.css' //导入公共样式
import '@/assets/css/index.css'//导入全局样式
import '@/assets/css/dark-mode.css'
import '@/assets/font/iconfont.css'//导入字体图标，在https://www.iconfont.cn/下载
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
useThemeStore().init()
// Pinia 先于 Router 注册，路由守卫里可安全使用 useUserStore()
app.use(router).mount('#app')

