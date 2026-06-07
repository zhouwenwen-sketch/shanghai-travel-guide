import api from './index'
import type { Hotel, SearchParams } from '@/types'

export async function getAllHotels(): Promise<Hotel[]> {
  return await api.get('/hotels')
}

export async function getRecommendedHotels(): Promise<Hotel[]> {
  return await api.get('/hotels/recommended')
}

export async function getHotelDetail(id: number | string): Promise<Hotel | null> {
  return await api.get(`/hotels/${id}`)
}

export async function searchHotels(params: SearchParams = {}): Promise<Hotel[]> {
  return await api.get('/hotels/search', { params })
}
