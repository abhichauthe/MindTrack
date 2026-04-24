<template>
  <div class="dashboard">
    <AppSidebar active="plan" />

    <main class="main">

      <!-- ── Header ─────────────────────────────────────────────────── -->
      <div class="page-header">
        <div>
          <h2>Monthly Plan</h2>
          <p class="text-secondary text-sm mt-1">
            Monthly goals → weekly focus → daily tasks
          </p>
        </div>
        <button class="btn btn-primary btn-sm" @click="openCreateModal">
          + New Plan
        </button>
      </div>

      <!-- ── Today's Tasks strip ────────────────────────────────────── -->
      <div class="today-strip card" v-if="store.todaySummary">
        <div class="today-strip-header">
          <div class="today-strip-left">
            <span class="today-label mono">TODAY</span>
            <span class="today-date mono">{{ todayStr }}</span>
          </div>
          <div class="today-strip-right">
            <div class="completion-pill">
              <div class="completion-bar-wrap">
                <div class="completion-bar"
                     :style="{ width: store.todayCompletionPct + '%' }" />
              </div>
              <span class="mono completion-text">
                {{ store.todaySummary.completedTasks }}/{{ store.todaySummary.totalTasks }} done
              </span>
            </div>
            <button class="btn btn-ghost btn-sm" @click="openAddTaskModal(null)">
              + Task
            </button>
          </div>
        </div>

        <!-- Task list -->
        <div v-if="store.todayTasks.length" class="today-tasks">
          <div
            v-for="task in store.todayTasks"
            :key="task.id"
            class="task-row"
            :class="{ done: task.status === 'DONE' }"
          >
            <button
              class="task-check"
              :class="{ checked: task.status === 'DONE' }"
              @click="toggleTask(task)"
            >{{ task.status === 'DONE' ? '✓' : '' }}</button>

            <div class="task-info">
              <span class="task-title">{{ task.title }}</span>
              <div class="task-meta">
                <span class="task-tag" :class="task.category.toLowerCase()">
                  {{ task.category }}
                </span>
                <span v-if="task.dueTime" class="task-time mono">
                  {{ formatTime(task.dueTime) }}
                </span>
              </div>
            </div>

            <div class="task-priority-dot" :class="task.priority.toLowerCase()" />

            <div class="task-actions">
              <button class="task-action-btn" @click="openEditTaskModal(task)">✎</button>
              <button class="task-action-btn danger" @click="store.deleteTask(task.id)">×</button>
            </div>
          </div>
        </div>

        <div v-else class="today-empty">
          <span class="text-muted text-sm">No tasks for today.</span>
          <button class="btn btn-ghost btn-sm" @click="openAddTaskModal(null)">
            + Add task
          </button>
        </div>
      </div>

      <!-- ── Plans list ─────────────────────────────────────────────── -->
      <div class="section-header">
        <h3>Your Plans</h3>
      </div>

      <div v-if="store.loading" class="loading-state">
        <div class="spinner" />
      </div>

      <div v-else-if="!store.plans.length" class="empty-state card">
        <div style="font-size:40px">📅</div>
        <h3>No plans yet</h3>
        <p class="text-secondary text-sm">
          Create a monthly plan and the system will auto-generate<br/>
          your weekly focus areas and daily tasks.
        </p>
        <button class="btn btn-primary" style="margin-top:8px" @click="openCreateModal">
          Create your first plan
        </button>
      </div>

      <!-- Plan cards -->
      <div v-else class="plans-list">
        <div
          v-for="plan in store.plans"
          :key="plan.id"
          class="plan-card card"
          :class="{ active: activePlanId === plan.id }"
        >
          <!-- Plan header -->
          <div class="plan-card-header" @click="togglePlan(plan.id)">
            <div class="plan-card-left">
              <div class="plan-month-badge mono">
                {{ plan.monthName?.slice(0, 3) }} {{ plan.year }}
              </div>
              <div>
                <div class="plan-title">{{ plan.title }}</div>
                <div class="text-muted text-sm" v-if="plan.description">
                  {{ plan.description }}
                </div>
              </div>
            </div>
            <div class="plan-card-right">
              <span
                class="plan-status-badge"
                :class="plan.status?.toLowerCase()"
              >{{ plan.status }}</span>
              <button
                class="dc-btn danger"
                @click.stop="store.deletePlan(plan.id)"
                title="Delete plan"
              >×</button>
              <span class="plan-chevron" :class="{ open: activePlanId === plan.id }">
                ›
              </span>
            </div>
          </div>

          <!-- Weekly breakdown (expanded) -->
          <Transition name="expand">
            <div v-if="activePlanId === plan.id && plan.weeks?.length" class="weeks-wrap">
              <div
                v-for="week in plan.weeks"
                :key="week.id"
                class="week-block"
              >
                <!-- Week header -->
                <div class="week-header">
                  <div class="week-num mono">Week {{ week.weekNumber }}</div>
                  <div class="week-theme">{{ week.theme }}</div>
                  <div class="week-dates mono text-muted">
                    {{ formatDate(week.startDate) }} – {{ formatDate(week.endDate) }}
                  </div>
                  <div class="week-progress mono">
                    {{ week.completedTasks }}/{{ week.totalTasks }}
                  </div>
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="openAddTaskModal(week)"
                  >+ Task</button>
                </div>

                <!-- Week focus -->
                <div class="week-focus text-secondary text-sm">
                  {{ week.focus }}
                </div>

                <!-- Tasks in this week -->
                <div class="week-tasks" v-if="week.tasks?.length">
                  <div
                    v-for="task in week.tasks"
                    :key="task.id"
                    class="task-row compact"
                    :class="{ done: task.status === 'DONE' }"
                  >
                    <button
                      class="task-check small"
                      :class="{ checked: task.status === 'DONE' }"
                      @click="toggleTask(task)"
                    >{{ task.status === 'DONE' ? '✓' : '' }}</button>

                    <div class="task-info">
                      <span class="task-title">{{ task.title }}</span>
                      <div class="task-meta">
                        <span class="task-tag" :class="task.category?.toLowerCase()">
                          {{ task.category }}
                        </span>
                        <span class="mono text-muted" style="font-size:10px">
                          {{ formatDate(task.dueDate) }}
                          <span v-if="task.dueTime">· {{ formatTime(task.dueTime) }}</span>
                        </span>
                      </div>
                    </div>

                    <div class="task-priority-dot" :class="task.priority?.toLowerCase()" />

                    <div class="task-actions">
                      <button class="task-action-btn" @click="openEditTaskModal(task)">✎</button>
                      <button class="task-action-btn danger" @click="store.deleteTask(task.id)">×</button>
                    </div>
                  </div>
                </div>

                <div v-else class="week-no-tasks text-muted text-sm">
                  No tasks yet.
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </main>

    <!-- ── Create Plan Modal ───────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="createModal.show" class="modal-overlay" @click.self="createModal.show = false">
          <div class="modal-box card">
            <div class="modal-header">
              <h3>New Monthly Plan</h3>
              <button class="btn btn-ghost btn-icon" @click="createModal.show = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Plan Title *</label>
                <input v-model="createForm.title" class="form-input"
                       placeholder="e.g. January Discipline Focus" />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="createForm.description" class="form-input"
                          rows="2" placeholder="What do you want to achieve this month?" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Month</label>
                  <select v-model.number="createForm.month" class="form-input">
                    <option v-for="(m, i) in months" :key="i" :value="i + 1">{{ m }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Year</label>
                  <select v-model.number="createForm.year" class="form-input">
                    <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group" v-if="disciplineOptions.length">
                <label class="form-label">Link to Discipline Journey (optional)</label>
                <select v-model.number="createForm.disciplineId" class="form-input">
                  <option :value="null">None</option>
                  <option v-for="d in disciplineOptions" :key="d.id" :value="d.id">
                    {{ d.areaEmoji }} {{ d.areaName }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Auto-generate weekly plan + tasks?</label>
                <div class="toggle-row">
                  <button
                    class="toggle-btn"
                    :class="{ active: createForm.autoGenerate }"
                    @click="createForm.autoGenerate = !createForm.autoGenerate"
                  >
                    {{ createForm.autoGenerate ? '✓ Yes — auto-generate' : 'No — I will add manually' }}
                  </button>
                </div>
                <p class="text-muted text-sm" v-if="createForm.autoGenerate">
                  System will create 4 weekly focuses + 5 tasks per week automatically.
                  You can edit everything afterward.
                </p>
              </div>
              <div v-if="createError" class="alert alert-error">{{ createError }}</div>
            </div>
            <div class="modal-footer-row">
              <button class="btn btn-ghost" @click="createModal.show = false">Cancel</button>
              <button class="btn btn-primary" @click="submitCreatePlan" :disabled="createSaving">
                <span v-if="createSaving" class="spinner" />
                <span v-else>Create Plan</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Add / Edit Task Modal ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="taskModal.show" class="modal-overlay" @click.self="taskModal.show = false">
          <div class="modal-box card">
            <div class="modal-header">
              <h3>{{ taskModal.editingTask ? 'Edit Task' : 'Add Task' }}</h3>
              <button class="btn btn-ghost btn-icon" @click="taskModal.show = false">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Title *</label>
                <input v-model="taskForm.title" class="form-input"
                       placeholder="e.g. Morning run 30 min" />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="taskForm.description" class="form-input"
                          rows="2" placeholder="Any notes..." />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select v-model="taskForm.category" class="form-input">
                    <option value="DISCIPLINE">Discipline</option>
                    <option value="WORK">Work</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="HEALTH">Health</option>
                    <option value="LEARNING">Learning</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select v-model="taskForm.priority" class="form-input">
                    <option value="HIGH">🔴 High</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="LOW">🟢 Low</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Due Date</label>
                  <input v-model="taskForm.dueDate" type="date" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Due Time (optional)</label>
                  <input v-model="taskForm.dueTime" type="time" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Duration (minutes)</label>
                <input v-model.number="taskForm.durationMinutes" type="number"
                       class="form-input" placeholder="30" min="5" />
              </div>
              <div v-if="taskError" class="alert alert-error">{{ taskError }}</div>
            </div>
            <div class="modal-footer-row">
              <button class="btn btn-ghost" @click="taskModal.show = false">Cancel</button>
              <button class="btn btn-primary" @click="submitTask" :disabled="taskSaving">
                <span v-if="taskSaving" class="spinner" />
                <span v-else>{{ taskModal.editingTask ? 'Save Changes' : 'Add Task' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { usePlanStore } from '@/store/plan'
import { useDisciplineStore } from '@/store/discipline'

const store           = usePlanStore()
const disciplineStore = useDisciplineStore()

const activePlanId = ref(null)

// ── Create plan modal ─────────────────────────────────────────────────
const createModal = ref({ show: false })
const createError = ref('')
const createSaving = ref(false)
const createForm = ref({
  title: '', description: '',
  month: new Date().getMonth() + 1,
  year:  new Date().getFullYear(),
  disciplineId: null,
  autoGenerate: true
})

// ── Task modal ────────────────────────────────────────────────────────
const taskModal = ref({ show: false, week: null, editingTask: null })
const taskError = ref('')
const taskSaving = ref(false)
const taskForm = ref({
  title: '', description: '',
  category: 'GENERAL', priority: 'MEDIUM',
  dueDate: new Date().toISOString().split('T')[0],
  dueTime: '', durationMinutes: 30
})

// ── Data ──────────────────────────────────────────────────────────────
const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]
const years = [
  new Date().getFullYear(),
  new Date().getFullYear() + 1
]

const todayStr = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })
)

