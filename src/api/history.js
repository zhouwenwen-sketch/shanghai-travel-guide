import api from './index'
import { hotels as mockHotels } from '@/data/hotels'

const HIST_KEY = 'travel_history'

function getLocalHistory(userId) {
  const all = JSON.parse(localStorage.getItem(HIST_KEY) || '{}')
  return all[userId] || []
}

function setLocalHistory(userId, list) {
  const all = JSON.parse(localStorage.getItem(HIST_KEY) || '{}')
  all[userId] = list
  localStorage.setItem(HIST_KEY, JSON.stringify(all))
}

function findHotel(hotelId) {
  return mockHotels.find((h) => h.id === Number(hotelId)) || null
}

export async function getHistory(userId) {
  try {
    return await api.get('/history', { params: { userId } })
  } catch {
    return getLocalHistory(userId)
  }
}

export async function addHistory(userId, hotelId) {
  try {
    return await api.post('/history', { userId, hotelId })
  } catch {
    const list = getLocalHistory(userId)
    const filtered = list.filter((h) => h.hotelId !== Number(hotelId))
    const hotel = findHotel(hotelId)
    filtered.unshift({
      hotelId: Number(hotelId),
      timestamp: Date.now(),
      hotel: hotel || undefined,
    })
    setLocalHistory(userId, filtered.slice(0, 50))
  }
}

export async function clearHistory(userId) {
  try {
    return await api.delete('/history', { params: { userId } })
  } catch {
    setLocalHistory(userId, [])
  }
}
