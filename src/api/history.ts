import api from './index'
import type { BrowseHistory } from '@/types'

export async function getHistory(userId: number): Promise<BrowseHistory[]> {
  return await api.get('/history', { params: { userId } })
}

export async function addHistory(userId: number, hotelId: number | string): Promise<void> {
  return await api.post('/history', { userId, hotelId: Number(hotelId) })
}

export async function clearHistory(userId: number): Promise<void> {
  return await api.delete('/history', { params: { userId } })
}
