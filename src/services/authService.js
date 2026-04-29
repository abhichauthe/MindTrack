import apiClient from './apiClient'

export const authService = {
  register(payload) {
    // Send only expected fields (some backends reject unknown keys -> 400).
    const { username, email, password, phoneNumber } = payload || {}
    return apiClient.post('/auth/register', { username, email, password, phoneNumber })
  },
  login(payload) {
    return apiClient.post('/auth/login', payload)
  },
  requestOtp(payload) {
    return apiClient.post('/auth/otp/request', payload)
  },
  verifyOtp(payload) {
    return apiClient.post('/auth/otp/verify', payload)
  },
  requestPasswordReset(payload) {
    return apiClient.post('/auth/password/reset-request', payload)
  },
  confirmPasswordReset(payload) {
    return apiClient.post('/auth/password/reset-confirm', payload)
  }
}