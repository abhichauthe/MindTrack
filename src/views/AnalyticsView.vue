<template>
  <div class="dashboard">
    <AppSidebar active="analytics" />

    <main class="main">
      <div class="page-header">
        <div>
          <h2>Productivity Analytics</h2>
          <p class="text-secondary text-sm mt-1">
            Weekly performance insights and behavioral patterns
          </p>
        </div>
        <button class="btn btn-ghost btn-sm" @click="store.fetchAnalytics()">
          ↻ Refresh
        </button>
      </div>

      <div v-if="store.loading" class="loading-state">
        <div class="spinner" />
      </div>

      <template v-else-if="store.analytics">
        <!-- Insight card -->
        <div class="insight-card card">
          <div class="insight-icon">🧠</div>
          <div class="insight-body">
            <div class="insight-label mono">Weekly Insight</div>
            <div class="insight-text">{{ store.analytics.insight }}</div>
          </div>
        </div>

        <!-- KPI row -->
        <div class="kpi-row">
          <div class="kpi-card card">
            <div class="kpi-val mono">{{ store.analytics.completionRate }}%</div>
            <div class="kpi-lbl">Completion Rate</div>
            <div class="kpi-bar-wrap">
              <div class="kpi-bar"
                   :style="{ width: store.analytics.completionRate + '%',
                             background: rateColor }"/>
            </div>
          </div>
          <div class="kpi-card card">
            <div class="kpi-val mono">{{ store.analytics.completedTasks }}</div>
            <div class="kpi-lbl">Tasks Done</div>
            <div class="kpi-sub text-muted mono">
              of {{ store.analytics.totalTasks }} total
            </div>
          </div>
          <div class="kpi-card card">
            <div class="kpi-val mono text-red">{{ store.analytics.missedTasks }}</div>
            <div class="kpi-lbl">Missed Tasks</div>
            <div class="kpi-sub text-muted mono">this week</div>
          </div>
          <div class="kpi-card card">
            <div class="kpi-val mono">{{ peakHourStr }}</div>
            <div class="kpi-lbl">Peak Hour</div>
            <div class="kpi-sub text-muted mono">most productive</div>
          </div>
        </div>

        <!-- Time tracking -->
        <div class="card time-card">
          <div class="section-label mono">Planned vs Actual Time</div>
          <div class="time-bars">
            <div class="time-bar-row">
              <span class="time-bar-label">Planned</span>
              <div class="time-bar-track">
                <div class="time-bar planned"
                     :style="{ width: plannedPct + '%' }" />
              </div>
              <span class="time-bar-val mono">{{ store.analytics.plannedMinutes }}m</span>
            </div>
            <div class="time-bar-row">
              <span class="time-bar-label">Actual</span>
              <div class="time-bar-track">
                <div class="time-bar actual"
                     :style="{ width: actualPct + '%' }" />
              </div>
              <span class="time-bar-val mono">{{ store.analytics.actualMinutes }}m</span>
            </div>
          </div>
        </div>

        <!-- Daily breakdown chart -->
        <div class="card">
          <div class="section-label mono">Daily Completion This Week</div>
          <div class="day-chart">
            <div
              v-for="day in store.analytics.dailyStats"
              :key="day.date"
              class="day-col"
            >
              <div class="day-bar-wrap">
                <div
                  class="day-bar"
                  :style="{
                    height: (day.completionPercent || 0) + '%',
                    background: day.completionPercent >= 80
                      ? 'var(--green)'
                      : day.completionPercent >= 50
                        ? 'var(--accent)'
                        : 'var(--red)'
                  }"
                />
              </div>
              <div class="day-label mono">{{ formatDay(day.date) }}</div>
              <div class="day-pct mono">{{ day.completionPercent }}%</div>
            </div>
          </div>
        </div>

        <!-- Category breakdown -->
        <div class="card" v-if="categoryEntries.length">
          <div class="section-label mono">Completed Tasks by Category</div>
          <div class="category-list">
            <div
              v-for="[cat, count] in categoryEntries"
              :key="cat"
              class="category-row"
            >
              <span class="cat-tag" :class="cat.toLowerCase()">{{ cat }}</span>
              <div class="cat-bar-track">
                <div
                  class="cat-bar"
                  :style="{
                    width: (count / maxCategoryCount * 100) + '%'
                  }"
                />
              </div>
              <span class="cat-count mono">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- Snooze behavior -->
        <div class="card snooze-card" v-if="store.analytics.totalSnoozes > 0">
          <div class="snooze-icon">⏰</div>
          <div>
            <div class="section-label mono">Snooze Behavior</div>
            <div class="text-secondary text-sm">
              You snoozed tasks <strong>{{ store.analytics.totalSnoozes }}</strong> times this week.
              <span v-if="store.analytics.totalSnoozes > 5" class="text-muted">
                Consider scheduling tasks during your peak hour ({{ peakHourStr }}).
              </span>
            </div>
          </div>
        </div>

        <!-- Auto-block action -->
        <div class="action-card card">
          <div class="action-card-left">
            <div class="action-title">Auto Time-Block Today</div>
            <div class="text-secondary text-sm">
              Automatically schedule all pending tasks into optimal time slots.
            </div>
          </div>
          <button class="btn btn-primary btn-sm" @click="runAutoBlock" :disabled="blocking">
            <span v-if="blocking" class="spinner" />
            <span v-else>⚡ Auto-Block</span>
          </button>
        </div>

        <div class="action-card card">
          <div class="action-card-left">
            <div class="action-title">Reschedule Missed Tasks</div>
            <div class="text-secondary text-sm">
              Move all incomplete tasks from yesterday to today.
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" @click="runReschedule" :disabled="rescheduling">
            <span v-if="rescheduling" class="spinner" />
            <span v-else>🔄 Reschedule</span>
          </button>
        </div>
      </template>

      <div v-else class="empty-state card">
        <div style="font-size:40px">📊</div>
        <h3>No analytics yet</h3>
        <p class="text-secondary text-sm">
          Complete some tasks to see your productivity insights.
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { useProductivityStore } from '@/store/productivity'

