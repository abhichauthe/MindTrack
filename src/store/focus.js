import { defineStore } from 'pinia'
import { ref } from 'vue'
import { focusService } from '@/services/focusService'

export const useFocusStore = defineStore('focus', () => {
  const sessions = ref([])
  const stats    = ref({ totalSessions: 0, totalMinutesToday: 0, totalMinutesWeek: 0 })
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchSessions() {
    loading.value = true
    try {
      const { data } = await focusService.getSessions()
      sessions.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const { data } = await focusService.getStats()
      stats.value = data
    } catch (e) {
      error.value = e.message
    }
  }

  async function saveSession(payload) {
    try {
      const { data } = await focusService.saveSession(payload)
      sessions.value.unshift(data)
      await fetchStats()
      return data
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  return { sessions, stats, loading, error, fetchSessions, fetchStats, saveSession }
})