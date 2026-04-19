import apiClient from './apiClient'

export const focusService = {
  saveSession:  (payload) => apiClient.post('/focus/sessions', payload),
  getSessions:  ()        => apiClient.get('/focus/sessions'),
  getStats:     ()        => apiClient.get('/focus/stats')
}