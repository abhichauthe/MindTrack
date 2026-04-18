import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { habitService } from '@/services/habitService'

export const useHabitsStore = defineStore('habits', () => {
  // State
  const habits = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const completedToday = computed(() => habits.value.filter(h => h.completedToday).length)
  const totalHabits = computed(() => habits.value.length)
  const completionRate = computed(() => {
    if (!totalHabits.value) return 0
    return Math.round((completedToday.value / totalHabits.value) * 100)
  })

  // Actions
  async function fetchHabits() {
    loading.value = true
    error.value = null
    try {
      const { data } = await habitService.getHabits()
      habits.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function addHabit(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await habitService.createHabit(payload)
      habits.value.push(data)
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function toggleHabit(habitId) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return

    const newStatus = habit.completedToday ? 'NOT_DONE' : 'DONE'
    // Optimistic update
    habit.completedToday = !habit.completedToday

    try {
      await habitService.logHabit(habitId, { status: newStatus })
    } catch (e) {
      // Rollback on failure
      habit.completedToday = !habit.completedToday
      error.value = e.message
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    habits, loading, error,
    completedToday, totalHabits, completionRate,
    fetchHabits, addHabit, toggleHabit, clearError
  }
})