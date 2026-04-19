import apiClient from './apiClient'

export const journalService = {
  getEntries:  ()            => apiClient.get('/journal'),
  getEntry:    (id)          => apiClient.get(`/journal/${id}`),
  createEntry: (payload)     => apiClient.post('/journal', payload),
  updateEntry: (id, payload) => apiClient.put(`/journal/${id}`, payload),
  deleteEntry: (id)          => apiClient.delete(`/journal/${id}`)
}