<template>
  <div class="dashboard">
    <AppSidebar active="discipline" />

    <!-- Wizard overlay -->
    <Transition name="wizard-fade">
      <div v-if="store.showWizard" class="wizard-overlay">
        <DisciplineWizard @complete="onWizardComplete" />
      </div>
    </Transition>

    <!-- Main content -->
    <main class="main" v-if="!store.showWizard">

      <div class="page-header">
        <div>
          <h2>Discipline</h2>
          <p class="text-secondary text-sm mt-1">
            Your active discipline journeys
          </p>
        </div>
        <button class="btn btn-primary btn-sm" @click="store.showWizard = true">
          + New journey
        </button>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="loading-state">
        <div class="spinner" />
      </div>

      <!-- Empty -->
      <div v-else-if="!store.hasAny" class="empty-state card">
        <div class="empty-emoji">🎯</div>
        <h3>No discipline journeys yet</h3>
        <p class="text-secondary text-sm">
          Start your first journey — we'll build a personalized plan based on your real situation.
        </p>
        <button class="btn btn-primary" style="margin-top:8px" @click="store.showWizard = true">
          Start a journey
        </button>
      </div>

      <!-- Cards -->
      <div v-else class="discipline-grid">
        <div
          v-for="d in store.disciplines"
          :key="d.id"
          class="discipline-card card"
          :class="{ paused: d.status === 'PAUSED' }"
        >
          <!-- Header -->
          <div class="dc-header">
            <span class="dc-emoji">{{ d.areaEmoji }}</span>
            <div class="dc-meta">
              <div class="dc-area mono">{{ d.areaName }}</div>
              <div class="dc-status-badge" :class="d.status.toLowerCase()">
                {{ d.status }}
              </div>
            </div>
            <div class="dc-actions">
              <button
                class="dc-btn"
                @click="store.toggleStatus(d.id)"
                :title="d.status === 'ACTIVE' ? 'Pause' : 'Resume'"
              >
                {{ d.status === 'ACTIVE' ? '⏸' : '▶' }}
              </button>
              <button class="dc-btn danger" @click="confirmDelete(d)" title="Delete">
                ×
              </button>
            </div>
          </div>

          <!-- Framework badge -->
          <div class="dc-framework-badge" v-if="d.framework">
            <span class="framework-icon">⚙️</span>
            {{ d.framework }}
          </div>

          <!-- Week plan — shows current week's focus -->
          <div class="dc-section" v-if="d.weeklyPlan?.length">
            <div class="dc-label mono">This week's focus</div>
            <div class="dc-week-card">
              <div class="dc-week-theme">{{ d.weeklyPlan[currentWeek(d)]?.theme ?? d.weeklyPlan[0]?.theme }}</div>
              <div class="dc-week-action">{{ d.weeklyPlan[currentWeek(d)]?.action ?? d.weeklyPlan[0]?.action }}</div>
            </div>
          </div>

          <!-- Daily action fallback -->
          <div class="dc-section" v-else>
            <div class="dc-label mono">Daily action</div>
            <div class="dc-text">{{ d.dailyAction }}</div>
          </div>

          <!-- Daily check-in -->
          <div class="dc-checkin" v-if="d.status === 'ACTIVE'" @click="openCheckin(d)">
            <span class="checkin-icon">✓</span>
            <span>Daily check-in</span>
            <span class="checkin-arrow">→</span>
          </div>

          <!-- Footer -->
          <div class="dc-footer">
            <span class="dc-schedule mono">{{ scheduleLabel(d) }}</span>
            <span class="dc-since mono">Since {{ formatDate(d.createdAt) }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Daily Check-in Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="checkinModal.show" class="modal-overlay" @click.self="checkinModal.show = false">
          <div class="modal-box card">
            <div class="modal-header">
              <div class="flex items-center gap-2">
                <span style="font-size:22px">{{ checkinModal.discipline?.areaEmoji }}</span>
                <h3>Daily Check-in</h3>
              </div>
              <button class="btn btn-ghost btn-icon" @click="checkinModal.show = false">✕</button>
            </div>

            <div class="modal-body">
              <p class="text-secondary text-sm" style="margin-bottom:16px">
                {{ checkinModal.discipline?.areaName }} · {{ formatDate(new Date().toISOString()) }}
              </p>

              <div
                v-for="(q, i) in checkinQuestions"
                :key="i"
                class="checkin-question"
              >
                <div class="checkin-q-label">{{ q.label }}</div>

                <div v-if="q.type === 'yesno'" class="yesno-row">
                  <button
                    class="yesno-btn"
                    :class="{ selected: checkinAnswers[i] === true }"
                    @click="checkinAnswers[i] = true"
                  >
                    ✓ Yes
                  </button>
                  <button
                    class="yesno-btn no"
                    :class="{ selected: checkinAnswers[i] === false }"
                    @click="checkinAnswers[i] = false"
                  >
                    ✗ No
                  </button>
                </div>

                <div v-else-if="q.type === 'number'" class="form-group">
                  <input
                    v-model.number="checkinAnswers[i]"
                    type="number"
                    class="form-input"
                    :placeholder="q.placeholder"
                    min="0"
                  />
                </div>

                <div v-else-if="q.type === 'rating'" class="rating-row">
                  <button
                    v-for="n in 10"
                    :key="n"
                    class="rating-btn"
                    :class="{ selected: checkinAnswers[i] === n }"
                    @click="checkinAnswers[i] = n"
                  >{{ n }}</button>
                </div>
              </div>
            </div>

            <div class="modal-footer-row">
              <button class="btn btn-ghost" @click="checkinModal.show = false">Cancel</button>
              <button class="btn btn-primary" @click="submitCheckin" :disabled="checkinSaving">
                <span v-if="checkinSaving" class="spinner" />
                <span v-else>Submit ✓</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import DisciplineWizard from '@/components/DisciplineWizard.vue'
import { useDisciplineStore } from '@/store/discipline'

const store = useDisciplineStore()

// ── Check-in modal state ──────────────────────────────────────────────
const checkinModal   = ref({ show: false, discipline: null })
const checkinAnswers = ref([])
const checkinSaving  = ref(false)

// Check-in question templates per area
const checkInTemplates = {
  money: [
    { label: 'Did you log all your expenses today?', type: 'yesno' },
    { label: 'How much did you spend on "Wants" today? (₹)', type: 'number', placeholder: '0' },
  ],
  urges: [
    { label: 'How many times did the urge hit today?', type: 'number', placeholder: '0' },
    { label: 'How many times did you successfully resist or delay?', type: 'number', placeholder: '0' },
  ],
  relationships: [
    { label: 'Did you pause before reacting today?', type: 'yesno' },
    { label: 'Rate your emotional control today (1-10)', type: 'rating' },
  ],
  addiction: [
    { label: 'Did you stay at or below your daily limit today?', type: 'yesno' },
    { label: 'Rate your resistance level today (1-10)', type: 'rating' },
  ],
  desire: [
    { label: 'Hours of focused, distraction-free work today', type: 'number', placeholder: '0' },
    { label: 'Did you use your assigned system today?', type: 'yesno' },
  ],
  custom: [
    { label: 'Did you take your daily action today?', type: 'yesno' },
    { label: 'Rate your discipline today (1-10)', type: 'rating' },
  ],
}

const checkinQuestions = computed(() => {
  const areaId = checkinModal.value.discipline?.areaId
  return checkInTemplates[areaId] ?? checkInTemplates.custom
})

function openCheckin(discipline) {
  checkinModal.value = { show: true, discipline }
  checkinAnswers.value = checkinQuestions.value.map(() => null)
}

async function submitCheckin() {
  checkinSaving.value = true
  try {
    await store.submitCheckIn(checkinModal.value.discipline.id, {
      answers: checkinAnswers.value,
      date:    new Date().toISOString().split('T')[0]
    })
    checkinModal.value.show = false
  } catch (_) {}
  finally { checkinSaving.value = false }
}

// ── Wizard completion ─────────────────────────────────────────────────
async function onWizardComplete(data) {
  await store.create({
    areaName:    data.areaName,
    areaId:      data.areaId,
    areaEmoji:   data.areaEmoji,
    behavior:    data.behavior,
    dailyAction: data.dailyAction,
    scheduleType: data.scheduleType,
    days:        data.days,
    // Extra fields — store as JSON in description or extend backend entity
    framework:   data.framework,
    weeklyPlan:  JSON.stringify(data.weeklyPlan),
  })
}

// ── Helpers ───────────────────────────────────────────────────────────
function currentWeek(d) {
  if (!d.createdAt) return 0
  const days = Math.floor(
    (Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.min(Math.floor(days / 7), 3)
}

function scheduleLabel(d) {
  if (d.scheduleType === 'SPECIFIC' && d.scheduleDays?.length) {
    return d.scheduleDays.join(', ')
  }
  return d.scheduleType
}

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

async function confirmDelete(d) {
  if (!confirm(`Delete "${d.areaName}" journey?`)) return
  await store.remove(d.id)
}

onMounted(() => store.fetchAll())
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }

/* Wizard overlay */
.wizard-overlay {
  position: fixed; inset: 0;
  z-index: 200; overflow-y: auto;
}
.wizard-fade-enter-active,
.wizard-fade-leave-active { transition: opacity 0.3s ease; }
.wizard-fade-enter-from,
.wizard-fade-leave-to { opacity: 0; }

/* Main */
.main { flex: 1; padding: 32px 40px; max-width: 1000px; }

.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 28px;
}
.page-header h2 { font-size: 20px; font-weight: 800; }

/* Empty / loading */
.loading-state, .empty-state {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  padding: 60px; text-align: center;
}
.empty-emoji  { font-size: 48px; }
.empty-state h3 { font-size: 18px; font-weight: 700; }

/* Grid */
.discipline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

/* Card */
.discipline-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: transform var(--transition);
}
.discipline-card:hover { transform: translateY(-2px); }
.discipline-card.paused { opacity: 0.55; }

