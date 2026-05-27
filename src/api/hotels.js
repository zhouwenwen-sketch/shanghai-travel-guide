import api from './index'

export function getAllHotels() {
  return api.get('/hotels')
}

export function getRecommendedHotels() {
  return api.get('/hotels/recommended')
}

export function getHotelDetail(id) {
  return api.get(`/hotels/${id}`)
}

export function searchHotels(params = {}) {
  return api.get('/hotels/search', { params })
}
