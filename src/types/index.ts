export type ThemeMode = 'light' | 'dark'

export interface User {
  userId: number
  username: string
  password?: string
}

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
  id?: number
  userId: number
  hotelId: number
  hotel?: Hotel | null
}

export interface BrowseHistory {
  id?: number
  userId: number
  hotelId: number
  timestamp?: number
  hotel?: Hotel | null
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
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
  userId: number
  username: string
}

/** 酒店筛选状态（所有字段改为数组，支持多选） */
export interface FilterChangePayload {
  area?: string[]
  starLevel?: number[]
  priceLevel?: string[]
}

/** 搜索结果条件标签 */
export interface CriteriaTag {
  label: string
  value: string
}
