<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <AppSidebar active="focus" />

    <!-- Main -->
    <main class="main">
      <div class="page-header">
        <div>
          <h2>Focus Timer</h2>
          <p class="text-secondary text-sm mt-1">Deep work sessions with Pomodoro technique</p>
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card card">
          <div class="stat-val mono">{{ focusStore.stats.totalSessions }}</div>
          <div class="stat-lbl">Total Sessions</div>
        </div>
        <div class="stat-card card">
          <div class="stat-val mono">{{ focusStore.stats.totalMinutesToday ?? 0 }}<span class="stat-unit">min</span></div>
          <div class="stat-lbl">Today</div>
        </div>
        <div class="stat-card card">
          <div class="stat-val mono">{{ focusStore.stats.totalMinutesWeek ?? 0 }}<span class="stat-unit">min</span></div>
          <div class="stat-lbl">This Week</div>
        </div>
      </div>

      <!-- Timer card -->
      <div class="timer-card card">
        <!-- Mode tabs -->
        <div class="mode-tabs">
          <button
            v-for="mode in modes"
            :key="mode.key"
            class="mode-tab"
            :class="{ active: currentMode === mode.key }"
            :disabled="isRunning"
            @click="switchMode(mode.key)"
          >
            {{ mode.label }}
          </button>
        </div>

        <!-- Clock face -->
        <div class="clock-wrap">
          <svg class="clock-ring" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="100" class="ring-track" />
            <circle
              cx="110" cy="110" r="100"
              class="ring-progress"
              :stroke="modeColor"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
            />
          </svg>
          <div class="clock-inner">
            <div class="clock-time mono">{{ formattedTime }}</div>
            <div class="clock-label text-muted text-sm">{{ currentModeLabel }}</div>
          </div>
        </div>

        <!-- Controls -->
        <div class="timer-controls">
          <button class="btn btn-ghost" @click="resetTimer" :disabled="!isRunning && elapsed === 0">
            Reset
          </button>
          <button
            class="btn start-btn"
            :class="isRunning ? 'btn-danger' : 'btn-primary'"
            @click="toggleTimer"
          >
            {{ isRunning ? '⏸ Pause' : elapsed > 0 ? '▶ Resume' : '▶ Start' }}
          </button>
          <button class="btn btn-ghost" @click="completeSession" :disabled="elapsed < 60">
            Done ✓
          </button>
        </div>

        <p class="timer-hint text-muted text-sm">
          {{ isRunning ? 'Stay focused. You got this.' : 'Press Start to begin your session.' }}
        </p>
      </div>

      <!-- Recent sessions -->
      <div class="section-header" style="margin-top:32px">
        <h3 style="font-size:16px;font-weight:700">Recent Sessions</h3>
      </div>

      <div v-if="focusStore.loading" class="loading-state">
        <div class="spinner" />
      </div>

      <div v-else-if="!focusStore.sessions.length" class="empty-state">
        <div class="empty-icon">◔</div>
        <p class="text-secondary text-sm">No sessions yet. Complete your first focus session above.</p>
      </div>

      <div v-else class="session-list">
        <div v-for="s in focusStore.sessions.slice(0, 10)" :key="s.id" class="session-row card">
          <div class="session-type-dot" :style="{ background: typeColor(s.type) }" />
          <div class="session-info">
            <span class="session-type">{{ typeLabel(s.type) }}</span>
            <span class="text-muted text-sm">{{ formatDate(s.completedAt) }}</span>
          </div>
          <div class="session-duration mono">
            {{ s.durationMinutes }}<span class="text-muted" style="font-size:12px"> min</span>
          </div>
          <span class="badge" :class="s.status === 'COMPLETED' ? 'badge-green' : 'badge-muted'">
            {{ s.status === 'COMPLETED' ? 'Completed' : 'Cancelled' }}
          </span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFocusStore } from '@/store/focus'
import { useNotificationStore } from '@/store/notifications'
import AppSidebar from '@/components/AppSidebar.vue'

const focusStore        = useFocusStore()
const notificationStore = useNotificationStore()

// ── Modes ────────────────────────────────────────────────────
const modes = [
  { key: 'FOCUS',       label: 'Focus',       minutes: 25 },
  { key: 'SHORT_BREAK', label: 'Short Break', minutes: 5  },
  { key: 'LONG_BREAK',  label: 'Long Break',  minutes: 15 }
]

const currentMode = ref('FOCUS')
const mode        = computed(() => modes.find(m => m.key === currentMode.value))
const totalSecs   = computed(() => mode.value.minutes * 60)

// ── Timer state ───────────────────────────────────────────────
const elapsed   = ref(0)
const isRunning = ref(false)
const startedAt = ref(null)
let   interval  = null

