import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 响应拦截：统一提取 data
api.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body.code === 200) return body.data
    return Promise.reject(new Error(body.message || '请求失败'))
  },
  (err) => {
    const msg = err.response?.data?.message || err.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

export default api




