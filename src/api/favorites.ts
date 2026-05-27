/*
 * ============================================================
 * 原 JS 版本（已注释，方便对比 .js → .ts 的改动）
 * ============================================================
 *
 *   import api from './index'
 *
 *   export function getFavorites(userId) {
 *     return api.get('/favorites', { params: { userId } })
 *   }
 *
 *   export function addFavorite(userId, hotelId) {
 *     return api.post('/favorites', { userId, hotelId })
 *   }
 *
 *   export function removeFavorite(userId, hotelId) {
 *     return api.delete('/favorites', { params: { userId, hotelId } })
 *   }
 *
 *   export function checkFavorite(userId, hotelId) {
 *     return api.get('/favorites/check', { params: { userId, hotelId } })
 *   }
 *
 * ============================================================
 */

import api from './index'

// ---------- 类型定义 ----------

/** 后端统一返回结构 */
interface ApiResult<T> {
  code: number
  message: string
  data: T
}

/** 收藏后的返回结果 */
interface FavoriteResult {
  userId: number
  hotelId: number
}

/** 酒店简要信息 */
export interface FavoriteHotel {
  id: number
  name: string
  price: number
  rating: number
  img_url: string
  transport: string
  tag: string[]
}

// ---------- API 函数 ----------

/** 获取用户收藏列表 */
export function getFavorites(userId: number): Promise<FavoriteHotel[]> {
  return api.get('/favorites', { params: { userId } })
}

/** 添加收藏 */
export function addFavorite(userId: number, hotelId: number): Promise<FavoriteResult> {
  return api.post('/favorites', { userId, hotelId })
}

/** 取消收藏 */
export function removeFavorite(userId: number, hotelId: number): Promise<void> {
  return api.delete('/favorites', { params: { userId, hotelId } })
}

/** 检查是否已收藏 */
export function checkFavorite(userId: number, hotelId: number): Promise<boolean> {
  return api.get('/favorites/check', { params: { userId, hotelId } })
}
