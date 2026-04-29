<template>
  <div class="dashboard">
    <AppSidebar active="timetable" />

    <main class="timetable-main">

      <!-- ── Header ─────────────────────────────────────────────── -->
      <div class="tt-header">
        <div class="tt-header-left">
          <h2 class="tt-title">Timetable</h2>
          <div class="date-nav">
            <button class="icon-btn" @click="shiftDay(-1)" title="Previous day">‹</button>
            <span class="current-date mono">{{ formattedDate }}</span>
            <button class="icon-btn" @click="shiftDay(1)"  title="Next day">›</button>
            <button class="today-btn" v-if="!isToday" @click="goToToday">Today</button>
          </div>
        </div>
        <div class="tt-header-right">
          <div class="completion-pill" v-if="totalBlocks > 0">
            <div class="completion-bar-wrap">
              <div class="completion-bar" :style="{ width: completionPct + '%' }" />
            </div>
            <span class="mono completion-text">{{ completedBlocks }}/{{ totalBlocks }} done</span>
          </div>
          <!-- FIX 1: Use openNewRecurringModal() instead of direct showRecurringModal = true -->
          <button class="btn btn-ghost btn-sm" @click="openNewRecurringModal()">
            🔁 Recurring
          </button>
          <button class="btn btn-primary btn-sm" @click="openCreateModal()">
            + Add block
          </button>
        </div>
      </div>

      <!-- ── Body ───────────────────────────────────────────────── -->
      <div class="tt-body">

        <!-- ── Timeline ─────────────────────────────────────────── -->
        <div class="timeline-wrap">
          <div class="timeline" ref="timelineEl">

            <div v-if="loadingSchedule" class="timeline-loading">
              <div class="spinner" />
              <span class="text-secondary text-sm">Loading schedule…</span>
            </div>

            <template v-else>
              <!-- Now line -->
              <div class="now-line" v-if="isToday"
                   :style="{ top: nowLineTop + 'px' }">
                <div class="now-dot" />
                <div class="now-label mono">{{ currentTimeStr }}</div>
              </div>

              <!-- 24 hour rows -->
              <div
                v-for="hour in visibleHours"
                :key="hour"
                class="hour-row"
                :class="{
                  'hour-row--past': isPastHour(hour),
                  'hour-row--hover': dragHoverHour === hour
                }"
                @dragover.prevent="onDragOverHour(hour)"
                @dragleave="onDragLeaveHour"
                @drop.prevent="onDropToHour($event, hour)"
              >
                <div class="hour-label mono">{{ formatHour(hour) }}</div>
                <div class="hour-slot">
                  <div
                    v-for="block in getBlocksForHour(hour)"
                    :key="block.id"
                    class="time-block"
                    :class="[
                      'time-block--' + (block.category || 'personal').toLowerCase(),
                      'time-block--' + (block.status  || 'pending').toLowerCase(),
                      { 'time-block--recurring': block.recurring || block.autoScheduled }
                    ]"
                    :style="blockStyle(block)"
                    draggable="true"
                    @dragstart="onDragStartBlock($event, block)"
                    @click.stop="openEditModal(block)"
                  >
                    <div class="block-top">
                      <span class="block-cat-dot" />
                      <span v-if="block.recurring || block.autoScheduled"
                            class="block-recurring-badge" title="Recurring">🔁</span>
                      <span class="block-time mono">
                        {{ formatTime(block.startTime) }} – {{ formatTime(block.endTime) }}
                      </span>
                      <span class="block-duration mono">{{ blockDuration(block) }}m</span>
                    </div>
                    <div class="block-title">{{ block.title }}</div>
                    <div class="block-actions" @click.stop>
                      <button
                        class="block-action-btn"
                        :class="{ active: block.status === 'DONE' }"
                        @click="toggleDone(block)"
                        :title="block.status === 'DONE' ? 'Mark pending' : 'Mark done'"
                      >{{ block.status === 'DONE' ? '✓' : '○' }}</button>
                      <button
                        class="block-action-btn danger"
                        @click="deleteBlock(block.id)"
                        title="Delete"
                      >×</button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- ── Task Panel ────────────────────────────────────────── -->
        <div class="task-panel">

          <div class="panel-header">
            <span class="panel-header-title">Task Panel</span>
            <span class="panel-count mono">{{ pendingTasks.length }} tasks</span>
          </div>

          <!-- Today's pending tasks (drag-and-drop) -->
          <div class="panel-section">
            <div class="panel-section-title">Today's Tasks</div>

            <div v-if="loadingTasks" class="panel-loading">
              <div class="spinner" style="width:16px;height:16px" />
            </div>

            <div v-else-if="pendingTasks.length === 0" class="panel-empty">
              <div class="panel-empty-icon">✓</div>
              <p class="text-muted text-sm" style="text-align:center">
                All tasks scheduled.
              </p>
            </div>

            <div
              v-for="task in pendingTasks"
              :key="'t-' + task.id"
              class="panel-task"
              draggable="true"
              @dragstart="onDragStartTask($event, task)"
              :title="task.priority + ' priority · drag to schedule'"
            >
              <div class="panel-task-left">
                <span class="priority-dot" :class="(task.priority || 'medium').toLowerCase()" />
                <div class="panel-task-info">
                  <span class="panel-task-label">{{ task.title }}</span>
                  <span class="panel-task-meta mono">
                    {{ task.durationMinutes || 30 }}m · {{ task.category || 'GENERAL' }}
                  </span>
                </div>
              </div>
              <span class="drag-handle" title="Drag me">⠿</span>
            </div>
          </div>

          <!-- Recurring habits list -->
          <div class="panel-section">
            <div class="panel-section-title">Daily Recurring</div>

            <div v-if="recurringHabits.length === 0" class="text-muted text-sm"
                 style="padding:4px 0 8px">
              No recurring habits yet.
            </div>

            <div
              v-for="rh in recurringHabits"
              :key="'rh-' + rh.id"
              class="panel-recurring"
            >
              <span class="recurring-icon">🔁</span>
              <div class="panel-task-info" style="flex:1;min-width:0">
                <span class="panel-task-label">{{ rh.title }}</span>
                <span class="panel-task-meta mono">
                  {{ formatTime(rh.startTime) }} – {{ formatTime(rh.endTime) }}
                </span>
              </div>
              <button class="panel-edit-btn" @click="openEditRecurring(rh)" title="Edit">✎</button>
            </div>

            <!-- FIX 1: Use openNewRecurringModal() here too -->
            <button class="panel-quick-btn" @click="openNewRecurringModal()">
              <span style="color:var(--accent);font-size:14px">+</span>
              Add recurring habit
            </button>
          </div>

          <!-- Quick add -->
          <div class="panel-section">
            <div class="panel-section-title">Quick Add</div>
            <button class="panel-quick-btn" @click="openCreateModal({ category: 'WORK' })">
              <span class="qb-dot work" />Work block
            </button>
            <button class="panel-quick-btn" @click="openCreateModal({ category: 'PERSONAL' })">
              <span class="qb-dot personal" />Personal block
            </button>
            <button class="panel-quick-btn" @click="openCreateModal({ category: 'DISCIPLINE' })">
              <span class="qb-dot discipline" />Discipline block
            </button>
          </div>

          <!-- Legend -->
          <div class="panel-legend">
            <div class="panel-section-title" style="margin-bottom:10px">Legend</div>
            <div class="legend-row"><span class="legend-dot habit" /><span>Habit</span></div>
            <div class="legend-row"><span class="legend-dot discipline" /><span>Discipline</span></div>
            <div class="legend-row"><span class="legend-dot work" /><span>Work</span></div>
            <div class="legend-row"><span class="legend-dot personal" /><span>Personal</span></div>
            <div class="legend-row" style="margin-top:6px">
              <span style="font-size:12px">🔁</span>
              <span class="text-muted" style="font-size:11px">Recurring daily</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ── Add / Edit Block Modal ─────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showBlockModal" class="modal-overlay" @click.self="closeBlockModal">
          <div class="modal-box card">
            <div class="modal-header">
              <h3>{{ editingBlock ? 'Edit Block' : 'Add Block' }}</h3>
              <button class="btn btn-ghost btn-icon" @click="closeBlockModal">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Title *</label>
                <input v-model="blockForm.title" class="form-input"
                       placeholder="e.g. Deep work session" ref="blockTitleInput" />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select v-model="blockForm.category" class="form-input">
                  <option value="HABIT">Habit</option>
                  <option value="DISCIPLINE">Discipline</option>
                  <option value="WORK">Work</option>
                  <option value="PERSONAL">Personal</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Time</label>
                  <input v-model="blockForm.startTime" type="time" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Time</label>
                  <input v-model="blockForm.endTime" type="time" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Note (optional)</label>
                <textarea v-model="blockForm.description" class="form-input modal-textarea"
                          rows="2" placeholder="Any notes…" />
              </div>
              <div v-if="blockError" class="alert alert-error">{{ blockError }}</div>
            </div>
            <div class="modal-footer">
              <button v-if="editingBlock" class="btn btn-danger btn-sm" @click="deleteEditingBlock">
                Delete
              </button>
              <div class="modal-footer-right">
                <button class="btn btn-ghost" @click="closeBlockModal">Cancel</button>
                <button class="btn btn-primary" @click="submitBlock" :disabled="blockSaving">
                  <span v-if="blockSaving" class="spinner" />
                  <span v-else>{{ editingBlock ? 'Save Changes' : 'Add Block' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Recurring Habit Modal ──────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showRecurringModal" class="modal-overlay" @click.self="closeRecurringModal">
          <div class="modal-box card">
            <div class="modal-header">
              <h3>{{ editingRecurring ? 'Edit Recurring Habit' : 'New Recurring Habit' }}</h3>
              <button class="btn btn-ghost btn-icon" @click="closeRecurringModal">✕</button>
            </div>
            <div class="modal-body">

              <!-- Info banner -->
              <div class="recurring-info-banner">
                <span>🔁</span>
                <span>
                  This habit will appear in your timetable
                  <strong>every day</strong> automatically.
                  Editing the time updates all future days.
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">Habit Name *</label>
                <input v-model="rhForm.title" class="form-input"
                       placeholder="e.g. Morning Meditation" />
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <div class="category-chips">
                  <button
                    v-for="cat in categories"
                    :key="cat.value"
                    type="button"
                    class="cat-chip"
                    :class="{ selected: rhForm.category === cat.value }"
                    @click="rhForm.category = cat.value"
                  >
                    {{ cat.emoji }} {{ cat.label }}
                  </button>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Time *</label>
                  <input v-model="rhForm.startTime" type="time" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Time *</label>
                  <input v-model="rhForm.endTime" type="time" class="form-input" />
                </div>
              </div>

              <!-- Duration preview -->
              <div class="duration-preview" v-if="rhDuration > 0">
                <span>⏱</span>
                <span class="mono">{{ rhDuration }} minutes per session</span>
              </div>

              <div class="form-group">
                <label class="form-label">Description (optional)</label>
                <input v-model="rhForm.description" class="form-input"
                       placeholder="e.g. Mindfulness + breathing" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start From *</label>
                  <input v-model="rhForm.startDate" type="date" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Date (optional)</label>
                  <input v-model="rhForm.endDate" type="date" class="form-input" />
                </div>
              </div>

              <div v-if="rhError" class="alert alert-error">{{ rhError }}</div>
            </div>
            <div class="modal-footer">
              <button v-if="editingRecurring" class="btn btn-danger btn-sm"
                      @click="deactivateRecurring">
                Stop Recurring
              </button>
              <div class="modal-footer-right">
                <button class="btn btn-ghost" @click="closeRecurringModal">Cancel</button>
                <button class="btn btn-primary" @click="submitRecurring" :disabled="rhSaving">
                  <span v-if="rhSaving" class="spinner" />
                  <span v-else>
                    {{ editingRecurring ? 'Update All Future' : 'Create Recurring' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import apiClient  from '@/services/apiClient'

// ─────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────

// Schedule
const blocks          = ref([])
const loadingSchedule = ref(false)
const selectedDate    = ref(new Date().toISOString().split('T')[0])

// Tasks
const todayTasks   = ref([])
const loadingTasks = ref(false)

// Recurring habits
const recurringHabits = ref([])

// Clock
const currentTime = ref(new Date())
let   clockInterval = null

// Timeline ref
const timelineEl = ref(null)

// Drag state
let draggedBlock = null
let draggedTask  = null
const dragHoverHour = ref(null)

// Block modal
const showBlockModal  = ref(false)
const editingBlock    = ref(null)
const blockSaving     = ref(false)
const blockError      = ref('')
const blockTitleInput = ref(null)
const blockForm = ref({
  title: '', category: 'PERSONAL', startTime: '09:00', endTime: '10:00', description: ''
})

// Recurring modal
const showRecurringModal = ref(false)
const editingRecurring   = ref(null)
const rhSaving = ref(false)
const rhError  = ref('')
const rhForm   = ref({
  title: '', description: '', category: 'HABIT',
  startTime: '06:00', endTime: '07:00',
  startDate: new Date().toISOString().split('T')[0],
  endDate: ''
})

// ─────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────

const visibleHours = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT  = 64
const todayStr     = new Date().toISOString().split('T')[0]

const categories = [
  { value: 'HABIT',      label: 'Habit',      emoji: '◧' },
  { value: 'DISCIPLINE', label: 'Discipline', emoji: '🎯' },
  { value: 'WORK',       label: 'Work',       emoji: '💼' },
  { value: 'PERSONAL',   label: 'Personal',   emoji: '🌱' },
]

// ─────────────────────────────────────────────────────────────────────
// COMPUTED
// ─────────────────────────────────────────────────────────────────────

const isToday = computed(() => selectedDate.value === todayStr)

const formattedDate = computed(() => {
  const d = new Date(selectedDate.value + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  })
})

const currentTimeStr = computed(() => {
  const h = String(currentTime.value.getHours()).padStart(2, '0')
  const m = String(currentTime.value.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})

const nowLineTop = computed(() => {
  const h = currentTime.value.getHours()
  const m = currentTime.value.getMinutes()
  return h * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT
})

const totalBlocks     = computed(() => blocks.value.length)
const completedBlocks = computed(() =>
  blocks.value.filter(b => b.status === 'DONE').length
)
const completionPct = computed(() =>
  totalBlocks.value > 0
    ? Math.round((completedBlocks.value / totalBlocks.value) * 100)
    : 0
)

// Pending tasks (not yet scheduled or still pending)
const pendingTasks = computed(() =>
  todayTasks.value.filter(t =>
    t.status === 'PENDING' || t.status === 'IN_PROGRESS'
  )
)

// Duration computed for recurring form
const rhDuration = computed(() => {
  if (!rhForm.value.startTime || !rhForm.value.endTime) return 0
  const [sh, sm] = rhForm.value.startTime.split(':').map(Number)
  const [eh, em] = rhForm.value.endTime.split(':').map(Number)
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  return diff > 0 ? diff : 0
})

// ─────────────────────────────────────────────────────────────────────
// BLOCK HELPERS
// ─────────────────────────────────────────────────────────────────────

function parseTime(t) {
  if (!t) return { h: 0, m: 0 }
  const parts = String(t).split(':')
  return { h: parseInt(parts[0]) || 0, m: parseInt(parts[1]) || 0 }
}

function formatTime(t) {
  if (!t) return ''
  const { h, m } = parseTime(t)
  const period = h < 12 ? 'AM' : 'PM'
  const hour   = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatHour(h) {
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function getBlocksForHour(hour) {
  return blocks.value.filter(block => {
    const { h } = parseTime(block.startTime)
    return h === hour
  })
}

function blockDuration(block) {
  const { h: sh, m: sm } = parseTime(block.startTime)
  const { h: eh, m: em } = parseTime(block.endTime)
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
}

function blockStyle(block) {
  const { m: sm } = parseTime(block.startTime)
  const duration  = blockDuration(block)
  const topOffset = (sm / 60) * HOUR_HEIGHT
  const height    = Math.max((duration / 60) * HOUR_HEIGHT - 4, 28)
  return { top: `${topOffset + 2}px`, height: `${height}px` }
}

function isPastHour(hour) {
  if (!isToday.value) return false
  return hour < currentTime.value.getHours()
}

// ─────────────────────────────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────────────────────────────

async function fetchDaySchedule() {
  loadingSchedule.value = true
  try {
    const { data } = await apiClient.get('/timetable/day', {
      params: { date: selectedDate.value }
    })
    blocks.value = data?.blocks ?? data ?? []
  } catch (e) {
    console.error('Failed to load schedule:', e.message)
    blocks.value = []
  } finally {
    loadingSchedule.value = false
  }
}

async function fetchTodayTasks() {
  loadingTasks.value = true
  try {
    const { data } = await apiClient.get('/plans/tasks/today')
    todayTasks.value = data?.tasks ?? []
  } catch (e) {
    todayTasks.value = []
  } finally {
    loadingTasks.value = false
  }
}

async function fetchRecurringHabits() {
  try {
    const { data } = await apiClient.get('/recurring-habits')
    recurringHabits.value = data ?? []
  } catch (e) {
    recurringHabits.value = []
  }
}

async function apiCreateBlock(payload) {
  const { data } = await apiClient.post('/timetable', {
    ...payload,
    date: selectedDate.value
  })
  blocks.value.push(data)
  blocks.value.sort((a, b) =>
    String(a.startTime).localeCompare(String(b.startTime))
  )
  return data
}

async function apiUpdateBlock(id, payload) {
  const { data } = await apiClient.put(`/timetable/${id}`, payload)
  const idx = blocks.value.findIndex(b => b.id === id)
  if (idx !== -1) blocks.value[idx] = data
  return data
}

async function apiUpdateStatus(id, status) {
  const { data } = await apiClient.patch(`/timetable/${id}/status`, { status })
  const idx = blocks.value.findIndex(b => b.id === id)
  if (idx !== -1) blocks.value[idx] = data
}

async function apiDeleteBlock(id) {
  await apiClient.delete(`/timetable/${id}`)
  blocks.value = blocks.value.filter(b => b.id !== id)
}

async function apiUpdateTaskStatus(taskId, status) {
  try {
    await apiClient.put(`/plans/tasks/${taskId}`, { status })
    const idx = todayTasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) todayTasks.value[idx].status = status
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────────────
// DATE NAVIGATION
// ─────────────────────────────────────────────────────────────────────

function shiftDay(delta) {
  const d = new Date(selectedDate.value + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  selectedDate.value = d.toISOString().split('T')[0]
  fetchDaySchedule()
}

function goToToday() {
  selectedDate.value = todayStr
  fetchDaySchedule()
}

// ─────────────────────────────────────────────────────────────────────
// BLOCK ACTIONS
// ─────────────────────────────────────────────────────────────────────

async function toggleDone(block) {
  const newStatus = block.status === 'DONE' ? 'PENDING' : 'DONE'
  await apiUpdateStatus(block.id, newStatus)
}

async function deleteBlock(id) {
  if (!confirm('Delete this block?')) return
  await apiDeleteBlock(id)
}

// ─────────────────────────────────────────────────────────────────────
// DRAG & DROP
// ─────────────────────────────────────────────────────────────────────

function onDragStartBlock(event, block) {
  draggedBlock = block
  draggedTask  = null
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('dragType', 'block')
}

function onDragStartTask(event, task) {
  draggedTask  = task
  draggedBlock = null
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('dragType', 'task')
}

function onDragOverHour(hour) {
  dragHoverHour.value = hour
}

function onDragLeaveHour() {
  dragHoverHour.value = null
}

async function onDropToHour(event, targetHour) {
  dragHoverHour.value = null
  const dragType = event.dataTransfer.getData('dragType')

  if (dragType === 'block' && draggedBlock) {
    const { m: sm } = parseTime(draggedBlock.startTime)
    const duration  = blockDuration(draggedBlock)

    const newStartH = targetHour
    const newStartM = sm
    const totalEndM = newStartH * 60 + newStartM + duration
    const newEndH   = Math.min(Math.floor(totalEndM / 60), 23)
    const newEndM   = totalEndM % 60

    const newStart = `${String(newStartH).padStart(2,'0')}:${String(newStartM).padStart(2,'0')}:00`
    const newEnd   = `${String(newEndH).padStart(2,'0')}:${String(newEndM).padStart(2,'0')}:00`

    await apiUpdateBlock(draggedBlock.id, { startTime: newStart, endTime: newEnd })
    draggedBlock = null
  }

  if (dragType === 'task' && draggedTask) {
    const duration = draggedTask.durationMinutes ?? 30
    const startH   = targetHour
    const totalEnd = startH * 60 + duration
    const endH     = Math.min(Math.floor(totalEnd / 60), 23)
    const endM     = totalEnd % 60

    const startTime = `${String(startH).padStart(2,'0')}:00:00`
    const endTime   = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}:00`

    await apiCreateBlock({
      title:       draggedTask.title,
      category:    draggedTask.category ?? 'PERSONAL',
      startTime,
      endTime,
      description: draggedTask.description ?? '',
    })

    await apiUpdateTaskStatus(draggedTask.id, 'IN_PROGRESS')
    draggedTask = null
  }
}

// ─────────────────────────────────────────────────────────────────────
// BLOCK MODAL
// ─────────────────────────────────────────────────────────────────────

function openCreateModal(prefill = null) {
  editingBlock.value = null
  blockError.value   = ''
  blockForm.value = {
    title:       prefill?.title       ?? '',
    category:    prefill?.category    ?? 'PERSONAL',
    startTime:   prefill?.startTime   ?? '09:00',
    endTime:     prefill?.endTime     ?? '10:00',
    description: prefill?.description ?? '',
  }
  showBlockModal.value = true
  nextTick(() => blockTitleInput.value?.focus())
}

function openEditModal(block) {
  editingBlock.value = block
  blockError.value   = ''
  const st = String(block.startTime ?? '09:00').substring(0, 5)
  const et = String(block.endTime   ?? '10:00').substring(0, 5)
  blockForm.value = {
    title:       block.title       ?? '',
    category:    block.category    ?? 'PERSONAL',
    startTime:   st,
    endTime:     et,
    description: block.description ?? '',
  }
  showBlockModal.value = true
}

function closeBlockModal() {
  showBlockModal.value = false
  editingBlock.value   = null
  blockError.value     = ''
}

async function submitBlock() {
  blockError.value = ''
  if (!blockForm.value.title.trim()) {
    blockError.value = 'Title is required'; return
  }
  if (blockForm.value.startTime >= blockForm.value.endTime) {
    blockError.value = 'End time must be after start time'; return
  }
  blockSaving.value = true
  try {
    const payload = {
      title:       blockForm.value.title,
      category:    blockForm.value.category,
      startTime:   blockForm.value.startTime + ':00',
      endTime:     blockForm.value.endTime   + ':00',
      description: blockForm.value.description,
    }
    if (editingBlock.value) {
      await apiUpdateBlock(editingBlock.value.id, payload)
    } else {
      await apiCreateBlock(payload)
    }
    closeBlockModal()
  } catch (e) {
    // FIX 3: Improved error extraction to handle multiple API response shapes
    const d = e?.response?.data
    blockError.value = d?.error ?? d?.message ?? d?.detail ?? e.message ?? 'Something went wrong'
  } finally {
    blockSaving.value = false
  }
}

async function deleteEditingBlock() {
  if (!editingBlock.value || !confirm('Delete this block?')) return
  await apiDeleteBlock(editingBlock.value.id)
  closeBlockModal()
}

// ─────────────────────────────────────────────────────────────────────
// RECURRING HABIT MODAL
// ─────────────────────────────────────────────────────────────────────

// FIX 1: Dedicated function to open modal for NEW recurring habit.
// Always resets editingRecurring to null so the modal never accidentally
// fires a PUT (update) instead of a POST (create) due to stale state.
function openNewRecurringModal() {
  editingRecurring.value = null
  rhError.value = ''
  rhForm.value = {
    title: '', description: '', category: 'HABIT',
    startTime: '06:00', endTime: '07:00',
    startDate: todayStr,
    endDate: ''
  }
  showRecurringModal.value = true
}

function openEditRecurring(rh) {
  editingRecurring.value = rh
  rhError.value = ''
  rhForm.value = {
    title:       rh.title       ?? '',
    description: rh.description ?? '',
    category:    rh.category    ?? 'HABIT',
    startTime:   String(rh.startTime ?? '06:00').substring(0, 5),
    endTime:     String(rh.endTime   ?? '07:00').substring(0, 5),
    startDate:   rh.startDate   ?? todayStr,
    endDate:     rh.endDate     ?? '',
  }
  showRecurringModal.value = true
}

function closeRecurringModal() {
  showRecurringModal.value = false
  editingRecurring.value   = null
  rhError.value = ''
  rhForm.value = {
    title: '', description: '', category: 'HABIT',
    startTime: '06:00', endTime: '07:00',
    startDate: todayStr, endDate: ''
  }
}

async function submitRecurring() {
  rhError.value = ''

  // ── Validation ──────────────────────────────────────────────────
  if (!rhForm.value.title.trim()) {
    rhError.value = 'Title is required'; return
  }
  if (!rhForm.value.startTime || !rhForm.value.endTime) {
    rhError.value = 'Start and end time are required'; return
  }
  if (rhDuration.value <= 0) {
    rhError.value = 'End time must be after start time'; return
  }
  // FIX 2: Guard against missing startDate — the API requires it and
  // will reject silently without this client-side check.
  if (!rhForm.value.startDate) {
    rhError.value = 'Start date is required'; return
  }

  rhSaving.value = true
  try {
    const payload = {
      title:       rhForm.value.title.trim(),
      description: rhForm.value.description || null,
      category:    rhForm.value.category,
      startTime:   rhForm.value.startTime + ':00',
      endTime:     rhForm.value.endTime   + ':00',
      startDate:   rhForm.value.startDate,
      endDate:     rhForm.value.endDate   || null,
    }

    if (editingRecurring.value) {
      // Editing an existing recurring habit → PUT
      const { data } = await apiClient.put(
        `/recurring-habits/${editingRecurring.value.id}`, payload
      )
      const idx = recurringHabits.value.findIndex(
        r => r.id === editingRecurring.value.id
      )
      if (idx !== -1) recurringHabits.value[idx] = data
    } else {
      // Creating a new recurring habit → POST
      const { data } = await apiClient.post('/recurring-habits', payload)
      recurringHabits.value.unshift(data)
    }

    closeRecurringModal()
    // Refresh timeline to show newly created/updated blocks
    await fetchDaySchedule()
  } catch (e) {
    // FIX 3: Extract error message from multiple possible API response shapes
    // (e.g. { error }, { message }, { detail }) so rhError is never blank
    const d = e?.response?.data
    rhError.value = d?.error ?? d?.message ?? d?.detail ?? e.message ?? 'Something went wrong'
  } finally {
    rhSaving.value = false
  }
}

async function deactivateRecurring() {
  if (!editingRecurring.value) return
  if (!confirm('Stop this recurring habit? All future pending blocks will be removed.')) return
  try {
    await apiClient.delete(`/recurring-habits/${editingRecurring.value.id}`)
    recurringHabits.value = recurringHabits.value.filter(
      r => r.id !== editingRecurring.value.id
    )
    closeRecurringModal()
    await fetchDaySchedule()
  } catch (e) {
    const d = e?.response?.data
    rhError.value = d?.error ?? d?.message ?? d?.detail ?? e.message ?? 'Failed to deactivate'
  }
}

// ─────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([
    fetchDaySchedule(),
    fetchTodayTasks(),
    fetchRecurringHabits(),
  ])

  clockInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)

  // Scroll to current hour on load
  setTimeout(() => {
    if (timelineEl.value && isToday.value) {
      const scrollTarget = Math.max(0, nowLineTop.value - 120)
      timelineEl.value.scrollTop = scrollTarget
    }
  }, 400)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<style scoped>
/* ── Layout ───────────────────────────────────────────────────────── */
.dashboard       { display: flex; min-height: 100vh; }
.timetable-main  {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; height: 100vh;
}

/* ── Header ───────────────────────────────────────────────────────── */
.tt-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px; border-bottom: 1px solid var(--border);
  background: var(--bg-card); flex-shrink: 0;
}
.tt-header-left  { display: flex; align-items: center; gap: 24px; }
.tt-header-right { display: flex; align-items: center; gap: 12px; }
.tt-title { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); }

.date-nav { display: flex; align-items: center; gap: 6px; }
.current-date {
  font-size: 13px; color: var(--text-secondary);
  min-width: 180px; text-align: center; font-family: var(--font-mono);
}

.icon-btn {
  background: var(--bg-hover); border: 1px solid var(--border);
  color: var(--text-secondary); font-size: 18px; cursor: pointer;
  padding: 4px 10px; border-radius: var(--radius-sm);
  transition: all var(--transition); line-height: 1;
}
.icon-btn:hover { border-color: var(--border-light); color: var(--text-primary); }

.today-btn {
  font-size: 12px; font-weight: 600; padding: 4px 12px;
  border: 1px solid var(--accent); border-radius: var(--radius-sm);
  background: var(--accent-dim); color: var(--accent);
  cursor: pointer; font-family: var(--font-display); transition: all var(--transition);
}
.today-btn:hover { background: var(--accent); color: #fff; }

.completion-pill   { display: flex; align-items: center; gap: 10px; }
.completion-bar-wrap {
  width: 90px; height: 6px; background: var(--border);
  border-radius: 3px; overflow: hidden;
}
.completion-bar {
  height: 100%; background: var(--accent); border-radius: 3px;
  transition: width 0.5s ease;
}
.completion-text { font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono); }

/* ── Body ─────────────────────────────────────────────────────────── */
.tt-body { display: flex; flex: 1; overflow: hidden; }

/* ── Timeline ─────────────────────────────────────────────────────── */
.timeline-wrap { flex: 1; overflow-y: auto; background: var(--bg); }
.timeline      { position: relative; padding: 8px 0 40px; }
.timeline-loading {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px; padding: 80px 40px;
}

/* Now line */
.now-line {
  position: absolute; left: 0; right: 0;
  display: flex; align-items: center;
  pointer-events: none; z-index: 10;
}
.now-dot {
  width: 9px; height: 9px; background: var(--accent);
  border-radius: 50%; flex-shrink: 0;
  margin-left: 56px; box-shadow: 0 0 8px var(--accent-glow);
}
.now-line::after {
  content: ''; flex: 1; height: 1px;
  background: var(--accent); opacity: 0.5; margin-right: 12px;
}
.now-label {
  font-size: 10px; color: var(--accent);
  flex-shrink: 0; padding-right: 12px; font-family: var(--font-mono);
}

/* Hour rows */
.hour-row {
  display: flex; min-height: 64px; position: relative;
  border-top: 1px solid var(--border);
  transition: background var(--transition);
}
.hour-row:hover        { background: rgba(124, 106, 247, 0.04); }
.hour-row--past        { opacity: 0.45; }
.hour-row--hover       { background: rgba(124, 106, 247, 0.08) !important; }

.hour-label {
  width: 60px; flex-shrink: 0; font-size: 11px;
  color: var(--text-muted); padding: 6px 10px 0 14px;
  text-align: right; font-family: var(--font-mono); letter-spacing: 0.02em;
}

.hour-slot {
  flex: 1; position: relative; min-height: 64px; padding-right: 16px;
}

/* ── Time blocks ──────────────────────────────────────────────────── */
.time-block {
  position: absolute; left: 6px; right: 6px;
  border-radius: var(--radius-sm); padding: 5px 10px;
  cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
  border-left: 3px solid transparent;
  overflow: hidden; display: flex; flex-direction: column; gap: 3px; z-index: 2;
}
.time-block:hover { transform: translateX(3px); box-shadow: 0 2px 12px rgba(0,0,0,0.3); }

.time-block--habit      { background: rgba(55,138,221,0.15);  border-color: #378ADD; }
.time-block--discipline { background: rgba(124,106,247,0.15); border-color: var(--accent); }
.time-block--work       { background: rgba(52,211,153,0.15);  border-color: var(--green); }
.time-block--personal   { background: rgba(251,146,60,0.15);  border-color: #FB923C; }

.time-block--recurring  { border-style: dashed; border-width: 2px; }
.time-block--done       { opacity: 0.55; }
.time-block--done .block-title { text-decoration: line-through; }
.time-block--skipped    { opacity: 0.3; }

.block-top  { display: flex; align-items: center; gap: 5px; }
.block-cat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.time-block--habit      .block-cat-dot { background: #378ADD; }
.time-block--discipline .block-cat-dot { background: var(--accent); }
.time-block--work       .block-cat-dot { background: var(--green); }
.time-block--personal   .block-cat-dot { background: #FB923C; }

.block-recurring-badge { font-size: 10px; flex-shrink: 0; }
.block-time   { font-size: 10px; color: var(--text-secondary); flex: 1; font-family: var(--font-mono); }
.block-duration { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }
.block-title  {
  font-size: 12px; font-weight: 600; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.block-actions { display: none; position: absolute; top: 5px; right: 8px; gap: 4px; align-items: center; }
.time-block:hover .block-actions { display: flex; }

.block-action-btn {
  width: 22px; height: 22px; border-radius: var(--radius-sm);
  border: 1px solid var(--border-light); background: var(--bg-card);
  color: var(--text-secondary); font-size: 12px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
}
.block-action-btn:hover       { border-color: var(--accent); color: var(--accent); }
.block-action-btn.active      { background: var(--green); color: #000; border-color: var(--green); }
.block-action-btn.danger:hover { background: var(--red); color: #fff; border-color: var(--red); }

/* ── Task Panel ───────────────────────────────────────────────────── */
.task-panel {
  width: 240px; flex-shrink: 0;
  border-left: 1px solid var(--border);
  background: var(--bg-card);
  display: flex; flex-direction: column; overflow-y: auto;
}

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 12px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.panel-header-title { font-size: 13px; font-weight: 700; color: var(--text-primary); font-family: var(--font-display); }
.panel-count        { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }

.panel-section { padding: 12px 14px; border-bottom: 1px solid var(--border); }
.panel-section-title {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 10px;
}

.panel-loading { display: flex; justify-content: center; padding: 8px 0; }

/* Task drag items */
.panel-task {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 9px 10px; border-radius: var(--radius-sm);
  background: var(--bg-hover); border: 1px solid var(--border);
  margin-bottom: 6px; cursor: grab; user-select: none;
  transition: all var(--transition);
}
.panel-task:hover  { border-color: var(--border-light); transform: translateX(2px); }
.panel-task:active { cursor: grabbing; opacity: 0.7; }

.panel-task-left { display: flex; align-items: flex-start; gap: 8px; flex: 1; min-width: 0; }

.priority-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 3px;
}
.priority-dot.high   { background: var(--red); }
.priority-dot.medium { background: #fb923c; }
.priority-dot.low    { background: var(--green); }

.panel-task-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.panel-task-label {
  font-size: 12px; font-weight: 600; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.panel-task-meta { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }
.drag-handle { font-size: 14px; color: var(--text-muted); flex-shrink: 0; }

.panel-empty {
  padding: 16px 0; display: flex; flex-direction: column;
  align-items: center; gap: 6px;
}
.panel-empty-icon { font-size: 20px; color: var(--green); }

/* Recurring items */
.panel-recurring {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: var(--radius-sm);
  background: var(--bg-hover); border: 1px solid var(--border);
  margin-bottom: 6px;
}
.recurring-icon { font-size: 14px; flex-shrink: 0; }
.panel-edit-btn {
  width: 22px; height: 22px; flex-shrink: 0;
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: transparent; color: var(--text-muted); font-size: 11px;
  cursor: pointer; transition: all var(--transition);
  display: flex; align-items: center; justify-content: center;
}
.panel-edit-btn:hover { border-color: var(--accent); color: var(--accent); }

/* Quick add buttons */
.panel-quick-btn {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 8px 10px; background: var(--bg-hover);
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  font-size: 12px; font-weight: 500; color: var(--text-secondary);
  cursor: pointer; text-align: left; margin-bottom: 6px;
  transition: all var(--transition); font-family: var(--font-display);
}
.panel-quick-btn:hover { border-color: var(--border-light); color: var(--text-primary); }

.qb-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.qb-dot.work       { background: var(--green); }
.qb-dot.personal   { background: #FB923C; }
.qb-dot.discipline { background: var(--accent); }

/* Legend */
.panel-legend { padding: 14px; margin-top: auto; border-top: 1px solid var(--border); }
.legend-row {
  display: flex; align-items: center; gap: 10px;
  font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;
  font-family: var(--font-display);
}
.legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.legend-dot.habit      { background: #378ADD; }
.legend-dot.discipline { background: var(--accent); }
.legend-dot.work       { background: var(--green); }
.legend-dot.personal   { background: #FB923C; }

/* ── Recurring modal specific ─────────────────────────────────────── */
.recurring-info-banner {
  display: flex; gap: 10px; align-items: flex-start;
  background: var(--accent-dim); border: 1px solid rgba(124,106,247,0.25);
  border-radius: var(--radius-sm); padding: 12px 14px;
  font-size: 13px; color: var(--text-secondary); line-height: 1.6;
}

.category-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.cat-chip {
  padding: 7px 14px; border-radius: 999px; border: 1px solid var(--border);
  background: var(--bg-hover); color: var(--text-secondary);
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all var(--transition); font-family: var(--font-display);
}
.cat-chip:hover    { border-color: var(--border-light); color: var(--text-primary); }
.cat-chip.selected { background: var(--accent-dim); border-color: var(--accent); color: var(--text-primary); }

.duration-preview {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: var(--green-dim);
  border: 1px solid rgba(52,211,153,0.2); border-radius: var(--radius-sm);
  color: var(--green); font-size: 13px; font-weight: 600;
}

/* ── Shared modal ─────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.65);
  backdrop-filter: blur(4px); display: flex;
  align-items: center; justify-content: center;
  padding: 24px; z-index: 1000;
}
.modal-box {
  width: 100%; max-width: 480px; background: var(--bg-card);
  border: 1px solid var(--border-light); border-radius: var(--radius);
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  max-height: 90vh; /* never taller than viewport */
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
  flex-shrink: 0; /* header never squishes */
}
.modal-header h3 { font-size: 17px; font-weight: 700; color: var(--text-primary); }

.modal-body {
  padding: 20px 24px; display: flex; flex-direction: column; gap: 16px;
  overflow-y: auto; /* scroll the body, not the whole modal */
  flex: 1;
}
.form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.modal-textarea { resize: vertical; min-height: 64px; font-family: var(--font-display); line-height: 1.5; }

.modal-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; border-top: 1px solid var(--border); gap: 10px;
  flex-shrink: 0; /* footer always visible, never pushed off screen */
}
.modal-footer-right { display: flex; gap: 10px; margin-left: auto; }

.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>