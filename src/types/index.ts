export type ThemeMode = 'light' | 'dark'

export interface User {
  userId: number
  username: string
  role: UserRole
}

export type UserRole = 'USER' | 'ADMIN'

export type PoiType = 'ATTRACTION' | 'RESTAURANT' | 'BUSINESS_DISTRICT'

export interface Poi {
  id: number
  name: string
  type: PoiType
  area: string
  address: string
  latitude: number
  longitude: number
  openingHours?: string
  averagePrice?: number
  ticketPrice?: number
  /** 兼容首版后端的统一价格字段。 */
  price?: number
  suggestedDurationMinutes?: number
  description?: string
  imageUrl?: string
  rating?: number
  recommended?: boolean
  active?: boolean
  tags: string[]
  version?: number
}

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PoiQuery {
  keyword?: string
  type?: PoiType
  area?: string
  page?: number
  size?: number
}

export type PoiPayload = Omit<Poi, 'id' | 'version'> & { version?: number }

export interface Room {
  id: number
  name: string
  area: string
  bed: string
  price: number
  breakfast: string
  cancel: string
}

export interface Review {
  id: number
  user: string
  rating: number
  date: string
  content: string
  reply: string
}

export interface Hotel {
  id: number
  name: string
  recommended: boolean
  starLevel: number
  img_url: string
  banner_url?: string
  starimg_url: string
  transport: string
  phone: string
  area: string
  priceLevel: 'low' | 'mid' | 'high' | 'luxury'
  price: number
  description: string
  tag: string[]
  rating: number
  reviewCount: number
  reviewDesc: string
  rooms: Room[]
  reviews: Review[]
}

export interface Favorite {
  id: number
  hotelId: number
  hotel: HotelSummary
  createdAt: string
}

export interface BrowseHistory {
  id: number
  hotelId: number
  hotel: HotelSummary
  visitedAt: number
}

export type HotelSummary = Pick<
  Hotel,
  'id' | 'name' | 'img_url' | 'transport' | 'price' | 'rating' | 'tag'
>
export type HotelListItem = Omit<Hotel, 'rooms' | 'reviews'>

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
  traceId?: string
  timestamp: string
}

export interface SearchParams {
  keyword?: string
  area?: string
  priceLevel?: string
  starLevel?: number
  minPrice?: number
  maxPrice?: number
}

export interface LoginResult {
  accessToken: string
  tokenType: 'Bearer'
  expiresAt: string
  user: User
}

export type HotelSort = 'idAsc' | 'priceAsc' | 'priceDesc' | 'ratingDesc'
export type PriceBand = 'under150' | '150to299' | '300to449' | '450to599' | '600plus'
export interface HotelSearchQuery {
  keyword?: string
  areas?: string[]
  starLevels?: number[]
  priceBands?: PriceBand[]
  page?: number
  size?: 6 | 12 | 24
  sort?: HotelSort
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED'
export interface CreateBookingPayload { hotelId: number; checkIn: string; checkOut: string; guestCount: number; contactName: string; contactPhone: string }
export interface Booking extends CreateBookingPayload { id: number; version: number; hotelName: string; hotelImage?: string; nightlyPrice: number; totalPrice: number; status: BookingStatus; createdAt: string; cancelledAt?: string }

export type ItineraryItemType = 'HOTEL' | 'ATTRACTION' | 'RESTAURANT' | 'ACTIVITY' | 'NOTE'
export interface ItineraryItemPayload { itemDate: string; type: ItineraryItemType; startTime?: string; endTime?: string; title: string; location?: string; notes?: string; sortOrder: number; hotelId?: number; poiId?: number }
export interface ItineraryItem extends ItineraryItemPayload { id: number; dayNumber: number; hotelName?: string; poiName?: string; poiActive?: boolean }
export interface ItineraryPayload { title: string; startDate: string; endDate: string }
export interface Itinerary extends ItineraryPayload { id: number; version: number; createdAt: string; updatedAt: string; items: ItineraryItem[] }

/** 酒店筛选状态（所有字段改为数组，支持多选） */
export interface FilterChangePayload {
  area?: string[]
  starLevel?: number[]
  priceLevel?: PriceBand[]
}

/** 搜索结果条件标签 */
export interface CriteriaTag {
  label: string
  value: string
}
