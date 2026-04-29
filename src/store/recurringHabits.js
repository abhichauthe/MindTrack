import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recurringHabitService } from '@/services/recurringHabitService'

export const useRecurringHabitStore = defineStore('recurringHabits', () => {

  const habits  = ref([])
  const loading = ref(false)
  const error   = ref(null)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await recurringHabitService.getAll()
      habits.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    const { data } = await recurringHabitService.create(payload)
    habits.value.unshift(data)
    return data
  }

  async function update(id, payload) {
    const { data } = await recurringHabitService.update(id, payload)
    const idx = habits.value.findIndex(h => h.id === id)
    if (idx !== -1) habits.value[idx] = data
    return data
  }

  async function deactivate(id) {
    await recurringHabitService.deactivate(id)
    habits.value = habits.value.filter(h => h.id !== id)
  }

  return { habits, loading, error, fetchAll, create, update, deactivate }
})