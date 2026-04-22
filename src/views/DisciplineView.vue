<template>
  <div class="wizard-shell">

    <!-- Background orb -->
    <div class="bg-orb" :style="orbStyle" />

    <!-- Progress bar -->
    <div class="progress-rail">
      <div class="progress-fill" :style="{ width: progressPct + '%' }" />
    </div>

    <!-- Step counter -->
    <div class="step-counter mono">
      <span class="step-current">{{ step }}</span>
      <span class="step-sep">/</span>
      <span class="step-total">5</span>
    </div>

    <!-- ═══════════════════════════════════════════
         STEP 1 — Select Area
    ═══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 1" key="s1" class="step-wrap">
        <div class="step-eyebrow mono">where to begin</div>
        <h1 class="step-heading">
          What area of your life<br/>
          do you want to build<br/>
          <em>discipline</em> in?
        </h1>
        <p class="step-sub">
          Choose one area to focus on.<br/>
          You can always add more later.
        </p>

        <div class="area-grid">
          <button
            v-for="area in areas"
            :key="area.id"
            class="area-card"
            :class="{ selected: form.area === area.id }"
            @click="selectArea(area)"
          >
            <span class="area-emoji">{{ area.emoji }}</span>
            <div class="area-info">
              <div class="area-name">{{ area.name }}</div>
              <div class="area-desc">{{ area.desc }}</div>
            </div>
            <div class="area-check">✓</div>
          </button>
        </div>

        <!-- Custom area input -->
        <div class="custom-area" v-if="form.area === 'custom'">
          <input
            v-model="form.customAreaName"
            class="wizard-input"
            placeholder="Name your discipline area…"
            autofocus
          />
        </div>

        <button
          class="wizard-cta"
          :disabled="!canProceedStep1"
          @click="next"
        >
          Continue
          <span class="cta-arrow">→</span>
        </button>

        <p class="micro-copy">Small steps daily = real control</p>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════
         STEP 2 — Define Behavior
    ═══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 2" key="s2" class="step-wrap">
        <div class="step-eyebrow mono">define the problem</div>
        <h1 class="step-heading">
          What specific behavior<br/>
          do you want to <em>improve</em>?
        </h1>
        <p class="step-sub">
          Be honest. The more specific, the better.
        </p>

        <div class="suggestion-list">
          <button
            v-for="s in currentSuggestions"
            :key="s"
            class="suggestion-chip"
            :class="{ selected: form.behavior === s }"
            @click="form.behavior = s"
          >
            {{ s }}
          </button>
        </div>

        <div class="or-divider mono">or write your own</div>

        <textarea
          v-model="form.behavior"
          class="wizard-textarea"
          :placeholder="'e.g. ' + currentSuggestions[0]"
          rows="2"
        />

        <div class="insight-box">
          <span class="insight-icon">💡</span>
          <span>Don't ask <s>what discipline do you want</s> — ask <strong>what behavior do you want to change.</strong> That's what makes this practical.</span>
        </div>

        <div class="btn-row">
          <button class="wizard-back" @click="prev">← Back</button>
          <button class="wizard-cta" :disabled="!form.behavior.trim()" @click="next">
            Continue <span class="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════
         STEP 3 — Daily Action
    ═══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 3" key="s3" class="step-wrap">
        <div class="step-eyebrow mono">your daily practice</div>
        <h1 class="step-heading">
          How will you practice<br/>
          this <em>every day</em>?
        </h1>
        <p class="step-sub">
          Define one small, achievable action.
        </p>

        <div class="suggestion-list">
          <button
            v-for="s in actionSuggestions"
            :key="s"
            class="suggestion-chip"
            :class="{ selected: form.action === s }"
            @click="form.action = s"
          >
            {{ s }}
          </button>
        </div>

        <div class="or-divider mono">or write your own</div>

        <textarea
          v-model="form.action"
          class="wizard-textarea"
          :placeholder="'e.g. ' + actionSuggestions[0]"
          rows="2"
        />

        <div class="streak-preview">
          <div class="streak-dots">
            <span v-for="i in 7" :key="i" class="streak-dot" :class="{ lit: i <= previewStreakDots }" />
          </div>
          <span class="streak-label mono">You'll build a 7-day streak</span>
        </div>

        <div class="btn-row">
          <button class="wizard-back" @click="prev">← Back</button>
          <button class="wizard-cta" :disabled="!form.action.trim()" @click="next">
            Continue <span class="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════
         STEP 4 — Schedule
    ═══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 4" key="s4" class="step-wrap">
        <div class="step-eyebrow mono">consistency setup</div>
        <h1 class="step-heading">
          When will you<br/>
          work on <em>this</em>?
        </h1>
        <p class="step-sub">
          This will connect with your Timetable.
        </p>

        <div class="schedule-cards">
          <button
            v-for="opt in scheduleOptions"
            :key="opt.id"
            class="schedule-card"
            :class="{ selected: form.schedule === opt.id }"
            @click="form.schedule = opt.id"
          >
            <span class="schedule-icon">{{ opt.icon }}</span>
            <div>
              <div class="schedule-name">{{ opt.name }}</div>
              <div class="schedule-hint">{{ opt.hint }}</div>
            </div>
            <div class="area-check">✓</div>
          </button>
        </div>

        <!-- Day picker for specific days -->
        <div class="day-picker" v-if="form.schedule === 'specific'">
          <button
            v-for="d in days"
            :key="d.id"
            class="day-btn"
            :class="{ selected: form.days.includes(d.id) }"
            @click="toggleDay(d.id)"
          >
            {{ d.short }}
          </button>
        </div>

        <div class="timetable-note mono" v-if="form.schedule">
          <span class="timetable-dot" />
          Will appear in your Timetable automatically
        </div>

        <div class="btn-row">
          <button class="wizard-back" @click="prev">← Back</button>
          <button class="wizard-cta" :disabled="!canProceedStep4" @click="next">
            Continue <span class="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════
         STEP 5 — Confirmation
    ═══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 5" key="s5" class="step-wrap confirm-step">
        <div class="confirm-icon">{{ selectedArea?.emoji ?? '🎯' }}</div>
        <div class="step-eyebrow mono">your journey starts now</div>
        <h1 class="step-heading">
          Your discipline<br/>
          journey starts <em>today.</em>
        </h1>

        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label mono">Area</span>
            <span class="summary-value">{{ selectedArea?.name ?? form.customAreaName }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label mono">Behavior</span>
            <span class="summary-value">{{ form.behavior }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label mono">Daily action</span>
            <span class="summary-value">{{ form.action }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label mono">Schedule</span>
            <span class="summary-value">{{ scheduleLabel }}</span>
          </div>
        </div>

        <div class="streak-preview confirm-streak">
          <div class="streak-dots">
            <span v-for="i in 7" :key="i" class="streak-dot" :class="{ lit: i <= confirmedDots }" />
          </div>
          <span class="streak-label mono">Day 1 of your 7-day streak</span>
        </div>

        <button class="wizard-cta cta-large" @click="startNow" :disabled="submitting">
          <span v-if="submitting" class="spinner-sm" />
          <span v-else>Start Now →</span>
        </button>

        <p class="micro-copy">"The secret of getting ahead is getting started." — Mark Twain</p>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['complete'])

// ── State ─────────────────────────────────────────────────────────────
const step      = ref(1)
const submitting = ref(false)

// Animated streak dots on step 3
const previewStreakDots = ref(0)
let streakInterval = null

// Confirmed streak animation on step 5
const confirmedDots = ref(0)

const form = ref({
  area:           '',
  customAreaName: '',
  behavior:       '',
  action:         '',
  schedule:       '',
  days:           []
})

// ── Data ──────────────────────────────────────────────────────────────
const areas = [
  { id: 'urges',   emoji: '🧠', name: 'Control Urges',       desc: 'Reduce distractions and impulsive behavior' },
  { id: 'money',   emoji: '💰', name: 'Money Discipline',    desc: 'Manage spending and build saving habits' },
  { id: 'relationships', emoji: '❤️', name: 'Relationships', desc: 'Improve communication and emotional control' },
  { id: 'addiction', emoji: '🔥', name: 'Addiction Control', desc: 'Break harmful habits and dependencies' },
  { id: 'desire',  emoji: '🎯', name: 'Desire Management',   desc: 'Practice focus and delayed gratification' },
  { id: 'custom',  emoji: '➕', name: 'Custom Area',          desc: 'Define your own discipline goal' },
]

const behaviorMap = {
  urges:         ['Reduce social media usage', 'Stop checking phone constantly', 'Avoid binge watching'],
  money:         ['Avoid impulsive spending', 'Track every expense', 'No unnecessary purchases'],
  relationships: ['Control anger reactions', 'Listen before responding', 'Respond, not react'],
  addiction:     ['Reduce alcohol intake', 'Quit smoking step by step', 'Cut back on gaming'],
  desire:        ['Practice delayed gratification', 'Resist instant rewards', 'Stay focused on long-term goals'],
  custom:        ['Define a specific behavior', 'Identify the trigger', 'Replace a bad habit'],
}

const actionMap = {
  urges:         ['No phone for first 1 hour after waking', 'App timer: 30 min social media max', 'Phone face-down during meals'],
  money:         ['Track every expense in a notebook', 'Wait 24h before any purchase > ₹500', 'No shopping apps on home screen'],
  relationships: ['Pause 5 seconds before reacting', 'One gratitude message daily', 'No phone during conversations'],
  addiction:     ['Replace with a 10-min walk', 'Delay the urge by 15 minutes', 'Log every craving in journal'],
  desire:        ['No instant rewards until task is done', 'Complete 1 deep work session daily', 'Rate urges 1-10 instead of acting'],
  custom:        ['Define one micro-action', 'Do it at the same time daily', 'Track it in your journal'],
}

const scheduleOptions = [
  { id: 'daily',    icon: '🔁', name: 'Daily',          hint: 'Every single day — the most powerful' },
  { id: 'specific', icon: '📅', name: 'Specific days',  hint: 'Choose which days of the week' },
  { id: 'flexible', icon: '🌊', name: 'Flexible',       hint: 'When you feel ready — no pressure' },
]

const days = [
  { id: 'MON', short: 'M' }, { id: 'TUE', short: 'T' }, { id: 'WED', short: 'W' },
  { id: 'THU', short: 'T' }, { id: 'FRI', short: 'F' }, { id: 'SAT', short: 'S' },
  { id: 'SUN', short: 'S' },
]

// ── Computed ──────────────────────────────────────────────────────────
const progressPct = computed(() => ((step.value - 1) / 4) * 100)

const selectedArea = computed(() =>
  areas.find(a => a.id === form.value.area && a.id !== 'custom') ?? null
)

const currentSuggestions = computed(() =>
  behaviorMap[form.value.area] ?? behaviorMap.custom
)

const actionSuggestions = computed(() =>
  actionMap[form.value.area] ?? actionMap.custom
)

const canProceedStep1 = computed(() => {
  if (!form.value.area) return false
  if (form.value.area === 'custom') return form.value.customAreaName.trim().length > 0
  return true
})

const canProceedStep4 = computed(() => {
  if (!form.value.schedule) return false
  if (form.value.schedule === 'specific') return form.value.days.length > 0
  return true
})

const scheduleLabel = computed(() => {
  const opt = scheduleOptions.find(o => o.id === form.value.schedule)
  if (!opt) return '—'
  if (form.value.schedule === 'specific' && form.value.days.length > 0) {
    return form.value.days.join(', ')
  }
  return opt.name
})

// Orb color changes per area
const orbColors = {
  urges:         '#7c6af7',
  money:         '#34d399',
  relationships: '#f472b6',
  addiction:     '#f97316',
  desire:        '#60a5fa',
  custom:        '#a78bfa',
  '':            '#7c6af7',
}
const orbStyle = computed(() => ({
  background: orbColors[form.value.area] ?? '#7c6af7'
}))

// ── Actions ───────────────────────────────────────────────────────────
function selectArea(area) {
  form.value.area = area.id
  // Clear behavior/action when area changes
  form.value.behavior = ''
  form.value.action   = ''
}

function toggleDay(id) {
  const idx = form.value.days.indexOf(id)
  if (idx === -1) form.value.days.push(id)
  else form.value.days.splice(idx, 1)
}

function next() {
  if (step.value < 5) {
    step.value++
    if (step.value === 3) startStreakAnimation()
    if (step.value === 5) startConfirmAnimation()
  }
}

function prev() {
  if (step.value > 1) step.value--
}

function startStreakAnimation() {
  previewStreakDots.value = 0
  let i = 0
  streakInterval = setInterval(() => {
    if (i < 7) { previewStreakDots.value = ++i }
    else clearInterval(streakInterval)
  }, 180)
}

function startConfirmAnimation() {
  confirmedDots.value = 0
  let i = 0
  const iv = setInterval(() => {
    if (i < 7) { confirmedDots.value = ++i }
    else clearInterval(iv)
  }, 120)
}

async function startNow() {
  submitting.value = true
  // Emit the collected data to parent (DisciplineView) to save via API
  await new Promise(r => setTimeout(r, 600))
  emit('complete', {
    area:           form.value.area === 'custom' ? form.value.customAreaName : selectedArea.value?.name,
    areaId:         form.value.area,
    areaEmoji:      selectedArea.value?.emoji ?? '🎯',
    behavior:       form.value.behavior,
    action:         form.value.action,
    schedule:       form.value.schedule,
    days:           form.value.days,
  })
  submitting.value = false
}
</script>

<style scoped>
/* ── Shell ───────────────────────────────────────────────────────────── */
.wizard-shell {
  min-height: 100vh;
  background: #0a0a10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 24px 60px;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
}

/* Ambient orb */
.bg-orb {
  position: fixed;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  opacity: 0.08;
  filter: blur(80px);
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  transition: background 1s ease;
}

/* ── Progress bar ────────────────────────────────────────────────────── */
.progress-rail {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,0.08);
  z-index: 100;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c6af7, #a78bfa);
  transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
}

/* ── Step counter ────────────────────────────────────────────────────── */
.step-counter {
  position: fixed;
  top: 20px;
  right: 24px;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.1em;
  z-index: 100;
}
.step-current { color: rgba(255,255,255,0.7); }
.step-sep     { margin: 0 3px; }

/* ── Step wrapper ────────────────────────────────────────────────────── */
.step-wrap {
  width: 100%;
  max-width: 560px;
  padding-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

/* ── Typography ──────────────────────────────────────────────────────── */
.step-eyebrow {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7c6af7;
  margin-bottom: 16px;
}

.step-heading {
  font-size: clamp(28px, 5vw, 40px);
  font-weight: 800;
  color: #f0f0f8;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}
.step-heading em {
  font-style: normal;
  background: linear-gradient(135deg, #7c6af7, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.step-sub {
  font-size: 15px;
  color: rgba(255,255,255,0.45);
  line-height: 1.6;
  margin-bottom: 32px;
}

/* ── Area grid ───────────────────────────────────────────────────────── */
.area-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}

.area-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  position: relative;
}
.area-card:hover {
  background: rgba(124,106,247,0.1);
  border-color: rgba(124,106,247,0.3);
}
.area-card.selected {
  background: rgba(124,106,247,0.15);
  border-color: #7c6af7;
}

.area-emoji { font-size: 22px; flex-shrink: 0; }

.area-info { flex: 1; min-width: 0; }
.area-name { font-size: 13px; font-weight: 700; color: #f0f0f8; }
.area-desc { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; line-height: 1.4; }

.area-check {
  font-size: 12px;
  color: #7c6af7;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}
.area-card.selected .area-check { opacity: 1; }

/* ── Custom area input ───────────────────────────────────────────────── */
.custom-area { width: 100%; margin-bottom: 16px; }

/* ── Shared input styles ─────────────────────────────────────────────── */
.wizard-input,
.wizard-textarea {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #f0f0f8;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border 0.2s;
}
.wizard-input:focus,
.wizard-textarea:focus { border-color: #7c6af7; }
.wizard-input::placeholder,
.wizard-textarea::placeholder { color: rgba(255,255,255,0.25); }

/* ── Suggestion chips ────────────────────────────────────────────────── */
.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  margin-bottom: 16px;
}

.suggestion-chip {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;
}
.suggestion-chip:hover {
  border-color: rgba(124,106,247,0.5);
  color: #f0f0f8;
}
.suggestion-chip.selected {
  background: rgba(124,106,247,0.2);
  border-color: #7c6af7;
  color: #f0f0f8;
}

/* ── Or divider ──────────────────────────────────────────────────────── */
.or-divider {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
  margin: 12px 0;
}

/* ── Insight box ─────────────────────────────────────────────────────── */
.insight-box {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: rgba(124,106,247,0.08);
  border: 1px solid rgba(124,106,247,0.2);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  line-height: 1.6;
  margin-top: 16px;
}
.insight-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.insight-box strong { color: rgba(255,255,255,0.8); }
.insight-box s { opacity: 0.5; }

/* ── Schedule cards ──────────────────────────────────────────────────── */
.schedule-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}

.schedule-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  font-family: inherit;
}
.schedule-card:hover {
  background: rgba(124,106,247,0.1);
  border-color: rgba(124,106,247,0.3);
}
.schedule-card.selected {
  background: rgba(124,106,247,0.15);
  border-color: #7c6af7;
}

.schedule-icon { font-size: 20px; flex-shrink: 0; }
.schedule-name { font-size: 14px; font-weight: 700; color: #f0f0f8; }
.schedule-hint { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.schedule-card .area-check { margin-left: auto; }

/* ── Day picker ──────────────────────────────────────────────────────── */
.day-picker {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.day-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s;
}
.day-btn:hover { border-color: rgba(124,106,247,0.5); color: #f0f0f8; }
.day-btn.selected {
  background: #7c6af7;
  border-color: #7c6af7;
  color: #fff;
}

/* ── Timetable note ──────────────────────────────────────────────────── */
.timetable-note {
  font-size: 11px;
  letter-spacing: 0.06em;
  color: rgba(124,106,247,0.7);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.timetable-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #7c6af7;
  flex-shrink: 0;
}

/* ── Streak preview ──────────────────────────────────────────────────── */
.streak-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  margin-bottom: 8px;
}
.streak-dots { display: flex; gap: 6px; }
.streak-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  transition: background 0.3s, transform 0.3s;
}
.streak-dot.lit {
  background: #7c6af7;
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(124,106,247,0.6);
}
.streak-label {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.06em;
}

/* ── CTA buttons ─────────────────────────────────────────────────────── */
.wizard-cta {
  margin-top: 24px;
  padding: 14px 28px;
  background: #7c6af7;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  align-self: flex-start;
}
.wizard-cta:hover:not(:disabled) {
  background: #9580ff;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(124,106,247,0.35);
}
.wizard-cta:disabled { opacity: 0.35; cursor: not-allowed; }
.cta-arrow { font-size: 16px; }
.cta-large { padding: 16px 36px; font-size: 16px; width: 100%; justify-content: center; }

.wizard-back {
  padding: 12px 20px;
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.45);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.wizard-back:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); }

.btn-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  width: 100%;
}
.btn-row .wizard-cta { margin-top: 0; }

