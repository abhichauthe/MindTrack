import apiClient from './apiClient'

export const notificationService = {
  getAll:         ()   => apiClient.get('/notifications'),
  getUnread:      ()   => apiClient.get('/notifications/unread'),
  getUnreadCount: ()   => apiClient.get('/notifications/unread/count'),
  markAsRead:     (id) => apiClient.put(`/notifications/${id}/read`),
  markAllRead:    ()   => apiClient.put('/notifications/read-all')
}