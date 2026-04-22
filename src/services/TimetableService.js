import apiClient from './apiClient'

export const timetableService = {
  // Get daily schedule with summary
  getDaySchedule: (date) => {
    const params = date ? { date } : {}
    return apiClient.get('/timetable/day', { params })
  },

  // Get blocks in a date range
  getRange: (startDate, endDate) =>
    apiClient.get('/timetable/range', { params: { startDate, endDate } }),

  // Get user's habits as block suggestions for the task panel
  getHabitSuggestions: () =>
    apiClient.get('/timetable/habit-suggestions'),

  // Create a new time block
  createBlock: (payload) =>
    apiClient.post('/timetable', payload),

  // Update an existing block
  updateBlock: (id, payload) =>
    apiClient.put(`/timetable/${id}`, payload),

  // Update status only (done, skipped, pending, in_progress)
  updateStatus: (id, status) =>
    apiClient.patch(`/timetable/${id}/status`, { status }),

  // Delete a block
  deleteBlock: (id) =>
    apiClient.delete(`/timetable/${id}`)
}