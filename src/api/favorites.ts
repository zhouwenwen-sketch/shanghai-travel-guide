import api from './index'
import type { Favorite } from '@/types'

export async function getFavorites(userId: number): Promise<Favorite[]> {
  return await api.get('/favorites', { params: { userId } })
}

export async function addFavorite(userId: number, hotelId: number | string): Promise<Favorite> {
  return await api.post('/favorites', { userId, hotelId: Number(hotelId) })
}

export async function removeFavorite(userId: number, hotelId: number | string): Promise<void> {
  return await api.delete('/favorites', { params: { userId, hotelId: Number(hotelId) } })
}

export async function checkFavorite(userId: number, hotelId: number | string): Promise<boolean> {
  return await api.get('/favorites/check', { params: { userId, hotelId: Number(hotelId) } })
}
