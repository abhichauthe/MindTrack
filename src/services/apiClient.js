import axios from 'axios'
import { useAuthStore } from '@/store/auth'

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach X-User-Id header from auth store on every request
apiClient.interceptors.request.use((config) => {
  // We read from localStorage directly to avoid circular import with store
  const userRaw = localStorage.getItem('mindtrack_user')
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw)
      if (user?.userId) {
        config.headers['X-User-Id'] = user.userId
      }
    } catch (_) {}
  }
  return config
})

// Global response error handler
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default apiClient