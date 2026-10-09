import api from './index'
import type { Itinerary, ItineraryItemPayload, ItineraryPayload } from '@/types'
export const getItineraries = (): Promise<Itinerary[]> => api.get('/itineraries')
export const getItinerary = (id: number | string): Promise<Itinerary> => api.get(`/itineraries/${id}`)
export const createItinerary = (body: ItineraryPayload): Promise<Itinerary> => api.post('/itineraries', body)
export const updateItinerary = (id: number, version: number, body: ItineraryPayload): Promise<Itinerary> =>
  api.put(`/itineraries/${id}`, body, { headers: { 'If-Match': `"${version}"` } })
export const deleteItinerary = (id: number, version: number): Promise<void> =>
  api.delete(`/itineraries/${id}`, { headers: { 'If-Match': `"${version}"` } })
export const addItineraryItem = (id: number, version: number, body: ItineraryItemPayload): Promise<Itinerary> =>
  api.post(`/itineraries/${id}/items`, body, { headers: { 'If-Match': `"${version}"` } })
export const updateItineraryItem = (id: number, itemId: number, version: number, body: ItineraryItemPayload): Promise<Itinerary> =>
  api.put(`/itineraries/${id}/items/${itemId}`, body, { headers: { 'If-Match': `"${version}"` } })
export const deleteItineraryItem = (id: number, itemId: number, version: number): Promise<Itinerary> =>
  api.delete(`/itineraries/${id}/items/${itemId}`, { headers: { 'If-Match': `"${version}"` } })