.dc-header {
  display: flex; align-items: flex-start;
  gap: 12px; margin-bottom: 14px;
}
.dc-emoji { font-size: 28px; flex-shrink: 0; }
.dc-meta  { flex: 1; }
.dc-area  {
  font-size: 11px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--text-muted);
  margin-bottom: 5px;
}
.dc-status-badge {
  display: inline-block;
  font-size: 10px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 999px;
}
.dc-status-badge.active    { background: var(--green-dim);   color: var(--green); }
.dc-status-badge.paused    { background: rgba(251,146,60,0.15); color: #fb923c; }
.dc-status-badge.completed { background: rgba(96,165,250,0.15); color: #60a5fa; }

.dc-actions { display: flex; gap: 4px; }
.dc-btn {
  width: 26px; height: 26px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
}
.dc-btn:hover { background: var(--bg-hover); border-color: var(--border-light); }
.dc-btn.danger:hover { background: var(--red-dim); color: var(--red); border-color: var(--red); }

/* Framework badge */
.dc-framework-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid rgba(124,106,247,0.2);
  border-radius: 999px;
  padding: 3px 10px;
  margin-bottom: 14px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.framework-icon { font-size: 12px; }

/* Section */
.dc-section { margin-bottom: 14px; }
.dc-label {
  font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-muted);
  margin-bottom: 6px;
}

/* Week card */
.dc-week-card {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
}
.dc-week-theme {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 4px;
}
.dc-week-action {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.dc-text { font-size: 13px; color: var(--text-primary); line-height: 1.5; }

/* Daily check-in button */
.dc-checkin {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--green-dim);
  border: 1px solid rgba(52,211,153,0.2);
  border-radius: var(--radius-sm);
  color: var(--green);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 14px;
  transition: all var(--transition);
}
.dc-checkin:hover {
  background: rgba(52,211,153,0.25);
  transform: translateX(2px);
}
.checkin-icon { font-size: 14px; }
.checkin-arrow { margin-left: auto; }

/* Footer */
.dc-footer {
  display: flex; justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  margin-top: auto;
}
.dc-schedule, .dc-since {
  font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--text-muted);
}

