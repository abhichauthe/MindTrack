import apiClient from './apiClient'

export const gamificationService = {
  getStats: () => apiClient.get('/gamification/stats')
}