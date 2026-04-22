<template>
  <div class="dashboard">
    <AppSidebar active="timetable" />

    <main class="timetable-main">

      <!-- ── Header ───────────────────────────────────────────────── -->
      <div class="tt-header">
        <div class="tt-header-left">
          <h2 class="tt-title">Timetable</h2>
          <div class="date-nav">
            <button class="icon-btn" @click="shiftDay(-1)" title="Previous day">‹</button>
            <span class="current-date mono">{{ formattedDate }}</span>
            <button class="icon-btn" @click="shiftDay(1)" title="Next day">›</button>
            <button class="today-btn" @click="goToToday" v-if="!isToday">Today</button>
          </div>
        </div>
        <div class="tt-header-right">
          <div class="completion-pill" v-if="store.totalBlocks > 0">
            <div class="completion-bar-wrap">
              <div class="completion-bar" :style="{ width: store.completionPct + '%' }" />
            </div>
            <span class="mono completion-text">
              {{ store.completedBlocks }}/{{ store.totalBlocks }} done
            </span>
          </div>
          <button class="btn btn-primary btn-sm" @click="store.openCreateModal()">
            + Add block
          </button>
        </div>
      </div>

      <!-- ── Body ──────────────────────────────────────────────────── -->
      <div class="tt-body">

        <!-- ── Timeline ────────────────────────────────────────────── -->
        <div class="timeline-wrap">
          <div class="timeline" ref="timelineEl">

            <div v-if="store.loading" class="timeline-loading">
              <div class="spinner" />
              <span class="text-secondary text-sm">Loading schedule…</span>
            </div>

            <template v-else>
              <!-- Current time indicator -->
              <div
                class="now-line"
                v-if="isToday"
                :style="{ top: nowLineTop + 'px' }"
              >
                <div class="now-dot" />
                <div class="now-label mono">{{ currentTimeStr }}</div>
              </div>

              <!-- 24 Hour rows -->
              <div
                v-for="hour in visibleHours"
                :key="hour"
                class="hour-row"
                :class="{ 'hour-row--past': isPastHour(hour) }"
                @dragover.prevent
                @drop="onDropToHour($event, hour)"
              >
                <div class="hour-label mono">{{ formatHour(hour) }}</div>
                <div class="hour-slot">
                  <div
                    v-for="block in store.blocksByHour[hour]"
                    :key="block.id"
                    class="time-block"
                    :class="[
                      'time-block--' + block.category.toLowerCase(),
                      'time-block--' + block.status.toLowerCase(),
                    ]"
                    :style="blockStyle(block)"
                    draggable="true"
                    @dragstart="onDragStart($event, block)"
                    @click="store.openEditModal(block)"
                    :title="block.title"
                  >
                    <div class="block-top">
                      <span class="block-cat-dot" />
                      <span class="block-time mono">
                        {{ formatTime(block.startTime) }} – {{ formatTime(block.endTime) }}
                      </span>
                      <span class="block-duration mono">{{ block.durationMinutes }}m</span>
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

        <!-- ── Task Panel ───────────────────────────────────────────── -->
        <div class="task-panel">

          <div class="panel-header">
            <span class="panel-header-title">Task Panel</span>
          </div>

          <!-- Habits from habits module -->
          <div class="panel-section" v-if="store.unscheduledHabits.length > 0">
            <div class="panel-section-title">From Habits</div>
            <div
              v-for="h in store.unscheduledHabits"
              :key="'habit-' + h.id"
              class="panel-task"
              draggable="true"
              @dragstart="onDragHabit($event, h)"
              @click="prefillFromHabit(h)"
              title="Click or drag to schedule"
            >
              <span class="panel-task-dot habit-dot" />
              <span class="panel-task-label">{{ h.title }}</span>
              <span class="panel-task-badge">habit</span>
            </div>
          </div>

          <div v-else-if="!store.loading" class="panel-empty">
            <div class="panel-empty-icon">◧</div>
            <p class="text-muted text-sm">All habits scheduled for today.</p>
          </div>

          <!-- Quick add -->
          <div class="panel-section">
            <div class="panel-section-title">Quick Add</div>
            <button class="panel-quick-btn" @click="store.openCreateModal({ category: 'WORK' })">
              <span class="qb-dot work" />
              <span>Work block</span>
            </button>
            <button class="panel-quick-btn" @click="store.openCreateModal({ category: 'PERSONAL' })">
              <span class="qb-dot personal" />
              <span>Personal block</span>
            </button>
            <button class="panel-quick-btn" @click="store.openCreateModal({ category: 'DISCIPLINE' })">
              <span class="qb-dot discipline" />
              <span>Discipline block</span>
            </button>
          </div>

          <!-- Legend -->
          <div class="panel-legend">
            <div class="panel-section-title" style="margin-bottom:10px">Legend</div>
            <div class="legend-row"><span class="legend-dot habit" /><span>Habit</span></div>
            <div class="legend-row"><span class="legend-dot discipline" /><span>Discipline</span></div>
            <div class="legend-row"><span class="legend-dot work" /><span>Work</span></div>
            <div class="legend-row"><span class="legend-dot personal" /><span>Personal</span></div>
          </div>
        </div>
      </div>
    </main>

    <!-- ── Add / Edit Modal ─────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="store.showModal" class="modal-overlay" @click.self="store.closeModal()">
          <div class="modal-box card">

            <div class="modal-header">
              <h3>{{ isEditing ? 'Edit Block' : 'Add Block' }}</h3>
              <button class="btn btn-ghost btn-icon" @click="store.closeModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Title *</label>
                <input
                  v-model="form.title"
                  class="form-input"
                  placeholder="e.g. Deep work session"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <select v-model="form.category" class="form-input">
                  <option value="HABIT">Habit</option>
                  <option value="DISCIPLINE">Discipline</option>
                  <option value="WORK">Work</option>
                  <option value="PERSONAL">Personal</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Time</label>
                  <input v-model="form.startTime" type="time" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Time</label>
                  <input v-model="form.endTime" type="time" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Note (optional)</label>
                <textarea
                  v-model="form.description"
                  class="form-input modal-textarea"
                  rows="2"
                  placeholder="Any notes…"
                />
              </div>

              <div v-if="modalError" class="alert alert-error">{{ modalError }}</div>
            </div>

            <div class="modal-footer">
              <button
                v-if="isEditing"
                class="btn btn-danger btn-sm"
                @click="deleteAndClose"
              >
                Delete
              </button>
              <div class="modal-footer-right">
                <button class="btn btn-ghost" @click="store.closeModal()">Cancel</button>
                <button class="btn btn-primary" @click="submitForm" :disabled="saving">
                  <span v-if="saving" class="spinner" />
                  <span v-else>{{ isEditing ? 'Save Changes' : 'Add Block' }}</span>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { useTimetableStore } from '@/store/timetable'
