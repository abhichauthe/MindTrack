import apiClient from './apiClient'

export const planService = {
  // Monthly plans
  getAll:      ()              => apiClient.get('/plans'),
  getPlan:     (id)            => apiClient.get(`/plans/${id}`),
  createPlan:  (payload)       => apiClient.post('/plans', payload),
  deletePlan:  (id)            => apiClient.delete(`/plans/${id}`),

  // Weekly breakdowns
  getWeeks:    (planId)        => apiClient.get(`/plans/${planId}/weeks`),

  // Daily tasks
  getToday:    ()              => apiClient.get('/plans/tasks/today'),
  getByRange:  (start, end)    => apiClient.get('/plans/tasks/range', { params: { start, end } }),
  getByWeek:   (weekId)        => apiClient.get(`/plans/weeks/${weekId}/tasks`),
  createTask:  (payload)       => apiClient.post('/plans/tasks', payload),
  updateTask:  (id, payload)   => apiClient.put(`/plans/tasks/${id}`, payload),
  deleteTask:  (id)            => apiClient.delete(`/plans/tasks/${id}`),
}