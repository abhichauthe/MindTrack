import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { disciplineService } from '@/services/disciplineService'

export const useDisciplineStore = defineStore('discipline', () => {

  // ── State ─────────────────────────────────────────────────────────
  const disciplines = ref([])
  const loading     = ref(false)
  const error       = ref(null)
  const showWizard  = ref(false)

  // ── Getters ───────────────────────────────────────────────────────
  const activeDisciplines = computed(() =>
    disciplines.value.filter(d => d.status === 'ACTIVE')
  )
  const hasAny = computed(() => disciplines.value.length > 0)

  // ── Actions ───────────────────────────────────────────────────────
  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await disciplineService.getAll()
      disciplines.value = data
      if (data.length === 0) showWizard.value = true
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    const { data } = await disciplineService.create(payload)
    disciplines.value.unshift(data)
    showWizard.value = false
    return data
  }

  async function update(id, payload) {
    const { data } = await disciplineService.update(id, payload)
    const idx = disciplines.value.findIndex(d => d.id === id)
    if (idx !== -1) disciplines.value[idx] = data
    return data
  }

  async function remove(id) {
    await disciplineService.delete(id)
    disciplines.value = disciplines.value.filter(d => d.id !== id)
  }

  async function toggleStatus(id) {
    const d = disciplines.value.find(d => d.id === id)
    if (!d) return
    await update(id, { status: d.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' })
  }

  async function submitCheckIn(id, payload) {
    const { data } = await disciplineService.checkIn(id, payload)
    return data
  }

  return {
    disciplines, loading, error, showWizard,
    activeDisciplines, hasAny,
    fetchAll, create, update, remove, toggleStatus, submitCheckIn
  }
})