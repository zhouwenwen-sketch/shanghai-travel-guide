import api from './index'

export function getFavorites(userId) {
  return api.get('/favorites', { params: { userId } })
}

export function addFavorite(userId, hotelId) {
  return api.post('/favorites', { userId, hotelId })
}

export function removeFavorite(userId, hotelId) {
  return api.delete('/favorites', { params: { userId, hotelId } })
}

export function checkFavorite(userId, hotelId) {
  return api.get('/favorites/check', { params: { userId, hotelId } })
}