const store       = useProductivityStore()
const blocking    = ref(false)
const rescheduling = ref(false)

const rateColor = computed(() => {
  const r = store.analytics?.completionRate ?? 0
  if (r >= 80) return 'var(--green)'
  if (r >= 50) return 'var(--accent)'
  return 'var(--red)'
})

const peakHourStr = computed(() => {
  const h = store.analytics?.mostProductiveHour ?? 9
  const period = h < 12 ? 'AM' : 'PM'
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr} ${period}`
})

const maxTime = computed(() =>
  Math.max(store.analytics?.plannedMinutes ?? 1,
           store.analytics?.actualMinutes ?? 1)
)
const plannedPct = computed(() =>
  Math.min(100, ((store.analytics?.plannedMinutes ?? 0) / maxTime.value) * 100)
)
const actualPct = computed(() =>
  Math.min(100, ((store.analytics?.actualMinutes ?? 0) / maxTime.value) * 100)
)

const categoryEntries = computed(() =>
  Object.entries(store.analytics?.completionsByCategory ?? {})
    .sort((a, b) => b[1] - a[1])
)
const maxCategoryCount = computed(() =>
  Math.max(...categoryEntries.value.map(([, c]) => c), 1)
)

function formatDay(dt) {
  return new Date(dt + 'T00:00:00')
    .toLocaleDateString('en-US', { weekday: 'short' })
}

async function runAutoBlock() {
  blocking.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    await store.autoBlock(today)
  } finally { blocking.value = false }
}

async function runReschedule() {
  rescheduling.value = true
  try { await store.rescheduleMissed() }
  finally { rescheduling.value = false }
}

onMounted(() => store.fetchAnalytics())
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }
.main { flex: 1; padding: 32px 40px; max-width: 900px; }
.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 24px;
}
.page-header h2 { font-size: 20px; font-weight: 800; }

/* Insight card */
.insight-card {
  display: flex; gap: 16px; align-items: flex-start;
  padding: 20px 24px; margin-bottom: 20px;
}
.insight-icon { font-size: 28px; flex-shrink: 0; }
.insight-label {
  font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 6px;
}
.insight-text {
  font-size: 14px; color: var(--text-primary); line-height: 1.6;
}

/* KPI row */
.kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 20px;
}
.kpi-card { padding: 18px; text-align: center; }
.kpi-val {
  font-size: 28px; font-weight: 800; letter-spacing: -0.04em;
  color: var(--text-primary);
}
.kpi-lbl {
  font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-muted);
  margin: 4px 0; font-family: var(--font-mono);
}
.kpi-sub { font-size: 10px; }
.kpi-bar-wrap {
  height: 4px; background: var(--border);
  border-radius: 2px; overflow: hidden; margin-top: 8px;
}
.kpi-bar { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.text-red { color: var(--red); }

/* Time card */
.time-card { padding: 20px 24px; margin-bottom: 20px; }
.section-label {
  font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 16px;
}
.time-bars { display: flex; flex-direction: column; gap: 12px; }
.time-bar-row { display: flex; align-items: center; gap: 12px; }
.time-bar-label {
  font-size: 12px; color: var(--text-secondary);
  width: 60px; flex-shrink: 0;
}
.time-bar-track {
  flex: 1; height: 8px; background: var(--border);
  border-radius: 4px; overflow: hidden;
}
.time-bar { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.time-bar.planned { background: var(--accent); }
.time-bar.actual  { background: var(--green); }
.time-bar-val { font-size: 12px; width: 48px; text-align: right; }

/* Day chart */
.day-chart {
  display: flex; gap: 8px;
  align-items: flex-end; height: 120px; margin-top: 12px;
}
.day-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; height: 100%;
}
.day-bar-wrap {
  flex: 1; width: 100%; display: flex;
  align-items: flex-end; margin-bottom: 6px;
}
.day-bar {
  width: 100%; border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.5s ease, background 0.3s ease;
}
.day-label { font-size: 10px; color: var(--text-muted); }
.day-pct   { font-size: 10px; color: var(--text-secondary); margin-top: 2px; }

/* Category list */
.category-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.category-row  { display: flex; align-items: center; gap: 10px; }
.cat-tag {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
  font-family: var(--font-mono); padding: 2px 8px; border-radius: 999px;
  min-width: 80px; text-align: center;
}
.cat-tag.discipline { background: var(--accent-dim); color: var(--accent); }
.cat-tag.work       { background: var(--green-dim);  color: var(--green); }
.cat-tag.personal   { background: rgba(251,146,60,0.15); color: #fb923c; }
.cat-tag.health     { background: rgba(96,165,250,0.15);  color: #60a5fa; }
.cat-tag.learning   { background: rgba(167,139,250,0.15); color: #a78bfa; }
.cat-tag.general    { background: var(--bg-hover); color: var(--text-muted); }

.cat-bar-track {
  flex: 1; height: 6px; background: var(--border);
  border-radius: 3px; overflow: hidden;
}
.cat-bar {
  height: 100%; background: var(--accent);
  border-radius: 3px; transition: width 0.5s ease;
}
.cat-count { font-size: 12px; width: 24px; text-align: right; }

/* Snooze card */
.snooze-card {
  display: flex; align-items: flex-start;
  gap: 14px; padding: 16px 20px; margin-bottom: 20px;
}
.snooze-icon { font-size: 22px; flex-shrink: 0; }

/* Action cards */
.action-card {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 16px 20px; margin-bottom: 12px; gap: 16px;
}
.action-card-left { flex: 1; }
.action-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }

/* Empty / loading */
.loading-state, .empty-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  padding: 60px; text-align: center;
}
.empty-state h3 { font-size: 17px; font-weight: 700; }
</style>