import { useTheme } from '@/composables/useTheme'

const store       = useTimetableStore()
useTheme()   // initialises IST-based theme if not already running
const timelineEl  = ref(null)
const saving      = ref(false)
const modalError  = ref('')
const currentTime = ref(new Date())
let   clockInterval = null

// ── Full 24 hours ─────────────────────────────────────────────────────
const visibleHours = Array.from({ length: 24 }, (_, i) => i)

// ── Date helpers ──────────────────────────────────────────────────────
const todayStr = new Date().toISOString().split('T')[0]
const isToday  = computed(() => store.selectedDate === todayStr)

const formattedDate = computed(() => {
  const d = new Date(store.selectedDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  })
})

function shiftDay(delta) {
  const d = new Date(store.selectedDate + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  store.goToDate(d.toISOString().split('T')[0])
}

function goToToday() {
  store.goToDate(todayStr)
}

// ── Clock & now-line ──────────────────────────────────────────────────
const currentTimeStr = computed(() => {
  const h = currentTime.value.getHours().toString().padStart(2, '0')
  const m = currentTime.value.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
})

const HOUR_HEIGHT = 64
const FIRST_HOUR  = 0

const nowLineTop = computed(() => {
  const h = currentTime.value.getHours()
  const m = currentTime.value.getMinutes()
  return (h - FIRST_HOUR) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT
})

function isPastHour(hour) {
  if (!isToday.value) return false
  return hour < currentTime.value.getHours()
}

// ── Time formatting ───────────────────────────────────────────────────
function formatHour(h) {
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour   = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

// ── Block positioning ─────────────────────────────────────────────────
function blockStyle(block) {
  const [sh, sm] = block.startTime.split(':').map(Number)
  const [eh, em] = block.endTime.split(':').map(Number)
  const topOffset = (sm / 60) * HOUR_HEIGHT
  const startMins = sh * 60 + sm
  const endMins   = eh * 60 + em
  const height    = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT - 4, 28)
  return { top: topOffset + 2 + 'px', height: height + 'px' }
}

// ── Block actions ─────────────────────────────────────────────────────
async function toggleDone(block) {
  await store.updateStatus(block.id, block.status === 'DONE' ? 'PENDING' : 'DONE')
}

async function deleteBlock(id) {
  if (!confirm('Delete this block?')) return
  await store.deleteBlock(id)
}

// ── Drag & Drop ───────────────────────────────────────────────────────
let draggedBlock = null

function onDragStart(event, block) {
  draggedBlock = block
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('type', 'block')
}

async function onDropToHour(event, targetHour) {
  event.preventDefault()
  const type = event.dataTransfer.getData('type')

  if (type === 'block' && draggedBlock) {
    const [sh, sm] = draggedBlock.startTime.split(':').map(Number)
    const [eh, em] = draggedBlock.endTime.split(':').map(Number)
    const duration  = (eh * 60 + em) - (sh * 60 + sm)
    const newStart  = `${String(targetHour).padStart(2, '0')}:${String(sm).padStart(2, '0')}`
    const newEndH   = targetHour + Math.floor((sm + duration) / 60)
    const newEndM   = (sm + duration) % 60
    const newEnd    = `${String(newEndH).padStart(2, '0')}:${String(newEndM).padStart(2, '0')}`
    await store.updateBlock(draggedBlock.id, { startTime: newStart, endTime: newEnd })
    draggedBlock = null
  }

  if (type === 'habit') {
    const habitData = JSON.parse(event.dataTransfer.getData('habit'))
    store.openCreateModal({
      title:     habitData.title,
      category:  'HABIT',
      habitId:   habitData.habitId,
      startTime: `${String(targetHour).padStart(2, '0')}:00`,
      endTime:   `${String(targetHour + 1).padStart(2, '0')}:00`
    })
  }
}

function onDragHabit(event, habit) {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('type', 'habit')
  event.dataTransfer.setData('habit', JSON.stringify({
    title: habit.title, habitId: habit.habitId
  }))
}

function prefillFromHabit(habit) {
  store.openCreateModal({ title: habit.title, category: 'HABIT', habitId: habit.habitId })
}

// ── Form ──────────────────────────────────────────────────────────────
const form = ref({
  title: '', category: 'PERSONAL',
  startTime: '09:00', endTime: '10:00',
  description: '', habitId: null
})

const isEditing = computed(() =>
  store.editingBlock && store.editingBlock.id && !store.editingBlock._isNew
)

watch(() => store.showModal, (open) => {
  if (!open) { modalError.value = ''; return }
  const b = store.editingBlock
  form.value = b ? {
    title:       b.title       ?? '',
    category:    b.category    ?? 'PERSONAL',
    startTime:   b.startTime   ? b.startTime.substring(0, 5) : '09:00',
    endTime:     b.endTime     ? b.endTime.substring(0, 5)   : '10:00',
    description: b.description ?? '',
    habitId:     b.habitId     ?? null
  } : {
    title: '', category: 'PERSONAL',
    startTime: '09:00', endTime: '10:00',
    description: '', habitId: null
  }
})

async function submitForm() {
  modalError.value = ''
  if (!form.value.title.trim()) { modalError.value = 'Title is required'; return }
  if (form.value.startTime >= form.value.endTime) {
    modalError.value = 'End time must be after start time'; return
  }
  saving.value = true
  try {
    const payload = {
      title:       form.value.title,
      category:    form.value.category,
      startTime:   form.value.startTime + ':00',
      endTime:     form.value.endTime   + ':00',
      description: form.value.description
    }
    if (isEditing.value) {
      await store.updateBlock(store.editingBlock.id, payload)
    } else {
      await store.createBlock({ ...payload, habitId: form.value.habitId })
    }
    store.closeModal()
  } catch (e) {
    modalError.value = e?.response?.data?.message ?? 'Something went wrong'
  } finally {
    saving.value = false
  }
}

async function deleteAndClose() {
  if (!confirm('Delete this block?')) return
  await store.deleteBlock(store.editingBlock.id)
  store.closeModal()
}

// ── Lifecycle ─────────────────────────────────────────────────────────
onMounted(() => {
  store.fetchDaySchedule()
  store.fetchHabitSuggestions()
  clockInterval = setInterval(() => { currentTime.value = new Date() }, 60000)
  setTimeout(() => {
    if (timelineEl.value && isToday.value) {
      timelineEl.value.scrollTop = Math.max(0, nowLineTop.value - 100)
    }
  }, 300)
})

onUnmounted(() => { if (clockInterval) clearInterval(clockInterval) })
</script>

<style scoped>
/* ── Design tokens — Light theme (default) ─────────────────────────── */
:root,
:global([data-theme="light"]) {
  --bg:           #F5F4F0;
  --bg-card:      #FFFFFF;
  --bg-hover:     #F0EEE9;
  --bg-stripe:    #FAF9F7;

  --border:       #E3E0D8;
  --border-light: #C8C4BB;

  --text-primary:   #1A1917;
  --text-secondary: #5C5850;
  --text-muted:     #9C9890;

  --accent:     #2563EB;
  --accent-dim: #EFF4FF;
  --green:      #16A34A;
  --red:        #DC2626;
  --amber:      #D97706;

  /* Category palette — saturated but not harsh */
  --cat-habit-bg:      #EFF6FF;
  --cat-habit-border:  #3B82F6;
  --cat-habit-text:    #1D4ED8;

  --cat-disc-bg:      #F5F3FF;
  --cat-disc-border:  #7C3AED;
  --cat-disc-text:    #5B21B6;

  --cat-work-bg:      #ECFDF5;
  --cat-work-border:  #16A34A;
  --cat-work-text:    #166534;

  --cat-personal-bg:     #FFF7ED;
  --cat-personal-border: #EA580C;
  --cat-personal-text:   #9A3412;

  --now-color: #2563EB;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg: 0 20px 40px rgba(0,0,0,0.12);

  --radius:    10px;
  --radius-sm: 6px;
  --transition: 150ms ease;
  --font-display: 'DM Sans', 'Segoe UI', sans-serif;
  --font-mono: 'DM Mono', 'Fira Code', monospace;
}

/* ── Dark theme ────────────────────────────────────────────────────── */
:global([data-theme="dark"]) {
  --bg:           #111210;
  --bg-card:      #1C1C1A;
  --bg-hover:     #252523;
  --bg-stripe:    #191917;

  --border:       #2E2D2A;
  --border-light: #3D3C38;

  --text-primary:   #EDECE8;
  --text-secondary: #9B9A95;
  --text-muted:     #5E5D59;

  --accent:     #4F8EF7;
  --accent-dim: #1C2740;
  --green:      #34D399;
  --red:        #F87171;
  --amber:      #FBBf24;

  --cat-habit-bg:      #162032;
  --cat-habit-border:  #4F8EF7;
  --cat-habit-text:    #93C5FD;

  --cat-disc-bg:      #1E1630;
  --cat-disc-border:  #A78BFA;
  --cat-disc-text:    #C4B5FD;

  --cat-work-bg:      #0D2018;
  --cat-work-border:  #34D399;
  --cat-work-text:    #6EE7B7;

  --cat-personal-bg:     #221508;
  --cat-personal-border: #FB923C;
  --cat-personal-text:   #FDBA74;

  --now-color: #4F8EF7;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.35);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg: 0 20px 40px rgba(0,0,0,0.6);
}

/* ── Global resets ─────────────────────────────────────────────────── */
* { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Layout ──────────────────────────────────────────────────────────── */
.dashboard       { display: flex; min-height: 100vh; background: var(--bg); }
.timetable-main  { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: 100vh; }

/* ── Header ──────────────────────────────────────────────────────────── */
.tt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.tt-header-left  { display: flex; align-items: center; gap: 24px; }
.tt-header-right { display: flex; align-items: center; gap: 12px; }

.tt-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-primary);
  font-family: var(--font-display);
}

