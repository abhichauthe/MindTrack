import apiClient from './apiClient'

export const weeklyReviewService = {
  preview:  ()  => apiClient.get('/weekly-review/preview'),
  sendNow:  ()  => apiClient.post('/weekly-review/send-now')
}