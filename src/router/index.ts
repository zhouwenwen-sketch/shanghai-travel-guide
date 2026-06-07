import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/index.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
  },
  {
    path: '/hotel/:id',
    name: 'hotel-detail',
    component: () => import('@/views/hotel-detail.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/search-result.vue'),
  },
  {
    path: '/user',
    name: 'user-center',
    component: () => import('@/views/user-center.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  if (to.path === '/login' && userStore.isLoggedIn) {
    next({ path: '/' })
    return
  }
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

export default router
