import api from './index'
import type { Hotel, HotelListItem, HotelSearchQuery, PageResponse, SearchParams } from '@/types'
import { hotelSearchParams } from '@/utils/hotel-search'

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

export async function searchHotelsPaged(params: HotelSearchQuery = {}, signal?: AbortSignal): Promise<PageResponse<HotelListItem>> {
  return await api.get('/hotels/search/paged', {
    params: hotelSearchParams(params),
    signal,
  })
}
