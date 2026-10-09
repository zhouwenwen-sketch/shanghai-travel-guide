import api from './index'

export interface HomeAnalyticsDay { date: string; pv: number; uv: number; sessions: number }
export interface HomeAnalytics { summary: Omit<HomeAnalyticsDay, 'date'>; daily: HomeAnalyticsDay[] }

export const recordHomeView = (event: ReturnType<typeof import('@/utils/analytics-session').createHomeViewEvent>): Promise<{ accepted: true }> =>
  api.post('/analytics/home-view', event)

export const getHomeAnalytics = (start: string, end: string): Promise<HomeAnalytics> =>
  api.get('/admin/analytics/home', { params: { start, end } })
