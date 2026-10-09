import api from './index'
import type { BrowseHistory } from '@/types'

export async function getHistory(): Promise<BrowseHistory[]> {
  return await api.get('/history')
}

export async function addHistory(hotelId: number | string): Promise<void> {
  return await api.post('/history', { hotelId: Number(hotelId) })
}

export async function clearHistory(): Promise<void> {
  return await api.delete('/history')
}
