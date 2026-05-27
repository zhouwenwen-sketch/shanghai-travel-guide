import api from './index'
import { getRecommendedHotels as getMockRecommended, getHotelById as getMockDetail, filterHotels as mockFilter } from '@/data/hotels'

export async function getAllHotels() {
  try {
    return await api.get('/hotels')
  } catch {
    return mockFilter()
  }
}

export async function getRecommendedHotels() {
  try {
    return await api.get('/hotels/recommended')
  } catch {
    return getMockRecommended()
  }
}

export async function getHotelDetail(id) {
  try {
    return await api.get(`/hotels/${id}`)
  } catch {
    return getMockDetail(id)
  }
}

export async function searchHotels(params = {}) {
  try {
    return await api.get('/hotels/search', { params })
  } catch {
    return mockFilter(params)
  }
}
