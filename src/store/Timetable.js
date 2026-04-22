import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { timetableService } from '@/services/timetableService'

export const useTimetableStore = defineStore('timetable', () => {
  // ── State ─────────────────────────────────────────────────────────────
  const summary          = ref(null)   // DailySummaryResponse from backend
  const habitSuggestions = ref([])     // Habits available to drag into schedule
  const selectedDate     = ref(new Date().toISOString().split('T')[0]) // YYYY-MM-DD
  const loading          = ref(false)
  const error            = ref(null)

  // UI state for the add/edit modal
  const showModal        = ref(false)
  const editingBlock     = ref(null)   // null = creating new, object = editing existing

  // ── Getters ───────────────────────────────────────────────────────────
  const blocks = computed(() => summary.value?.blocks ?? [])

  const totalBlocks     = computed(() => summary.value?.totalBlocks     ?? 0)
  const completedBlocks = computed(() => summary.value?.completedBlocks ?? 0)
  const completionPct   = computed(() => summary.value?.completionPercent ?? 0)

  // Blocks grouped by hour for timeline rendering
  const blocksByHour = computed(() => {
    const map = {}
    for (let h = 0; h < 24; h++) map[h] = []
    blocks.value.forEach(block => {
      const hour = parseInt(block.startTime.split(':')[0])
      if (map[hour] !== undefined) map[hour].push(block)
    })
    return map
  })

  // Unscheduled habit suggestions (not already in today's blocks)
  const unscheduledHabits = computed(() => {
    const scheduledHabitIds = new Set(
      blocks.value
        .filter(b => b.habitId != null)
        .map(b => b.habitId)
    )
    return habitSuggestions.value.filter(h => !scheduledHabitIds.has(h.habitId))
  })

  // ── Actions ───────────────────────────────────────────────────────────
  async function fetchDaySchedule(date) {
    if (date) selectedDate.value = date
    loading.value = true
    error.value   = null
    try {
      const { data } = await timetableService.getDaySchedule(selectedDate.value)
      summary.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchHabitSuggestions() {
    try {
      const { data } = await timetableService.getHabitSuggestions()
      habitSuggestions.value = data
    } catch (_) {}
  }

  async function createBlock(payload) {
    const { data } = await timetableService.createBlock({
      ...payload,
      date: selectedDate.value
    })
    // Optimistically add to local state
    if (summary.value) {
      summary.value.blocks.push(data)
      summary.value.blocks.sort((a, b) =>
        a.startTime.localeCompare(b.startTime))
      summary.value.totalBlocks++
    }
    return data
  }

  async function updateBlock(id, payload) {
    const { data } = await timetableService.updateBlock(id, payload)
    if (summary.value) {
      const idx = summary.value.blocks.findIndex(b => b.id === id)
      if (idx !== -1) summary.value.blocks[idx] = data
    }
    return data
  }

  async function updateStatus(id, status) {
    const { data } = await timetableService.updateStatus(id, status)
    if (summary.value) {
      const idx = summary.value.blocks.findIndex(b => b.id === id)
      if (idx !== -1) {
        summary.value.blocks[idx] = data
        // Recount completed
        summary.value.completedBlocks = summary.value.blocks
          .filter(b => b.status === 'DONE').length
        summary.value.completionPercent = summary.value.totalBlocks > 0
          ? Math.round((summary.value.completedBlocks / summary.value.totalBlocks) * 100)
          : 0
      }
    }
    return data
  }

  async function deleteBlock(id) {
    await timetableService.deleteBlock(id)
    if (summary.value) {
      summary.value.blocks = summary.value.blocks.filter(b => b.id !== id)
      summary.value.totalBlocks = summary.value.blocks.length
      summary.value.completedBlocks = summary.value.blocks
        .filter(b => b.status === 'DONE').length
    }
  }

  // ── Modal helpers ─────────────────────────────────────────────────────
  function openCreateModal(prefill = null) {
    editingBlock.value = prefill  // prefill with habit suggestion data if dragged
    showModal.value    = true
  }

  function openEditModal(block) {
    editingBlock.value = { ...block }
    showModal.value    = true
  }

  function closeModal() {
    showModal.value    = false
    editingBlock.value = null
  }

  // Navigate to previous/next day
  function goToDate(dateStr) {
    selectedDate.value = dateStr
    fetchDaySchedule(dateStr)
  }

  return {
    summary, habitSuggestions, selectedDate,
    loading, error, showModal, editingBlock,
    blocks, totalBlocks, completedBlocks, completionPct,
    blocksByHour, unscheduledHabits,
    fetchDaySchedule, fetchHabitSuggestions,
    createBlock, updateBlock, updateStatus, deleteBlock,
    openCreateModal, openEditModal, closeModal, goToDate
  }
})