const disciplineOptions = computed(() =>
  disciplineStore.disciplines.filter(d => d.status === 'ACTIVE')
)

// ── Actions ───────────────────────────────────────────────────────────
function openCreateModal() {
  createForm.value = {
    title: '', description: '',
    month: new Date().getMonth() + 1,
    year:  new Date().getFullYear(),
    disciplineId: null,
    autoGenerate: true
  }
  createError.value  = ''
  createModal.value.show = true
}

async function submitCreatePlan() {
  if (!createForm.value.title.trim()) {
    createError.value = 'Title is required'; return
  }
  createSaving.value = true
  createError.value  = ''
  try {
    await store.createPlan({
      title:        createForm.value.title,
      description:  createForm.value.description,
      month:        createForm.value.month,
      year:         createForm.value.year,
      disciplineId: createForm.value.disciplineId,
      autoGenerate: createForm.value.autoGenerate
    })
    createModal.value.show = false
    await store.fetchPlans()
  } catch (e) {
    createError.value = e.message
  } finally {
    createSaving.value = false
  }
}

function openAddTaskModal(week) {
  taskModal.value = { show: true, week, editingTask: null }
  taskError.value = ''
  taskForm.value  = {
    title: '', description: '',
    category: 'GENERAL', priority: 'MEDIUM',
    dueDate: week?.startDate ?? new Date().toISOString().split('T')[0],
    dueTime: '', durationMinutes: 30
  }
}

