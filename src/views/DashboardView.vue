<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">◈</span>
        <span class="brand-name">MindTrack</span>
      </div>

      <nav class="sidebar-nav">
        <a class="nav-item active" href="#">
          <span class="nav-icon">◧</span> Habits
        </a>
        <a class="nav-item soon" href="#" title="Coming soon">
          <span class="nav-icon">◔</span> Focus Timer
          <span class="badge badge-muted" style="margin-left:auto;font-size:10px">soon</span>
        </a>
        <a class="nav-item soon" href="#" title="Coming soon">
          <span class="nav-icon">◫</span> Journal
          <span class="badge badge-muted" style="margin-left:auto;font-size:10px">soon</span>
        </a>
        <a class="nav-item soon" href="#" title="Coming soon">
          <span class="nav-icon">◉</span> Insights
          <span class="badge badge-muted" style="margin-left:auto;font-size:10px">soon</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-pill">
          <div class="user-avatar">{{ initials }}</div>
          <div>
            <div class="user-name">{{ authStore.username }}</div>
            <div class="text-muted text-sm">{{ authStore.user?.email }}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px" @click="handleLogout">
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main">
      <!-- Top stats bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value mono">{{ habitsStore.completedToday }}</div>
          <div class="stat-label">Done today</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-value mono">{{ habitsStore.totalHabits }}</div>
          <div class="stat-label">Total habits</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-value mono" :class="rateClass">{{ habitsStore.completionRate }}%</div>
          <div class="stat-label">Completion</div>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" :style="{ width: habitsStore.completionRate + '%' }" />
        </div>
      </div>

      <!-- Habit list header -->
      <div class="section-header">
        <div>
          <h2>Today's Habits</h2>
          <p class="text-secondary text-sm mt-1">{{ todayLabel }}</p>
        </div>
        <button class="btn btn-primary btn-sm" @click="showAddModal = true">
          + Add Habit
        </button>
      </div>

      <!-- Error state -->
      <div v-if="habitsStore.error" class="alert alert-error">
        {{ habitsStore.error }}
      </div>

      <!-- Loading -->
      <div v-if="habitsStore.loading && !habitsStore.habits.length" class="loading-state">
        <div class="spinner" />
        <span class="text-secondary text-sm">Loading habits…</span>
      </div>

      <!-- Empty state -->
      <div v-else-if="!habitsStore.habits.length && !habitsStore.loading" class="empty-state">
        <div class="empty-icon">◈</div>
        <h3>No habits yet</h3>
        <p class="text-secondary text-sm">Add your first habit to start building discipline.</p>
        <button class="btn btn-primary" style="margin-top:16px" @click="showAddModal = true">
          + Add your first habit
        </button>
      </div>

      <!-- Habit list -->
      <TransitionGroup v-else name="habit-list" tag="div" class="habit-list">
        <HabitCard
          v-for="habit in habitsStore.habits"
          :key="habit.id"
          :habit="habit"
          @toggle="habitsStore.toggleHabit(habit.id)"
        />
      </TransitionGroup>
    </main>

    <!-- Add Habit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box card">
            <div class="flex justify-between items-center" style="margin-bottom:20px">
              <h3 style="font-size:18px">New Habit</h3>
              <button class="btn btn-ghost btn-icon" @click="closeModal">✕</button>
            </div>

            <div v-if="addError" class="alert alert-error" style="margin-bottom:16px">
              {{ addError }}
            </div>

            <form @submit.prevent="handleAddHabit" class="modal-form">
              <div class="form-group">
                <label class="form-label">Habit Name *</label>
                <input
                  v-model="newHabit.name"
                  ref="habitNameInput"
                  type="text"
                  class="form-input"
                  placeholder="e.g. Meditate 10 min"
                  required
                  maxlength="100"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <input
                  v-model="newHabit.description"
                  type="text"
                  class="form-input"
                  placeholder="Optional note…"
                  maxlength="200"
                />
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="closeModal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="addLoading">
                  <span v-if="addLoading" class="spinner" />
                  <span v-else>Create Habit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useHabitsStore } from '@/store/habits'
import HabitCard from '@/components/HabitCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const habitsStore = useHabitsStore()

const showAddModal = ref(false)
const habitNameInput = ref(null)
const addLoading = ref(false)
const addError = ref('')
const newHabit = ref({ name: '', description: '' })

const initials = computed(() => {
  const u = authStore.username || ''
  return u.slice(0, 2).toUpperCase()
})

const todayLabel = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})

const rateClass = computed(() => {
  const r = habitsStore.completionRate
  if (r >= 80) return 'text-green'
  if (r >= 40) return 'text-accent'
  return ''
})

async function handleAddHabit() {
  addError.value = ''
  addLoading.value = true
  try {
    await habitsStore.addHabit(newHabit.value)
    closeModal()
  } catch (e) {
    addError.value = e.message
  } finally {
    addLoading.value = false
  }
}

function closeModal() {
  showAddModal.value = false
  newHabit.value = { name: '', description: '' }
  addError.value = ''
}

async function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}

// Focus input when modal opens
const unwatchModal = computed(() => showAddModal.value)
import { watch } from 'vue'
watch(showAddModal, async (val) => {
  if (val) {
    await nextTick()
    habitNameInput.value?.focus()
  }
})

onMounted(() => {
  habitsStore.fetchHabits()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ───────────────────────────── */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
  padding: 0 8px;
  margin-bottom: 32px;
}

.brand-icon { color: var(--accent); font-size: 22px; }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition);
  cursor: pointer;
}

.nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-item.active { background: var(--accent-dim); color: var(--accent); }
.nav-item.soon { opacity: 0.5; cursor: default; }
.nav-item.soon:hover { background: transparent; color: var(--text-secondary); }

.nav-icon { font-size: 16px; }

.sidebar-footer { border-top: 1px solid var(--border); padding-top: 16px; }

.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name { font-size: 14px; font-weight: 600; }

/* ── Main ──────────────────────────────── */
.main {
  flex: 1;
  padding: 32px 40px;
  max-width: 800px;
}

/* Stats bar */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 28px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.stat-item { text-align: center; }
.stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; }
.stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-top: 2px; font-family: var(--font-mono); }
.stat-divider { width: 1px; height: 36px; background: var(--border); }

.progress-bar-wrap {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--border);
}
.progress-bar {
  height: 100%;
  background: var(--accent);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 2px 2px 0;
}

/* Section header */
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-header h2 { font-size: 20px; }

/* Empty / Loading */
.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  gap: 12px;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
}

.empty-icon {
  font-size: 36px;
  color: var(--accent);
  opacity: 0.4;
  margin-bottom: 4px;
}

.empty-state h3 { font-size: 18px; }

/* Habit list transitions */
.habit-list { display: flex; flex-direction: column; gap: 10px; }
.habit-list-enter-active { transition: all 0.3s ease; }
.habit-list-enter-from { opacity: 0; transform: translateX(-12px); }
.habit-list-leave-active { transition: all 0.2s ease; }
.habit-list-leave-to { opacity: 0; transform: translateX(12px); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}

.modal-box {
  width: 100%;
  max-width: 440px;
}

.modal-form { display: flex; flex-direction: column; gap: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>