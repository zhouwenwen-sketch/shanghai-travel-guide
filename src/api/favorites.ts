import api from './index'
import type { Favorite } from '@/types'

export async function getFavorites(): Promise<Favorite[]> {
  return await api.get('/favorites')
}

export async function addFavorite(hotelId: number | string): Promise<Favorite> {
  return await api.post('/favorites', { hotelId: Number(hotelId) })
}

export async function removeFavorite(hotelId: number | string): Promise<void> {
  return await api.delete('/favorites', { params: { hotelId: Number(hotelId) } })
}

export async function checkFavorite(hotelId: number | string): Promise<boolean> {
  return await api.get('/favorites/check', { params: { hotelId: Number(hotelId) } })
}
