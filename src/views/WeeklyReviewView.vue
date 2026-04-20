<template>
  <div class="dashboard">
    <AppSidebar active="weekly" />

    <main class="main">
      <div class="page-header flex justify-between items-center">
        <div>
          <h2>Weekly Review</h2>
          <p class="text-secondary text-sm mt-1">
            Your performance summary for the last 7 days
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="btn btn-ghost btn-sm"
            @click="store.fetchPreview()"
            :disabled="store.loading"
          >
            ↻ Refresh
          </button>
          <button
            class="btn btn-primary btn-sm"
            @click="handleSendNow"
            :disabled="store.sending"
          >
            <span v-if="store.sending" class="spinner" />
            <span v-else>📧 Send to Email</span>
          </button>
        </div>
      </div>

      <!-- Success message -->
      <div v-if="emailSent" class="alert alert-success" style="margin-bottom:20px">
        ✅ Weekly review sent to your email!
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="loading-state">
        <div class="spinner" />
        <span class="text-secondary text-sm">Building your report…</span>
      </div>

      <template v-else-if="store.report">
        <!-- Grade banner -->
        <div class="grade-banner card" :style="{ borderColor: gradeColor }">
          <div class="grade-left">
            <div class="grade-circle" :style="{ background: gradeColor }">
              {{ store.report.performanceGrade }}
            </div>
            <div>
              <div class="grade-title">Weekly Performance</div>
              <div class="grade-range text-muted text-sm mono">
                {{ formatDate(store.report.weekStart) }}
                — {{ formatDate(store.report.weekEnd) }}
              </div>
            </div>
          </div>
          <div class="grade-message">
            <p class="text-secondary text-sm" style="font-style:italic;line-height:1.6">
              "{{ store.report.motivationalMessage }}"
            </p>
          </div>
        </div>

        <!-- Stats grid -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">◧</div>
            <div class="stat-val mono">{{ store.report.habitsCompletedThisWeek }}</div>
            <div class="stat-lbl">Habits Done</div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">📊</div>
            <div class="stat-val mono">{{ store.report.habitCompletionPercent }}%</div>
            <div class="stat-lbl">Completion Rate</div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">◔</div>
            <div class="stat-val mono">{{ store.report.focusMinutesThisWeek }}</div>
            <div class="stat-lbl">Focus Minutes</div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">◫</div>
            <div class="stat-val mono">{{ store.report.journalEntriesThisWeek }}</div>
            <div class="stat-lbl">Journal Entries</div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">⭐</div>
            <div class="stat-val mono text-accent">+{{ store.report.xpEarnedThisWeek }}</div>
            <div class="stat-lbl">XP Earned</div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">🔥</div>
            <div class="stat-val mono">{{ store.report.bestStreakThisWeek }}</div>
            <div class="stat-lbl">Best Streak</div>
          </div>
        </div>

        <!-- Top habit + mood row -->
        <div class="bottom-row">
          <!-- Top habit -->
          <div class="card bottom-card">
            <div class="bottom-label mono text-muted">🔥 Top Habit</div>
            <div class="bottom-value">{{ store.report.topHabitName }}</div>
            <div class="text-accent text-sm mono">
              {{ store.report.topHabitStreak }} day streak
            </div>
          </div>

          <!-- Mood -->
          <div class="card bottom-card" style="text-align:center">
            <div class="bottom-label mono text-muted">Dominant Mood</div>
            <div style="font-size:40px;margin:8px 0">{{ moodEmoji }}</div>
            <div class="bottom-value">{{ store.report.dominantMood }}</div>
          </div>

          <!-- Level -->
          <div class="card bottom-card" style="text-align:center">
            <div class="bottom-label mono text-muted">Current Level</div>
            <div class="level-circle">{{ store.report.currentLevel }}</div>
            <div class="text-secondary text-sm">{{ levelTitle }}</div>
          </div>
        </div>

        <!-- Next week tip -->
        <div class="card tip-card">
          <div class="tip-icon">💡</div>
          <div>
            <div style="font-weight:700;margin-bottom:4px">
              Next Week's Focus
            </div>
            <p class="text-secondary text-sm" style="line-height:1.6;margin:0">
              {{ nextWeekTip }}
            </p>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeeklyReviewStore } from '@/store/weeklyReview'
import AppSidebar from '@/components/AppSidebar.vue'

const store    = useWeeklyReviewStore()
const emailSent = ref(false)

const gradeColor = computed(() => ({
  S: '#34d399', A: '#60a5fa', B: '#a78bfa', C: '#fb923c'
}[store.report?.performanceGrade] ?? '#7c6af7'))

const moodEmoji = computed(() => ({
  GREAT: '😄', GOOD: '🙂', NEUTRAL: '😐', BAD: '😕', AWFUL: '😞'
}[store.report?.dominantMood] ?? '📔'))

const levelTitle = computed(() => {
  const l = store.report?.currentLevel ?? 1
  if (l < 5)  return 'Beginner'
  if (l < 10) return 'Apprentice'
  if (l < 20) return 'Achiever'
  if (l < 30) return 'Champion'
  return 'Legend'
})

const nextWeekTip = computed(() => {
  const r = store.report
  if (!r) return ''
  if (r.habitCompletionPercent < 50)
    return 'Focus on completing at least 1 habit every single day next week. Consistency beats perfection.'
  if (r.focusMinutesThisWeek < 60)
    return 'Try to log at least one 25-minute focus session per day. Even 5 sessions a week makes a huge difference.'
  if (r.journalEntriesThisWeek < 3)
    return 'Journal at least 3 times next week. Even 2 sentences counts — the habit of reflection compounds over time.'
  return 'You\'re doing great! Challenge yourself to beat this week\'s score across all three areas.'
})

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
}

async function handleSendNow() {
  const ok = await store.sendNow()
  if (ok) {
    emailSent.value = true
    setTimeout(() => emailSent.value = false, 5000)
  }
}

onMounted(() => store.fetchPreview())
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }
.main { flex: 1; padding: 32px 40px; max-width: 900px; }
.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 20px; }

/* Grade banner */
.grade-banner {
  display: flex; align-items: flex-start; gap: 24px;
  padding: 28px; margin-bottom: 24px;
  border-width: 2px;
}
.grade-left { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.grade-circle {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 900; color: #fff;
  box-shadow: 0 0 24px rgba(0,0,0,0.3);
}
.grade-title { font-size: 16px; font-weight: 700; }
.grade-range { margin-top: 4px; }
.grade-message { flex: 1; }

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
.stat-card { padding: 20px; text-align: center; }
.stat-icon { font-size: 20px; margin-bottom: 8px; }
.stat-val { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; }
.stat-lbl {
  font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-muted);
  margin-top: 4px; font-family: var(--font-mono);
}

/* Bottom row */
.bottom-row { display: flex; gap: 14px; margin-bottom: 20px; }
.bottom-card { flex: 1; padding: 20px; }
.bottom-label {
  font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.08em; margin-bottom: 10px;
}
.bottom-value { font-size: 18px; font-weight: 700; margin-bottom: 4px; }

.level-circle {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--accent-dim); color: var(--accent);
  font-size: 22px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  margin: 8px auto;
}

/* Tip card */
.tip-card { display: flex; align-items: flex-start; gap: 16px; padding: 20px 24px; }
.tip-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }

/* Loading */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px;
  border: 1px dashed var(--border); border-radius: var(--radius);
}
</style>