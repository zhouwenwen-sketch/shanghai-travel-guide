import axios from 'axios'
import type { ApiResponse } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.response.use(
  (res) => {
    const body = res.data as ApiResponse
    if (body.code === 200) return body.data
    return Promise.reject(new Error(body.message || '请求失败'))
  },
  (err) => {
    const msg = err.response?.data?.message || err.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

export default api