function openEditTaskModal(task) {
  taskModal.value = { show: true, week: null, editingTask: task }
  taskError.value = ''
  taskForm.value  = {
    title:           task.title,
    description:     task.description ?? '',
    category:        task.category,
    priority:        task.priority,
    dueDate:         task.dueDate,
    dueTime:         task.dueTime ?? '',
    durationMinutes: task.durationMinutes ?? 30
  }
}

async function submitTask() {
  if (!taskForm.value.title.trim()) {
    taskError.value = 'Title is required'; return
  }
  taskSaving.value = true
  taskError.value  = ''
  try {
    const payload = {
      title:           taskForm.value.title,
      description:     taskForm.value.description,
      category:        taskForm.value.category,
      priority:        taskForm.value.priority,
      dueDate:         taskForm.value.dueDate,
      dueTime:         taskForm.value.dueTime || null,
      durationMinutes: taskForm.value.durationMinutes,
    }

    if (taskModal.value.editingTask) {
      await store.updateTask(taskModal.value.editingTask.id, payload)
    } else {
      await store.createTask({
        ...payload,
        weeklyBreakdownId: taskModal.value.week?.id ?? null,
      })
    }
    taskModal.value.show = false
    await store.fetchToday()
    if (activePlanId.value) await store.fetchPlan(activePlanId.value)
  } catch (e) {
    taskError.value = e.message
  } finally {
    taskSaving.value = false
  }
}

