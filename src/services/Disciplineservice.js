import apiClient from './apiClient'

export const disciplineService = {
  getAll:       ()            => apiClient.get('/discipline'),
  getActive:    ()            => apiClient.get('/discipline/active'),
  create:       (payload)     => apiClient.post('/discipline', payload),
  update:       (id, payload) => apiClient.put(`/discipline/${id}`, payload),
  delete:       (id)          => apiClient.delete(`/discipline/${id}`),
  checkIn:      (id, payload) => apiClient.post(`/discipline/${id}/checkin`, payload),
  getCheckins:  (id)          => apiClient.get(`/discipline/${id}/checkins`),
}