const remaining     = computed(() => Math.max(totalSecs.value - elapsed.value, 0))
const formattedTime = computed(() => {
  const m = Math.floor(remaining.value / 60).toString().padStart(2, '0')
  const s = (remaining.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// ── Ring progress ─────────────────────────────────────────────
const circumference = 2 * Math.PI * 100   // r=100
const dashOffset    = computed(() =>
  circumference * (1 - elapsed.value / totalSecs.value)
)

const modeColor = computed(() => ({
  FOCUS:       'var(--accent)',
  SHORT_BREAK: 'var(--green)',
  LONG_BREAK:  '#60a5fa'
}[currentMode.value]))

const currentModeLabel = computed(() => mode.value.label)

// ── Controls ──────────────────────────────────────────────────
function toggleTimer() {
  if (isRunning.value) {
    clearInterval(interval)
    isRunning.value = false
  } else {
    if (!startedAt.value) startedAt.value = new Date().toISOString()
    isRunning.value = true
    interval = setInterval(() => {
      elapsed.value++
      if (elapsed.value >= totalSecs.value) {
        clearInterval(interval)
        isRunning.value = false
        autoComplete()
      }
    }, 1000)
  }
}

function resetTimer() {
  clearInterval(interval)
  isRunning.value = false
  elapsed.value   = 0
  startedAt.value = null
}

function switchMode(key) {
  resetTimer()
  currentMode.value = key
}

async function autoComplete() {
  await persistSession('COMPLETED')
}

async function completeSession() {
  clearInterval(interval)
  isRunning.value = false
  await persistSession('COMPLETED')
  resetTimer()
}

async function persistSession(status) {
  const payload = {
    durationMinutes: Math.max(1, Math.floor(elapsed.value / 60)),
    type:            currentMode.value,
    status,
    startedAt:       startedAt.value,
    completedAt:     new Date().toISOString()
  }
  await focusStore.saveSession(payload)
}

// ── Helpers ───────────────────────────────────────────────────
function typeLabel(type) {
  return { FOCUS: 'Focus', SHORT_BREAK: 'Short Break', LONG_BREAK: 'Long Break' }[type] || type
}

function typeColor(type) {
  return { FOCUS: 'var(--accent)', SHORT_BREAK: 'var(--green)', LONG_BREAK: '#60a5fa' }[type] || '#888'
}

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  focusStore.fetchSessions()
  focusStore.fetchStats()
})

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }
.main { flex: 1; padding: 32px 40px; max-width: 800px; }

.page-header { margin-bottom: 28px; }
.page-header h2 { font-size: 20px; }

/* Stats */
.stats-row { display: flex; gap: 16px; margin-bottom: 28px; }
.stat-card { flex: 1; padding: 20px; text-align: center; }
.stat-val { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; }
.stat-unit { font-size: 14px; font-weight: 400; color: var(--text-muted); margin-left: 2px; }
.stat-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-top: 4px; font-family: var(--font-mono); }

/* Timer card */
.timer-card { padding: 36px; display: flex; flex-direction: column; align-items: center; gap: 28px; }

.mode-tabs { display: flex; gap: 8px; background: var(--bg); border-radius: var(--radius-sm); padding: 4px; border: 1px solid var(--border); }
.mode-tab {
  padding: 8px 20px; border-radius: var(--radius-sm);
  font-family: var(--font-display); font-size: 13px; font-weight: 600;
  border: none; background: transparent; color: var(--text-secondary);
  cursor: pointer; transition: all var(--transition);
}
.mode-tab:hover:not(:disabled) { color: var(--text-primary); }
.mode-tab.active { background: var(--bg-card); color: var(--text-primary); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.mode-tab:disabled { opacity: 0.4; cursor: not-allowed; }

/* Clock */
.clock-wrap { position: relative; width: 220px; height: 220px; }
.clock-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-track { fill: none; stroke: var(--border); stroke-width: 6; }
.ring-progress { fill: none; stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 1s linear, stroke 0.3s ease; }

.clock-inner {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
}
.clock-time { font-size: 48px; font-weight: 800; letter-spacing: -0.04em; }
.clock-label { font-size: 13px; }

/* Controls */
.timer-controls { display: flex; gap: 12px; align-items: center; }
.start-btn { min-width: 130px; padding: 12px 24px; font-size: 15px; }
.timer-hint { text-align: center; }

/* Sessions */
.section-header { margin-bottom: 12px; }
.session-list { display: flex; flex-direction: column; gap: 8px; }
.session-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
}
.session-type-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.session-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.session-type { font-size: 14px; font-weight: 600; }
.session-duration { font-size: 20px; font-weight: 700; }

/* Empty / loading */
.empty-state, .loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 40px; text-align: center;
  border: 1px dashed var(--border); border-radius: var(--radius);
}
.empty-icon { font-size: 28px; color: var(--accent); opacity: 0.4; }
</style>