/* Check-in modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px; z-index: 1000;
}
.modal-box { width: 100%; max-width: 460px; }
.modal-header {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.modal-header h3 { font-size: 17px; font-weight: 700; }
.modal-body { display: flex; flex-direction: column; gap: 20px; }

.checkin-question { display: flex; flex-direction: column; gap: 10px; }
.checkin-q-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }

/* Yes/No */
.yesno-row { display: flex; gap: 10px; }
.yesno-btn {
  flex: 1; padding: 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 14px; font-weight: 600;
  font-family: var(--font-display);
  cursor: pointer;
  transition: all var(--transition);
}
.yesno-btn.selected { background: var(--green-dim); color: var(--green); border-color: var(--green); }
.yesno-btn.no.selected { background: var(--red-dim); color: var(--red); border-color: var(--red); }
.yesno-btn:hover:not(.selected) { border-color: var(--border-light); color: var(--text-primary); }

/* Rating */
.rating-row { display: flex; gap: 6px; flex-wrap: wrap; }
.rating-btn {
  width: 36px; height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 13px; font-weight: 600;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all var(--transition);
}
.rating-btn.selected { background: var(--accent); color: #fff; border-color: var(--accent); }
.rating-btn:hover:not(.selected) { border-color: var(--accent); color: var(--accent); }

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