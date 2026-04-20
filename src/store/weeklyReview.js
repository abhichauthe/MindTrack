import { defineStore } from 'pinia'
import { ref } from 'vue'
import { weeklyReviewService } from '@/services/weeklyReviewService'

export const useWeeklyReviewStore = defineStore('weeklyReview', () => {
  const report  = ref(null)
  const loading = ref(false)
  const sending = ref(false)
  const error   = ref(null)

  async function fetchPreview() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await weeklyReviewService.preview()
      report.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function sendNow() {
    sending.value = true
    error.value   = null
    try {
      await weeklyReviewService.sendNow()
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      sending.value = false
    }
  }

  return { report, loading, sending, error, fetchPreview, sendNow }
})