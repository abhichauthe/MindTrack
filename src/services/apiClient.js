import axios from 'axios'
import { useAuthStore } from '@/store/auth'

const apiClient = axios.create({
  baseURL: 'https://mindtrack-backend-0lfs.onrender.com/api',
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
    const status = err.response?.status
    const data = err.response?.data
    // Many backends return { message, errors } (not { error }).
    const baseMessage =
      data?.error ||
      data?.message ||
      err.message ||
      'Something went wrong'
    let details = ''
    if (data?.errors && typeof data.errors === 'object') {
      try {
        details = Object.entries(data.errors)
          .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
          .join(' | ')
      } catch (_) {}
    }
    const message =
      status
        ? `[${status}] ${baseMessage}${details ? ` — ${details}` : ''}`
        : `${baseMessage}${details ? ` — ${details}` : ''}`
    return Promise.reject(new Error(message))
  }
)

export default apiClient