/* ── Micro copy ──────────────────────────────────────────────────────── */
.micro-copy {
  font-size: 12px;
  color: rgba(255,255,255,0.2);
  margin-top: 14px;
  font-style: italic;
}

/* ── Step 5 confirmation ─────────────────────────────────────────────── */
.confirm-step { align-items: center; text-align: center; }
.confirm-step .step-heading { text-align: center; }
.confirm-step .btn-row { justify-content: center; }

.confirm-icon {
  font-size: 56px;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 24px rgba(124,106,247,0.5));
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

.summary-card {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.summary-row:last-child { border-bottom: none; }

.summary-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  min-width: 80px;
  padding-top: 2px;
}
.summary-value {
  font-size: 14px;
  color: #f0f0f8;
  text-align: left;
  line-height: 1.4;
}

.confirm-streak { justify-content: center; margin-bottom: 24px; }

/* ── Spinner ─────────────────────────────────────────────────────────── */
.spinner-sm {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transitions ─────────────────────────────────────────────────────── */
.slide-enter-active, .slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from { opacity: 0; transform: translateX(32px); }
.slide-leave-to   { opacity: 0; transform: translateX(-32px); }

/* ── Mono util ───────────────────────────────────────────────────────── */
.mono { font-family: 'DM Mono', 'Fira Code', monospace; }

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .area-grid { grid-template-columns: 1fr; }
  .step-wrap { padding-top: 60px; }
}
</style>