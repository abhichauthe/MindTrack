import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productivityService } from '@/services/productivityService'

export const useProductivityStore = defineStore('productivity', () => {

  const analytics = ref(null)
  const loading   = ref(false)
  const error     = ref(null)

  async function syncTask(taskId) {
    await productivityService.syncTask(taskId)
  }

  async function autoBlock(date) {
    const { data } = await productivityService.autoBlock(date)
    return data
  }

  async function rescheduleMissed() {
    const { data } = await productivityService.rescheduleMissed()
    return data
  }

  async function snoozeTask(taskId, minutes = 10) {
    await productivityService.snoozeTask(taskId, minutes)
  }

  async function skipTask(taskId) {
    await productivityService.skipTask(taskId)
  }

  async function fetchAnalytics() {
    loading.value = true
    try {
      const { data } = await productivityService.getWeeklyAnalytics()
      analytics.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    analytics, loading, error,
    syncTask, autoBlock, rescheduleMissed,
    snoozeTask, skipTask, fetchAnalytics
  }
})