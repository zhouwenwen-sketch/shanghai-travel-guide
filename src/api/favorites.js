import api from './index'
import { hotels as mockHotels } from '@/data/hotels'

const FAV_KEY = 'travel_favorites'

function getLocalFavorites(userId) {
  const all = JSON.parse(localStorage.getItem(FAV_KEY) || '{}')
  return all[userId] || []
}

function setLocalFavorites(userId, list) {
  const all = JSON.parse(localStorage.getItem(FAV_KEY) || '{}')
  all[userId] = list
  localStorage.setItem(FAV_KEY, JSON.stringify(all))
}

/** 从 mock 数据中查找酒店完整信息 */
function findHotel(hotelId) {
  return mockHotels.find((h) => h.id === Number(hotelId)) || null
}

export async function getFavorites(userId) {
  try {
    return await api.get('/favorites', { params: { userId } })
  } catch {
    const ids = getLocalFavorites(userId)
    // 返回 { hotel: {...} } 格式，兼容 user-center.vue 的 list.map(f => f.hotel)
    return ids.map((hotelId) => ({ hotel: findHotel(hotelId) })).filter((f) => f.hotel)
  }
}

export async function addFavorite(userId, hotelId) {
  try {
    return await api.post('/favorites', { userId, hotelId })
  } catch {
    const list = getLocalFavorites(userId)
    if (!list.includes(Number(hotelId))) {
      list.push(Number(hotelId))
      setLocalFavorites(userId, list)
    }
    return { userId, hotelId }
  }
}

export async function removeFavorite(userId, hotelId) {
  try {
    return await api.delete('/favorites', { params: { userId, hotelId } })
  } catch {
    const list = getLocalFavorites(userId)
    setLocalFavorites(userId, list.filter((id) => id !== Number(hotelId)))
  }
}

export async function checkFavorite(userId, hotelId) {
  try {
    return await api.get('/favorites/check', { params: { userId, hotelId } })
  } catch {
    const list = getLocalFavorites(userId)
    return list.some((id) => id === Number(hotelId))
  }
}
