import { ConflictException } from '@nestjs/common'
import { UserDataService } from './user-data.service'

describe('favorite race handling', () => {
  const hotel = { id: 1n, name: '测试酒店', img_url: null, transport: null, price: 300, rating: 5, hotel_tags: [] }
  function database() {
    return { hotels: { findUnique: jest.fn().mockResolvedValue(hotel) }, favorites: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 2n, hotel_id: 1n, hotels: hotel, created_at: new Date() }), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) } } as any
  }
  it('keeps normal favorite creation and repeated removal working', async () => {
    const db = database(), service = new UserDataService(db)
    expect((await service.addFavorite(7n, 1)).hotelId).toBe(1)
    await service.removeFavorite(7n, 1)
    await service.removeFavorite(7n, 1)
    expect(db.favorites.create).toHaveBeenCalledTimes(1)
    expect(db.favorites.deleteMany).toHaveBeenCalledTimes(2)
  })
  it('returns 409 both at the existing-favorite boundary and after a concurrent unique collision', async () => {
    const db = database(), service = new UserDataService(db)
    db.favorites.findFirst.mockResolvedValueOnce({ id: 2n })
    await expect(service.addFavorite(7n, 1)).rejects.toBeInstanceOf(ConflictException)
    expect(db.favorites.create).not.toHaveBeenCalled()
    db.favorites.create.mockRejectedValue({ code: 'P2002' })
    for (let i = 0; i < 2; i++) await expect(service.addFavorite(7n, 1)).rejects.toBeInstanceOf(ConflictException)
  })
  it('does not disguise unrelated database errors as duplicate favorites', async () => {
    const db = database(), failure = new Error('unavailable')
    db.favorites.create.mockRejectedValue(failure)
    await expect(new UserDataService(db).addFavorite(7n, 1)).rejects.toBe(failure)
  })
})
