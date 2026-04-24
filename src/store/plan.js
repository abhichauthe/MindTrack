import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { planService } from '@/services/planService'

export const usePlanStore = defineStore('plan', () => {

  // ── State ─────────────────────────────────────────────────────────
  const plans        = ref([])
  const activePlan   = ref(null)  // currently viewed plan
  const todaySummary = ref(null)
  const loading      = ref(false)
  const error        = ref(null)

  // ── Getters ───────────────────────────────────────────────────────
  const todayTasks = computed(() => todaySummary.value?.tasks ?? [])
  const todayCompletionPct = computed(() => todaySummary.value?.completionPercent ?? 0)
  const pendingTasks = computed(() =>
    todayTasks.value.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS')
  )
  const doneTasks = computed(() =>
    todayTasks.value.filter(t => t.status === 'DONE')
  )

  // ── Actions ───────────────────────────────────────────────────────
  async function fetchPlans() {
    loading.value = true
    try {
      const { data } = await planService.getAll()
      plans.value = data
    } catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function fetchPlan(id) {
    loading.value = true
    try {
      const { data } = await planService.getPlan(id)
      activePlan.value = data
    } catch (e) { error.value = e.message }
    finally { loading.value = false }
  }

  async function createPlan(payload) {
    const { data } = await planService.createPlan(payload)
    plans.value.unshift(data)
    activePlan.value = data
    return data
  }

  async function deletePlan(id) {
    await planService.deletePlan(id)
    plans.value = plans.value.filter(p => p.id !== id)
    if (activePlan.value?.id === id) activePlan.value = null
  }

  async function fetchToday() {
    try {
      const { data } = await planService.getToday()
      todaySummary.value = data
    } catch (e) { error.value = e.message }
  }

  async function createTask(payload) {
    const { data } = await planService.createTask(payload)
    // Add to today's summary if due today
    const today = new Date().toISOString().split('T')[0]
    if (data.dueDate === today && todaySummary.value) {
      todaySummary.value.tasks.push(data)
      todaySummary.value.totalTasks++
    }
    return data
  }

  async function updateTask(id, payload) {
    const { data } = await planService.updateTask(id, payload)
    // Update in today's list
    if (todaySummary.value) {
      const idx = todaySummary.value.tasks.findIndex(t => t.id === id)
      if (idx !== -1) {
        todaySummary.value.tasks[idx] = data
        // Recount completed
        todaySummary.value.completedTasks = todaySummary.value.tasks
          .filter(t => t.status === 'DONE').length
        const total = todaySummary.value.totalTasks
        todaySummary.value.completionPercent = total > 0
          ? Math.round((todaySummary.value.completedTasks / total) * 100) : 0
      }
    }
    // Update in active plan weeks
    if (activePlan.value?.weeks) {
      activePlan.value.weeks.forEach(w => {
        const idx = w.tasks?.findIndex(t => t.id === id)
        if (idx !== -1 && idx !== undefined) w.tasks[idx] = data
      })
    }
    return data
  }

  async function deleteTask(id) {
    await planService.deleteTask(id)
    if (todaySummary.value) {
      todaySummary.value.tasks = todaySummary.value.tasks.filter(t => t.id !== id)
      todaySummary.value.totalTasks = todaySummary.value.tasks.length
    }
  }

  async function markDone(id) {
    return updateTask(id, { status: 'DONE' })
  }

  async function markPending(id) {
    return updateTask(id, { status: 'PENDING' })
  }

  return {
    plans, activePlan, todaySummary, loading, error,
    todayTasks, todayCompletionPct, pendingTasks, doneTasks,
    fetchPlans, fetchPlan, createPlan, deletePlan,
    fetchToday, createTask, updateTask, deleteTask, markDone, markPending
  }
})