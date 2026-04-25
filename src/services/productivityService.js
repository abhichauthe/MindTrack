import apiClient from './apiClient'

export const productivityService = {
  syncTask:        (taskId)           => apiClient.post(`/productivity/sync-task/${taskId}`),
  autoBlock:       (date)             => apiClient.post('/productivity/auto-block', null, { params: { date } }),
  rescheduleMissed:()                 => apiClient.post('/productivity/reschedule-missed'),
  snoozeTask:      (taskId, minutes)  => apiClient.post(`/productivity/snooze/${taskId}`, null, { params: { minutes } }),
  skipTask:        (taskId)           => apiClient.post(`/productivity/skip/${taskId}`),
  getWeeklyAnalytics: ()              => apiClient.get('/productivity/analytics/weekly'),
}