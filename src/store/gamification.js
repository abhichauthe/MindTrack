import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { gamificationService } from '@/services/gamificationService'

export const useGamificationStore = defineStore('gamification', () => {
  const stats   = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  const level            = computed(() => stats.value?.level ?? 1)
  const totalXp          = computed(() => stats.value?.totalXp ?? 0)
  const xpProgressPercent= computed(() => stats.value?.xpProgressPercent ?? 0)
  const xpToNextLevel    = computed(() => stats.value?.xpToNextLevel ?? 100)
  const badges           = computed(() => stats.value?.badges ?? [])
  const streaks          = computed(() => stats.value?.streaks ?? [])

  async function fetchStats() {
    loading.value = true
    try {
      const { data } = await gamificationService.getStats()
      stats.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    stats, loading, error,
    level, totalXp, xpProgressPercent, xpToNextLevel, badges, streaks,
    fetchStats
  }
})