/* Date nav */
.date-nav { display: flex; align-items: center; gap: 4px; }

.current-date {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 176px;
  text-align: center;
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
}

.icon-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 17px;
  cursor: pointer;
  padding: 3px 9px;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
  line-height: 1.4;
  font-family: var(--font-display);
}
.icon-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-light);
  color: var(--text-primary);
}

.today-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--accent-dim);
  color: var(--accent);
  cursor: pointer;
  font-family: var(--font-display);
  transition: all var(--transition);
  letter-spacing: 0.02em;
}
.today-btn:hover { background: var(--accent); color: #fff; }

/* Completion pill */
.completion-pill  { display: flex; align-items: center; gap: 10px; }
.completion-bar-wrap {
  width: 80px; height: 5px;
  background: var(--border);
  border-radius: 3px; overflow: hidden;
}
.completion-bar {
  height: 100%;
  background: var(--green);
  border-radius: 3px;
  transition: width 0.5s ease;
}
.completion-text {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  white-space: nowrap;
}

/* Primary button */
.btn-primary {
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
  transition: all var(--transition);
  letter-spacing: 0.01em;
}
.btn-primary:hover { filter: brightness(1.08); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost {
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-display);
  transition: all var(--transition);
}
.btn-ghost:hover { border-color: var(--border-light); color: var(--text-primary); background: var(--bg-hover); }

.btn-danger {
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--red);
  color: var(--red);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-display);
  transition: all var(--transition);
}
.btn-danger:hover { background: var(--red); color: #fff; }

.btn-icon {
  width: 32px; height: 32px;
  padding: 0;
  display: flex; align-items: center; justify-content: center;
}

/* ── Body ────────────────────────────────────────────────────────────── */
.tt-body { display: flex; flex: 1; overflow: hidden; }

/* ── Timeline ────────────────────────────────────────────────────────── */
.timeline-wrap {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.timeline-wrap::-webkit-scrollbar { width: 5px; }
.timeline-wrap::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.timeline {
  position: relative;
  padding: 8px 0 60px;
}

.timeline-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 40px;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: 13px;
}

/* Now line */
.now-line {
  position: absolute;
  left: 0; right: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 10;
}
.now-dot {
  width: 8px; height: 8px;
  background: var(--now-color);
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: 60px;
  box-shadow: 0 0 0 2px var(--bg), 0 0 8px var(--now-color);
}
.now-line::after {
  content: '';
  flex: 1;
  height: 1.5px;
  background: linear-gradient(90deg, var(--now-color) 0%, transparent 100%);
  margin-right: 16px;
  opacity: 0.7;
}
.now-label {
  font-size: 10px;
  color: var(--now-color);
  font-weight: 600;
  flex-shrink: 0;
  padding-right: 14px;
  font-family: var(--font-mono);
}

/* Hour rows */
.hour-row {
  display: flex;
  min-height: 64px;
  position: relative;
  border-top: 1px solid var(--border);
  transition: background var(--transition);
}
.hour-row:nth-child(even) { background: var(--bg-stripe); }
.hour-row:hover { background: var(--bg-hover); }
.hour-row--past .hour-label { opacity: 0.4; }
.hour-row--past .hour-slot  { opacity: 0.5; }

.hour-label {
  width: 64px;
  flex-shrink: 0;
  font-size: 10px;
  color: var(--text-muted);
  padding: 7px 12px 0 16px;
  text-align: right;
  font-family: var(--font-mono);
  letter-spacing: 0.03em;
}

.hour-slot {
  flex: 1;
  position: relative;
  min-height: 64px;
  padding-right: 16px;
  border-left: 1px solid var(--border);
}

/* ── Time blocks ─────────────────────────────────────────────────────── */
.time-block {
  position: absolute;
  left: 8px;
  right: 8px;
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  border-left: 3px solid transparent;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 3px;
  z-index: 2;
  box-shadow: var(--shadow-sm);
}
.time-block:hover {
  transform: translateX(3px) translateY(-1px);
  box-shadow: var(--shadow-md);
  z-index: 5;
}

/* Category colors */
.time-block--habit {
  background: var(--cat-habit-bg);
  border-left-color: var(--cat-habit-border);
}
.time-block--discipline {
  background: var(--cat-disc-bg);
  border-left-color: var(--cat-disc-border);
}
.time-block--work {
  background: var(--cat-work-bg);
  border-left-color: var(--cat-work-border);
}
.time-block--personal {
  background: var(--cat-personal-bg);
  border-left-color: var(--cat-personal-border);
}

/* Status */
.time-block--done    { opacity: 0.6; }
.time-block--done .block-title { text-decoration: line-through; color: var(--text-muted); }
.time-block--skipped { opacity: 0.3; }

.block-top { display: flex; align-items: center; gap: 5px; }

.block-cat-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.time-block--habit      .block-cat-dot { background: var(--cat-habit-border); }
.time-block--discipline .block-cat-dot { background: var(--cat-disc-border); }
.time-block--work       .block-cat-dot { background: var(--cat-work-border); }
.time-block--personal   .block-cat-dot { background: var(--cat-personal-border); }

.block-time {
  font-size: 10px;
  color: var(--text-muted);
  flex: 1;
  font-family: var(--font-mono);
}
.block-duration {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.block-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-display);
  letter-spacing: -0.01em;
}
.time-block--habit      .block-title { color: var(--cat-habit-text); }
.time-block--discipline .block-title { color: var(--cat-disc-text); }
.time-block--work       .block-title { color: var(--cat-work-text); }
.time-block--personal   .block-title { color: var(--cat-personal-text); }

