import api from './index'

export function getHistory(userId) {
  return api.get('/history', { params: { userId } })
}

export function addHistory(userId, hotelId) {
  return api.post('/history', { userId, hotelId })
}

export function clearHistory(userId) {
  return api.delete('/history', { params: { userId } })
}
