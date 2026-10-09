import api from './index'
import type { Booking, CreateBookingPayload } from '@/types'
export const createBooking = (body: CreateBookingPayload, idempotencyKey: string): Promise<Booking> =>
  api.post('/bookings', body, { headers: { 'Idempotency-Key': idempotencyKey } })
export const getBookings = (): Promise<Booking[]> => api.get('/bookings')
export const getBooking = (id: number): Promise<Booking> => api.get(`/bookings/${id}`)
export const cancelBooking = (id: number, version: number): Promise<Booking> =>
  api.post(`/bookings/${id}/cancel`, undefined, { headers: { 'If-Match': `"${version}"` } })
