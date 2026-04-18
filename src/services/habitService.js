import apiClient from './apiClient'

export const habitService = {
  getHabits() {
    return apiClient.get('/habits')
  },
  createHabit(payload) {
    return apiClient.post('/habits', payload)
  },
  logHabit(habitId, payload = {}) {
    return apiClient.post(`/habits/${habitId}/log`, payload)
  }
}