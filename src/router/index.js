// 1. 引入vue-router
import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 2. 定义路由规则
const routes = [
  {
    path: '/',  //路径
    name: 'home', //名字
    component: () => import('@/views/index.vue'),
    // 需要登录才能访问时加上：meta: { requiresAuth: true }
  },
  // 登录页面的路由规则
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
  },
]

// 3. 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 4. 路由守卫：用 Pinia 判断登录态（需在 main.js 中先 app.use(pinia) 再 use(router)）
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 已登录访问登录页 → 直接去首页
  if (to.path === '/login' && userStore.isLoggedIn) {
    next({ path: '/' })
    return
  }
  // 示例：某路由 meta.requiresAuth 时需登录（按需给路由加 meta）
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

// 5. 导出路由，供 main.js 使用
export default router