async function toggleTask(task) {
  const newStatus = task.status === 'DONE' ? 'PENDING' : 'DONE'
  await store.updateTask(task.id, { status: newStatus })
}

async function togglePlan(id) {
  if (activePlanId.value === id) {
    activePlanId.value = null
    return
  }
  activePlanId.value = id
  await store.fetchPlan(id)
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour   = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

onMounted(async () => {
  await Promise.all([
    store.fetchPlans(),
    store.fetchToday(),
    disciplineStore.fetchAll()
  ])
})
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }
.main { flex: 1; padding: 32px 40px; max-width: 900px; }

/* Header */
.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 24px;
}
.page-header h2 { font-size: 20px; font-weight: 800; }

/* Today strip */
.today-strip { padding: 20px 24px; margin-bottom: 28px; }

.today-strip-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 16px;
}
.today-strip-left  { display: flex; align-items: center; gap: 12px; }
.today-strip-right { display: flex; align-items: center; gap: 12px; }

.today-label {
  font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--accent);
  font-weight: 700;
}
.today-date {
  font-size: 13px; color: var(--text-secondary);
}

/* Completion pill */
.completion-pill   { display: flex; align-items: center; gap: 8px; }
.completion-bar-wrap { width: 80px; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
.completion-bar    { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.5s ease; }
.completion-text   { font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono); }

/* Task rows */
.today-tasks { display: flex; flex-direction: column; gap: 6px; }
.today-empty { display: flex; align-items: center; gap: 12px; padding: 8px 0; }

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  border: 1px solid var(--border);
  transition: all var(--transition);
  position: relative;
}
.task-row:hover { border-color: var(--border-light); }
.task-row.done  { opacity: 0.5; }
.task-row.compact { padding: 8px 10px; }

.task-check {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border-light);
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
  color: #000;
  flex-shrink: 0;
  transition: all var(--transition);
}
.task-check.small { width: 18px; height: 18px; font-size: 10px; }
.task-check.checked  { background: var(--green); border-color: var(--green); }
.task-check:not(.checked):hover { border-color: var(--accent); }

