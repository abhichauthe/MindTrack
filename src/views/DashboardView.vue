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
            <div class="flex justify-between items-center" style="margin-bottom:20px">
              <h3 style="font-size:18px">New Habit</h3>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useHabitsStore } from '@/store/habits'
import AppSidebar from '@/components/AppSidebar.vue'
import HabitCard from '@/components/HabitCard.vue'

const authStore   = useAuthStore()
const habitsStore = useHabitsStore()

const showAddModal = ref(false)
const habitNameInput = ref(null)
const addLoading = ref(false)
const addError   = ref('')
const newHabit   = ref({ name: '', description: '' })

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)

const rateClass = computed(() => {
  const r = habitsStore.completionRate
  return r >= 80 ? 'text-green' : r >= 40 ? 'text-accent' : ''
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

watch(showAddModal, async (val) => {
  if (val) { await nextTick(); habitNameInput.value?.focus() }
})

onMounted(() => habitsStore.fetchHabits())
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }
.main { flex: 1; padding: 32px 40px; max-width: 800px; }

.stats-bar {
  display: flex; align-items: center; gap: 24px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 20px 28px;
  margin-bottom: 32px; position: relative; overflow: hidden;
}
.stat-item { text-align: center; }
.stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; }
.stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-top: 2px; font-family: var(--font-mono); }
.stat-divider { width: 1px; height: 36px; background: var(--border); }
.progress-bar-wrap { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--border); }
.progress-bar { height: 100%; background: var(--accent); transition: width 0.6s cubic-bezier(0.4,0,0.2,1); border-radius: 0 2px 2px 0; }

.section-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.section-header h2 { font-size: 20px; }

.empty-state, .loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 24px; gap: 12px;
  text-align: center; border: 1px dashed var(--border); border-radius: var(--radius);
}
.empty-icon { font-size: 36px; color: var(--accent); opacity: 0.4; margin-bottom: 4px; }
.empty-state h3 { font-size: 18px; }

.habit-list { display: flex; flex-direction: column; gap: 10px; }
.habit-list-enter-active { transition: all 0.3s ease; }
.habit-list-enter-from { opacity: 0; transform: translateX(-12px); }
.habit-list-leave-active { transition: all 0.2s ease; }
.habit-list-leave-to { opacity: 0; transform: translateX(12px); }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; padding: 24px; z-index: 100;
}
.modal-box { width: 100%; max-width: 440px; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>