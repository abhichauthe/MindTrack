import apiClient from './apiClient'

export const recurringHabitService = {
  getAll:     ()            => apiClient.get('/recurring-habits'),
  create:     (payload)     => apiClient.post('/recurring-habits', payload),
  update:     (id, payload) => apiClient.put(`/recurring-habits/${id}`, payload),
  deactivate: (id)          => apiClient.delete(`/recurring-habits/${id}`),
}