/* Block action buttons — hidden until hover */
.block-actions {
  display: none;
  position: absolute;
  top: 5px;
  right: 8px;
  gap: 4px;
  align-items: center;
}
.time-block:hover .block-actions { display: flex; }

.block-action-btn {
  width: 22px; height: 22px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
  line-height: 1;
}
.block-action-btn:hover       { border-color: var(--accent); color: var(--accent); }
.block-action-btn.active      { background: var(--green); color: #fff; border-color: var(--green); }
.block-action-btn.danger:hover { background: var(--red); color: #fff; border-color: var(--red); }

/* ── Task Panel ──────────────────────────────────────────────────────── */
.task-panel {
  width: 224px;
  flex-shrink: 0;
  border-left: 1px solid var(--border);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.panel-header-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-family: var(--font-mono);
}

.panel-section {
  padding: 14px 14px 10px;
  border-bottom: 1px solid var(--border);
}

.panel-section-title {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-bottom: 10px;
}

/* Habit task items */
.panel-task {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: grab;
  margin-bottom: 5px;
  background: var(--bg);
  border: 1px solid var(--border);
  transition: all var(--transition);
  font-family: var(--font-display);
}
.panel-task:hover {
  border-color: var(--cat-habit-border);
  background: var(--cat-habit-bg);
  transform: translateX(2px);
}
.panel-task:active { cursor: grabbing; }

.panel-task-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.habit-dot { background: var(--cat-habit-border); }

.panel-task-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-task-badge {
  font-size: 9px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  color: var(--cat-habit-text);
  background: var(--cat-habit-bg);
  border: 1px solid var(--cat-habit-border);
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.panel-empty {
  padding: 28px 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
  font-family: var(--font-display);
}
.panel-empty-icon {
  font-size: 22px;
  color: var(--green);
  opacity: 0.5;
}

/* Quick add buttons */
.panel-quick-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  margin-bottom: 5px;
  transition: all var(--transition);
  font-family: var(--font-display);
}
.panel-quick-btn:hover {
  border-color: var(--border-light);
  color: var(--text-primary);
  background: var(--bg-hover);
}

.qb-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.qb-dot.work       { background: var(--cat-work-border); }
.qb-dot.personal   { background: var(--cat-personal-border); }
.qb-dot.discipline { background: var(--cat-disc-border); }

/* Legend */
.panel-legend {
  padding: 14px;
  margin-top: auto;
  border-top: 1px solid var(--border);
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 7px;
  font-family: var(--font-display);
}

.legend-dot {
  width: 8px; height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}
.legend-dot.habit      { background: var(--cat-habit-border); }
.legend-dot.discipline { background: var(--cat-disc-border); }
.legend-dot.work       { background: var(--cat-work-border); }
.legend-dot.personal   { background: var(--cat-personal-border); }

/* ── Forms ───────────────────────────────────────────────────────────── */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  font-family: var(--font-display);
  letter-spacing: 0.01em;
}
.form-input {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 13px;
  font-family: var(--font-display);
  transition: border-color var(--transition), box-shadow var(--transition);
  outline: none;
}
.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
}
.form-input::placeholder { color: var(--text-muted); }
select.form-input { cursor: pointer; }

/* ── Modal ───────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.modal-box {
  width: 100%;
  max-width: 460px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}
.modal-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  font-family: var(--font-display);
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.modal-textarea {
  resize: vertical;
  min-height: 64px;
  font-family: var(--font-display);
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  gap: 10px;
}
.modal-footer-right {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

/* Alert */
.alert {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-family: var(--font-display);
}
.alert-error {
  background: color-mix(in srgb, var(--red) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
  color: var(--red);
}

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97) translateY(6px); }

/* Spinner */
.spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>