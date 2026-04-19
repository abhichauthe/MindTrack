import { defineStore } from 'pinia'
import { ref } from 'vue'
import { journalService } from '@/services/journalService'

export const useJournalStore = defineStore('journal', () => {
  const entries  = ref([])
  const loading  = ref(false)
  const error    = ref(null)

  async function fetchEntries() {
    loading.value = true
    try {
      const { data } = await journalService.getEntries()
      entries.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createEntry(payload) {
    const { data } = await journalService.createEntry(payload)
    entries.value.unshift(data)
    return data
  }

  async function updateEntry(id, payload) {
    const { data } = await journalService.updateEntry(id, payload)
    const idx = entries.value.findIndex(e => e.id === id)
    if (idx !== -1) entries.value[idx] = data
    return data
  }

  async function deleteEntry(id) {
    await journalService.deleteEntry(id)
    entries.value = entries.value.filter(e => e.id !== id)
  }

  return { entries, loading, error, fetchEntries, createEntry, updateEntry, deleteEntry }
})