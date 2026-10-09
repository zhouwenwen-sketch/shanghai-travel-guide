import api from './index'
import type { PageResponse, Poi, PoiPayload, PoiQuery } from '@/types'

export const getPois = (params: PoiQuery = {}): Promise<PageResponse<Poi>> =>
  api.get('/pois', { params })

export const getPoi = (id: number | string): Promise<Poi> => api.get(`/pois/${id}`)

export const getAdminPois = (params: PoiQuery = {}): Promise<PageResponse<Poi>> =>
  api.get('/admin/pois', { params })

export const createPoi = (body: PoiPayload): Promise<Poi> => api.post('/admin/pois', body)

export const updatePoi = (id: number, body: PoiPayload): Promise<Poi> =>
  api.put(`/admin/pois/${id}`, body)

export const deletePoi = (id: number, version: number): Promise<Poi> =>
  api.delete(`/admin/pois/${id}`, { headers: { 'If-Match': `"${version}"` } })