.task-info  { flex: 1; min-width: 0; }
.task-title {
  font-size: 13px; font-weight: 600; color: var(--text-primary);
  display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.task-row.done .task-title { text-decoration: line-through; color: var(--text-muted); }

.task-meta  { display: flex; align-items: center; gap: 6px; margin-top: 3px; }

.task-tag {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
  font-family: var(--font-mono); padding: 1px 7px; border-radius: 999px;
}
.task-tag.discipline { background: var(--accent-dim); color: var(--accent); }
.task-tag.work       { background: var(--green-dim);  color: var(--green); }
.task-tag.personal   { background: rgba(251,146,60,0.15); color: #fb923c; }
.task-tag.health     { background: rgba(96,165,250,0.15); color: #60a5fa; }
.task-tag.learning   { background: rgba(167,139,250,0.15); color: #a78bfa; }
.task-tag.general    { background: var(--bg-card); color: var(--text-muted); }

.task-time { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }

/* Priority dot */
.task-priority-dot {
  width: 7px; height: 7px;
  border-radius: 50%; flex-shrink: 0;
}
.task-priority-dot.high   { background: var(--red); }
.task-priority-dot.medium { background: #fb923c; }
.task-priority-dot.low    { background: var(--green); }

/* Task action buttons */
.task-actions { display: none; gap: 4px; }
.task-row:hover .task-actions { display: flex; }

.task-action-btn {
  width: 22px; height: 22px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 11px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
}
.task-action-btn:hover       { border-color: var(--accent); color: var(--accent); }
.task-action-btn.danger:hover { background: var(--red-dim); color: var(--red); border-color: var(--red); }

/* Section header */
.section-header { margin: 8px 0 16px; }
.section-header h3 { font-size: 16px; font-weight: 700; }

/* Empty / loading */
.loading-state, .empty-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  padding: 60px; text-align: center;
}
.empty-state h3 { font-size: 17px; font-weight: 700; }

/* Plans list */
.plans-list { display: flex; flex-direction: column; gap: 12px; }

/* Plan card */
.plan-card { padding: 0; overflow: hidden; }

.plan-card-header {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  cursor: pointer;
  transition: background var(--transition);
  gap: 16px;
}
.plan-card-header:hover { background: var(--bg-hover); }

.plan-card-left  { display: flex; align-items: center; gap: 14px; flex: 1; }
.plan-card-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.plan-month-badge {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--accent);
  background: var(--accent-dim); padding: 4px 10px;
  border-radius: var(--radius-sm); white-space: nowrap;
}

.plan-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }

.plan-status-badge {
  font-size: 10px; font-family: var(--font-mono);
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 2px 8px; border-radius: 999px;
}
.plan-status-badge.active    { background: var(--green-dim); color: var(--green); }
.plan-status-badge.completed { background: rgba(96,165,250,0.15); color: #60a5fa; }
.plan-status-badge.archived  { background: var(--bg-hover); color: var(--text-muted); }

.dc-btn {
  width: 26px; height: 26px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: none;
  color: var(--text-secondary); font-size: 12px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
}
.dc-btn.danger:hover { background: var(--red-dim); color: var(--red); border-color: var(--red); }

.plan-chevron {
  font-size: 18px; color: var(--text-muted);
  transition: transform var(--transition); display: inline-block;
}
.plan-chevron.open { transform: rotate(90deg); }

/* Weekly breakdown */
.weeks-wrap { border-top: 1px solid var(--border); padding: 0 20px 20px; }

.week-block { padding: 16px 0; border-bottom: 1px solid var(--border); }
.week-block:last-child { border-bottom: none; }

.week-header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 8px; flex-wrap: wrap;
}

.week-num {
  font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--accent);
  background: var(--accent-dim); padding: 2px 8px;
  border-radius: 999px; white-space: nowrap;
}
.week-theme {
  font-size: 13px; font-weight: 700; color: var(--text-primary); flex: 1;
}
.week-dates { font-size: 11px; }
.week-progress {
  font-size: 11px; color: var(--text-secondary);
  background: var(--bg-hover); border: 1px solid var(--border);
  padding: 1px 8px; border-radius: 999px;
}

.week-focus {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--bg-hover);
  border-left: 3px solid var(--accent);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 12px; line-height: 1.5;
}

.week-tasks { display: flex; flex-direction: column; gap: 6px; }
.week-no-tasks { padding: 8px 0; font-style: italic; }

/* Expand transition */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 2000px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px; z-index: 1000;
}
.modal-box { width: 100%; max-width: 480px; }
.modal-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 20px;
}
.modal-header h3 { font-size: 17px; font-weight: 700; }
.modal-body { display: flex; flex-direction: column; gap: 16px; }

.form-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}

/* Toggle button */
.toggle-row { margin-top: 4px; }
.toggle-btn {
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 13px; font-weight: 600;
  font-family: var(--font-display);
  cursor: pointer; transition: all var(--transition);
  width: 100%; text-align: left;
}
.toggle-btn.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

.modal-footer-row {
  display: flex; justify-content: flex-end;
  gap: 10px; margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>