<template>
  <div class="dashboard">
    <AppSidebar active="dashboard" />

    <main class="main">
      <!-- Stats bar -->
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
        <div class="stats-bar-right">
          <!-- Theme toggle lives here -->
          <button
            class="theme-toggle"
            @click="toggleTheme"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <span class="theme-toggle-icon">{{ isDark ? '☀' : '◑' }}</span>
            <span class="theme-toggle-label">{{ isDark ? 'Light' : 'Dark' }}</span>
          </button>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar" :style="{ width: habitsStore.completionRate + '%' }" />
        </div>
      </div>

      <!-- Section header -->
      <div class="section-header">
        <div>
          <h2>Today's Habits</h2>
          <p class="text-secondary text-sm mt-1">{{ todayLabel }}</p>
        </div>
        <button class="btn btn-primary btn-sm" @click="showAddModal = true">+ Add Habit</button>
      </div>

      <div v-if="habitsStore.error" class="alert alert-error">{{ habitsStore.error }}</div>

      <div v-if="habitsStore.loading && !habitsStore.habits.length" class="loading-state">
        <div class="spinner" />
        <span class="text-secondary text-sm">Loading habits…</span>
      </div>

      <div v-else-if="!habitsStore.habits.length && !habitsStore.loading" class="empty-state">
        <div class="empty-icon">◈</div>
        <h3>No habits yet</h3>
        <p class="text-secondary text-sm">Add your first habit to start building discipline.</p>
        <button class="btn btn-primary" style="margin-top:16px" @click="showAddModal = true">+ Add your first habit</button>
      </div>

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
            <div class="modal-header">
              <h3>New Habit</h3>
              <button class="btn btn-ghost btn-icon" @click="closeModal">✕</button>
            </div>
            <div v-if="addError" class="alert alert-error" style="margin-bottom:16px">{{ addError }}</div>
            <form @submit.prevent="handleAddHabit" class="modal-form">
              <div class="form-group">
                <label class="form-label">Habit Name *</label>
                <input v-model="newHabit.name" ref="habitNameInput" type="text" class="form-input" placeholder="e.g. Meditate 10 min" required maxlength="100" />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <input v-model="newHabit.description" type="text" class="form-input" placeholder="Optional note…" maxlength="200" />
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useHabitsStore } from '@/store/habits'
import AppSidebar from '@/components/AppSidebar.vue'
import HabitCard from '@/components/HabitCard.vue'
import { useTheme } from '@/composables/useTheme'

const authStore   = useAuthStore()
const habitsStore = useHabitsStore()

const { isDark, toggleTheme } = useTheme()


// ── Modal ─────────────────────────────────────────────────────────────
const showAddModal   = ref(false)
const habitNameInput = ref(null)
const addLoading     = ref(false)
const addError       = ref('')
const newHabit       = ref({ name: '', description: '' })

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)

const rateClass = computed(() => {
  const r = habitsStore.completionRate
  return r >= 80 ? 'rate-high' : r >= 40 ? 'rate-mid' : ''
})

async function handleAddHabit() {
  addError.value   = ''
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
  newHabit.value     = { name: '', description: '' }
  addError.value     = ''
}

watch(showAddModal, async (val) => {
  if (val) { await nextTick(); habitNameInput.value?.focus() }
})

onMounted(() => {
  habitsStore.fetchHabits()
})
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────────── */
.dashboard { display: flex; min-height: 100vh; background: var(--bg); }
.main      { flex: 1; padding: 32px 40px; min-width: 0; }

/* ── Stats bar ───────────────────────────────────────────────────────── */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.stat-item { text-align: center; }

.stat-value {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  font-family: var(--font-mono);
  line-height: 1;
}

.rate-high { color: var(--green); }
.rate-mid  { color: var(--accent); }

.stat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-top: 4px;
  font-family: var(--font-mono);
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--border);
  flex-shrink: 0;
}

/* Right side of stats bar — pushes toggle to the far right */
.stats-bar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
}

/* Progress bar at bottom of stats */
.progress-bar-wrap {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--border);
}
.progress-bar {
  height: 100%;
  background: var(--green);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 2px 2px 0;
}

/* ── Theme toggle ────────────────────────────────────────────────────── */
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-display);
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}
.theme-toggle:hover {
  border-color: var(--border-light);
  color: var(--text-primary);
  background: var(--bg);
}
.theme-toggle-icon { font-size: 14px; line-height: 1; }
.theme-toggle-label { font-size: 11px; letter-spacing: 0.02em; }

/* ── Section header ──────────────────────────────────────────────────── */
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  font-family: var(--font-display);
}
.mt-1 { margin-top: 4px; }
.text-secondary { color: var(--text-secondary); }
.text-sm { font-size: 13px; font-family: var(--font-display); }

/* ── Empty / loading states ──────────────────────────────────────────── */
.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  gap: 12px;
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-family: var(--font-display);
}
.empty-icon {
  font-size: 36px;
  color: var(--accent);
  opacity: 0.4;
  margin-bottom: 4px;
}
.empty-state h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

/* ── Habit list ──────────────────────────────────────────────────────── */
.habit-list { display: flex; flex-direction: column; gap: 10px; }
.habit-list-enter-active { transition: all 0.3s ease; }
.habit-list-enter-from   { opacity: 0; transform: translateX(-12px); }
.habit-list-leave-active { transition: all 0.2s ease; }
.habit-list-leave-to     { opacity: 0; transform: translateX(12px); }

/* ── Alert ───────────────────────────────────────────────────────────── */
.alert {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: var(--font-display);
  margin-bottom: 16px;
}
.alert-error {
  background: color-mix(in srgb, var(--red) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
  color: var(--red);
}

/* ── Buttons ─────────────────────────────────────────────────────────── */
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
}
.btn-primary:hover   { filter: brightness(1.08); }
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
.btn-ghost:hover {
  border-color: var(--border-light);
  color: var(--text-primary);
  background: var(--bg-hover);
}

.btn-sm { padding: 6px 14px; font-size: 12px; }

.btn-icon {
  width: 32px; height: 32px;
  padding: 0;
  display: flex; align-items: center; justify-content: center;
}

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
  z-index: 100;
}

.modal-box {
  width: 100%;
  max-width: 440px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  padding: 24px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.modal-header h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  font-family: var(--font-display);
}

.modal-form   { display: flex; flex-direction: column; gap: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

/* Form */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  font-family: var(--font-display);
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

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97) translateY(6px); }
</style>