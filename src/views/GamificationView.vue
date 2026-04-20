<template>
  <div class="dashboard">
    <AppSidebar active="gamification" />

    <main class="main">
      <div class="page-header">
        <h2>Progress & Achievements</h2>
        <p class="text-secondary text-sm mt-1">Your XP, level, streaks and badges</p>
      </div>

      <div v-if="store.loading" class="loading-state">
        <div class="spinner" />
      </div>

      <template v-else-if="store.stats">

        <!-- XP & Level card -->
        <div class="level-card card">
          <div class="level-left">
            <div class="level-badge">{{ store.level }}</div>
            <div>
              <div class="level-label mono text-muted">LEVEL</div>
              <div class="level-title">{{ levelTitle }}</div>
            </div>
          </div>
          <div class="level-right">
            <div class="xp-info">
              <span class="mono text-accent">{{ store.totalXp }} XP</span>
              <span class="text-muted text-sm">{{ store.xpToNextLevel }} to next level</span>
            </div>
            <div class="xp-bar-wrap">
              <div class="xp-bar" :style="{ width: store.xpProgressPercent + '%' }" />
            </div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="stats-row">
          <div class="stat-card card">
            <div class="stat-icon">◧</div>
            <div class="stat-val mono">{{ store.stats.totalHabitsCompleted }}</div>
            <div class="stat-lbl">Habits Done</div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">◔</div>
            <div class="stat-val mono">{{ store.stats.totalFocusMinutes }}</div>
            <div class="stat-lbl">Focus Minutes</div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">◫</div>
            <div class="stat-val mono">{{ store.stats.totalJournalEntries }}</div>
            <div class="stat-lbl">Journal Entries</div>
          </div>
        </div>

        <!-- Streaks -->
        <div class="section-header">
          <h3>🔥 Current Streaks</h3>
        </div>

        <div v-if="!store.streaks.length" class="empty-state">
          <p class="text-secondary text-sm">Complete habits daily to build streaks.</p>
        </div>

        <div v-else class="streak-list">
          <div v-for="s in store.streaks" :key="s.habitId" class="streak-card card">
            <div class="streak-info">
              <div class="streak-name">{{ s.habitName }}</div>
              <div class="text-muted text-sm mono">
                Last: {{ formatDate(s.lastCompletedDate) }}
              </div>
            </div>
            <div class="streak-nums">
              <div class="streak-current">
                <span class="streak-fire">🔥</span>
                <span class="mono" style="font-size:22px;font-weight:800">
                  {{ s.currentStreak }}
                </span>
                <span class="text-muted text-sm">current</span>
              </div>
              <div class="streak-best">
                <span class="text-muted text-sm mono">best: {{ s.longestStreak }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Badges -->
        <div class="section-header" style="margin-top:32px">
          <h3>🏆 Badges Earned</h3>
          <span class="badge badge-accent">{{ store.badges.length }} earned</span>
        </div>

        <div v-if="!store.badges.length" class="empty-state">
          <p class="text-secondary text-sm">
            Complete habits, focus sessions and journal entries to earn badges.
          </p>
        </div>

        <div v-else class="badges-grid">
          <div v-for="b in store.badges" :key="b.type" class="badge-card card">
            <div class="badge-icon">{{ b.icon }}</div>
            <div class="badge-name">{{ b.label }}</div>
            <div class="badge-desc text-muted text-sm">{{ b.description }}</div>
            <div class="badge-date mono text-muted" style="font-size:10px;margin-top:8px">
              {{ formatDate(b.earnedAt) }}
            </div>
          </div>
        </div>

      </template>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useGamificationStore } from '@/store/gamification'
import AppSidebar from '@/components/AppSidebar.vue'

const store = useGamificationStore()

const levelTitle = computed(() => {
  const l = store.level
  if (l < 5)  return 'Beginner'
  if (l < 10) return 'Apprentice'
  if (l < 20) return 'Achiever'
  if (l < 30) return 'Champion'
  return 'Legend'
})

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

onMounted(() => store.fetchStats())
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }
.main { flex: 1; padding: 32px 40px; max-width: 860px; }
.page-header { margin-bottom: 28px; }
.page-header h2 { font-size: 20px; }

/* Level card */
.level-card {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 24px 28px; margin-bottom: 24px; gap: 24px;
}
.level-left { display: flex; align-items: center; gap: 16px; }
.level-badge {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--accent); color: #fff;
  font-size: 22px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 20px var(--accent-glow);
}
.level-label { font-size: 10px; letter-spacing: 0.1em; margin-bottom: 2px; }
.level-title { font-size: 18px; font-weight: 700; }
.level-right { flex: 1; }
.xp-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
.xp-bar-wrap { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
.xp-bar { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }

/* Stats row */
.stats-row { display: flex; gap: 16px; margin-bottom: 32px; }
.stat-card { flex: 1; padding: 20px; text-align: center; }
.stat-icon { font-size: 20px; margin-bottom: 8px; }
.stat-val { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; }
.stat-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-top: 4px; font-family: var(--font-mono); }

/* Section header */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.section-header h3 { font-size: 16px; font-weight: 700; }

/* Streaks */
.streak-list { display: flex; flex-direction: column; gap: 10px; }
.streak-card { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; }
.streak-name { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
.streak-nums { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.streak-current { display: flex; align-items: center; gap: 6px; }
.streak-fire { font-size: 20px; }

/* Badges */
.badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.badge-card { padding: 20px; text-align: center; transition: transform var(--transition); }
.badge-card:hover { transform: translateY(-2px); }
.badge-icon { font-size: 32px; margin-bottom: 10px; }
.badge-name { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
.badge-desc { font-size: 12px; line-height: 1.5; }

/* Empty / loading */
.empty-state, .loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 40px; text-align: center;
  border: 1px dashed var(--border); border-radius: var(--radius);
}
</style>