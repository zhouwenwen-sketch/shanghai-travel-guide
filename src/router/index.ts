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
  { path: '/pois', name: 'pois', component: () => import('@/views/pois.vue') },
  { path: '/pois/:id', name: 'poi-detail', component: () => import('@/views/poi-detail.vue') },
  { path: '/admin/pois', name: 'admin-pois', component: () => import('@/views/admin-pois.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/analytics', name: 'admin-analytics', component: () => import('@/views/admin-analytics.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  {
    path: '/user',
    name: 'user-center',
    component: () => import('@/views/user-center.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/bookings', name: 'bookings', component: () => import('@/views/bookings.vue'), meta: { requiresAuth: true } },
  { path: '/itineraries', name: 'itineraries', component: () => import('@/views/itineraries.vue'), meta: { requiresAuth: true } },
  { path: '/itineraries/:id', name: 'itinerary-editor', component: () => import('@/views/itinerary-editor.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach((to, from, failure) => {
  if (failure || to.name !== 'home' || from.name === 'home') return
  void import('@/api/analytics').then(({ recordHomeView }) =>
    import('@/utils/analytics-session').then(({ createHomeViewEvent }) => recordHomeView(createHomeViewEvent()))
  ).catch(() => {})
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
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ path: '/', query: { denied: 'admin' } })
    return
  }
  next()
})

export default router
