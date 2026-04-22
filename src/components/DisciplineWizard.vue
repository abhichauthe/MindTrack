<template>
  <div class="wizard-shell">

    <!-- Ambient orb -->
    <div class="bg-orb" :style="orbStyle" />

    <!-- Progress bar -->
    <div class="progress-rail">
      <div class="progress-fill" :style="{ width: progressPct + '%' }" />
    </div>

    <!-- Step counter -->
    <div class="step-counter mono">
      <span class="step-current">{{ step }}</span>
      <span class="step-sep">/</span>
      <span class="step-total">{{ totalSteps }}</span>
    </div>

    <!-- ══════════════════════════════════════════
         STEP 1 — Select Area
    ══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 1" key="s1" class="step-wrap">
        <div class="step-eyebrow mono">where to begin</div>
        <h1 class="step-heading">
          What area of your life<br/>
          do you want to build<br/>
          <em>real discipline</em> in?
        </h1>
        <p class="step-sub">
          Choose one area. The system will create a<br/>
          personalized plan based on your situation.
        </p>

        <div class="area-grid">
          <button
            v-for="area in areas"
            :key="area.id"
            class="area-card"
            :class="{ selected: form.areaId === area.id }"
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

        <div class="custom-area" v-if="form.areaId === 'custom'">
          <input
            v-model="form.customAreaName"
            class="wizard-input"
            placeholder="Name your discipline area…"
          />
        </div>

        <button class="wizard-cta" :disabled="!canProceedStep1" @click="next">
          Continue <span class="cta-arrow">→</span>
        </button>
        <p class="micro-copy">Specific beats generic. Always.</p>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════
         STEP 2 — Area-Specific Assessment
    ══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 2" key="s2" class="step-wrap">
        <div class="step-eyebrow mono">{{ selectedArea?.name }} assessment</div>
        <h1 class="step-heading">
          Let's understand<br/>
          your <em>real situation</em>.
        </h1>
        <p class="step-sub">
          Honest answers = a plan that actually works.
        </p>

        <div class="assessment-form">
          <div
            v-for="q in currentAssessmentQuestions"
            :key="q.id"
            class="assessment-field"
          >
            <label class="field-label mono">{{ q.label }}</label>

            <!-- Number input -->
            <div v-if="q.type === 'number'" class="input-with-unit">
              <span v-if="q.unit" class="input-unit">{{ q.unit }}</span>
              <input
                v-model.number="assessment[q.id]"
                type="number"
                class="wizard-input"
                :placeholder="q.placeholder"
                :class="{ 'has-unit': q.unit }"
              />
            </div>

            <!-- Select input -->
            <div v-else-if="q.type === 'select'" class="select-chips">
              <button
                v-for="opt in q.options"
                :key="opt.value"
                class="select-chip"
                :class="{ selected: assessment[q.id] === opt.value }"
                @click="assessment[q.id] = opt.value"
              >
                <span v-if="opt.emoji" class="chip-emoji">{{ opt.emoji }}</span>
                {{ opt.label }}
              </button>
            </div>

            <!-- Multi-select -->
            <div v-else-if="q.type === 'multiselect'" class="select-chips">
              <button
                v-for="opt in q.options"
                :key="opt.value"
                class="select-chip"
                :class="{ selected: (assessment[q.id] || []).includes(opt.value) }"
                @click="toggleMulti(q.id, opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>

            <!-- Range slider -->
            <div v-else-if="q.type === 'range'" class="range-wrap">
              <input
                v-model.number="assessment[q.id]"
                type="range"
                :min="q.min"
                :max="q.max"
                class="wizard-range"
              />
              <div class="range-labels mono">
                <span>{{ q.minLabel }}</span>
                <span class="range-val">{{ assessment[q.id] ?? q.min }}</span>
                <span>{{ q.maxLabel }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="btn-row">
          <button class="wizard-back" @click="prev">← Back</button>
          <button class="wizard-cta" :disabled="!canProceedStep2" @click="next">
            Build My Plan <span class="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════
         STEP 3 — Framework Display
    ══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 3" key="s3" class="step-wrap">
        <div class="step-eyebrow mono">your personalized framework</div>
        <h1 class="step-heading">
          Here's your<br/>
          <em>{{ calculatedFramework.name }}</em>
        </h1>
        <p class="step-sub">{{ calculatedFramework.description }}</p>

        <!-- Framework breakdown -->
        <div class="framework-card">
          <div
            v-for="item in calculatedFramework.breakdown"
            :key="item.label"
            class="framework-row"
          >
            <div class="fw-left">
              <span class="fw-emoji">{{ item.emoji }}</span>
              <div>
                <div class="fw-label">{{ item.label }}</div>
                <div class="fw-hint mono">{{ item.hint }}</div>
              </div>
            </div>
            <div class="fw-right">
              <div class="fw-value" :style="{ color: item.color }">{{ item.value }}</div>
              <div class="fw-pct mono">{{ item.pct }}</div>
            </div>
          </div>

          <!-- Warning if applicable -->
          <div v-if="calculatedFramework.warning" class="fw-warning">
            <span>⚠️</span>
            <span>{{ calculatedFramework.warning }}</span>
          </div>
        </div>

        <!-- Week by week plan preview -->
        <div class="plan-preview">
          <div class="plan-preview-title mono">Your 4-week action plan</div>
          <div
            v-for="(week, i) in calculatedFramework.weeklyPlan"
            :key="i"
            class="plan-week"
          >
            <div class="plan-week-num mono">Week {{ i + 1 }}</div>
            <div class="plan-week-theme">{{ week.theme }}</div>
            <div class="plan-week-action">{{ week.action }}</div>
          </div>
        </div>

        <div class="btn-row">
          <button class="wizard-back" @click="prev">← Back</button>
          <button class="wizard-cta" @click="next">
            This looks right <span class="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════
         STEP 4 — Daily Check-in Setup
    ══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 4" key="s4" class="step-wrap">
        <div class="step-eyebrow mono">daily accountability</div>
        <h1 class="step-heading">
          Your daily<br/>
          <em>check-in</em> habit.
        </h1>
        <p class="step-sub">
          Every day, MindTrack will ask you one question.<br/>
          30 seconds. Builds the habit of reflection.
        </p>

        <!-- Preview of check-in questions -->
        <div class="checkin-preview">
          <div class="checkin-preview-label mono">Your daily questions will be:</div>
          <div
            v-for="(q, i) in dailyCheckInQuestions"
            :key="i"
            class="checkin-q"
          >
            <span class="checkin-q-num mono">{{ i + 1 }}</span>
            <span class="checkin-q-text">{{ q }}</span>
          </div>
        </div>

        <!-- Schedule -->
        <div class="field-label mono" style="margin-top:24px;margin-bottom:12px">
          When do you want to be reminded?
        </div>
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

        <div class="btn-row">
          <button class="wizard-back" @click="prev">← Back</button>
          <button class="wizard-cta" :disabled="!form.schedule" @click="next">
            Continue <span class="cta-arrow">→</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════
         STEP 5 — Confirmation
    ══════════════════════════════════════════ -->
    <Transition name="slide" mode="out-in">
      <div v-if="step === 5" key="s5" class="step-wrap confirm-step">
        <div class="confirm-icon">{{ selectedArea?.emoji ?? '🎯' }}</div>
        <div class="step-eyebrow mono">your journey starts today</div>
        <h1 class="step-heading">
          Your discipline plan<br/>
          is <em>ready.</em>
        </h1>

        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label mono">Area</span>
            <span class="summary-value">{{ selectedArea?.name ?? form.customAreaName }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label mono">Framework</span>
            <span class="summary-value">{{ calculatedFramework.name }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label mono">Week 1 focus</span>
            <span class="summary-value">{{ calculatedFramework.weeklyPlan?.[0]?.theme }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label mono">Daily action</span>
            <span class="summary-value">{{ calculatedFramework.weeklyPlan?.[0]?.action }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label mono">Schedule</span>
            <span class="summary-value">{{ scheduleOptions.find(s => s.id === form.schedule)?.name }}</span>
          </div>
        </div>

        <!-- Streak preview -->
        <div class="streak-preview">
          <div class="streak-dots">
            <span
              v-for="i in 7"
              :key="i"
              class="streak-dot"
              :class="{ lit: i <= confirmedDots }"
            />
          </div>
          <span class="streak-label mono">Day 1 of your 30-day journey</span>
        </div>

        <button
          class="wizard-cta cta-large"
          @click="startNow"
          :disabled="submitting"
        >
          <span v-if="submitting" class="spinner-sm" />
          <span v-else>Start My Journey →</span>
        </button>

        <p class="micro-copy">
          "Discipline is the bridge between goals and accomplishment." — Jim Rohn
        </p>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['complete'])

// ── State ─────────────────────────────────────────────────────────────
const step       = ref(1)
const totalSteps = 5
const submitting = ref(false)

const confirmedDots = ref(0)

const form = ref({
  areaId:         '',
  customAreaName: '',
  schedule:       '',
})

// Area-specific assessment answers
const assessment = ref({})

// ── Area definitions ──────────────────────────────────────────────────
const areas = [
  { id: 'money',         emoji: '💰', name: 'Money Discipline',    desc: 'Budgeting, saving, cutting waste' },
  { id: 'urges',         emoji: '🧠', name: 'Urge Control',        desc: 'Phone, food, social media, impulses' },
  { id: 'relationships', emoji: '❤️', name: 'Relationships',       desc: 'Emotional reactions, communication' },
  { id: 'addiction',     emoji: '🔥', name: 'Addiction Control',   desc: 'Break dependencies step by step' },
  { id: 'desire',        emoji: '🎯', name: 'Desire Management',   desc: 'Focus, delayed gratification' },
  { id: 'custom',        emoji: '➕', name: 'Custom Area',          desc: 'Define your own goal' },
]

// ── Assessment questions per area ─────────────────────────────────────
const assessmentQuestions = {
  money: [
    {
      id: 'income', type: 'number', unit: '₹',
      label: 'Monthly income after tax',
      placeholder: '45000'
    },
    {
      id: 'expenses', type: 'number', unit: '₹',
      label: 'Fixed monthly expenses (rent, bills, EMIs)',
      placeholder: '20000'
    },
    {
      id: 'savings', type: 'number', unit: '₹',
      label: 'How much do you currently save each month?',
      placeholder: '2000'
    },
    {
      id: 'weakness', type: 'select',
      label: 'Your biggest spending weakness',
      options: [
        { value: 'food',          label: 'Food delivery',    emoji: '🍔' },
        { value: 'shopping',      label: 'Online shopping',  emoji: '🛍️' },
        { value: 'subscriptions', label: 'Subscriptions',    emoji: '📱' },
        { value: 'going_out',     label: 'Going out',        emoji: '🎉' },
        { value: 'impulse',       label: 'Impulse buys',     emoji: '⚡' },
      ]
    },
  ],
  urges: [
    {
      id: 'urge_type', type: 'select',
      label: 'Which urge affects you most?',
      options: [
        { value: 'phone',    label: 'Phone / Social media', emoji: '📱' },
        { value: 'food',     label: 'Junk food / Overeating', emoji: '🍕' },
        { value: 'gaming',   label: 'Gaming',               emoji: '🎮' },
        { value: 'shopping', label: 'Shopping',             emoji: '🛍️' },
        { value: 'other',    label: 'Something else',       emoji: '🌀' },
      ]
    },
    {
      id: 'trigger', type: 'select',
      label: 'When does the urge hit most?',
      options: [
        { value: 'morning',  label: 'Morning',   emoji: '🌅' },
        { value: 'afternoon',label: 'Afternoon', emoji: '☀️' },
        { value: 'evening',  label: 'Evening',   emoji: '🌆' },
        { value: 'stressed', label: 'When stressed', emoji: '😰' },
        { value: 'bored',    label: 'When bored',   emoji: '😐' },
      ]
    },
    {
      id: 'frequency', type: 'range', min: 1, max: 20,
      label: 'How many times does the urge hit daily?',
      minLabel: '1x', maxLabel: '20x+'
    },
  ],
  relationships: [
    {
      id: 'pattern', type: 'select',
      label: 'Which pattern do you want to change?',
      options: [
        { value: 'anger',    label: 'Anger / overreacting',    emoji: '😤' },
        { value: 'avoidance',label: 'Avoiding conversations',  emoji: '🤐' },
        { value: 'people_pleasing', label: 'People pleasing',  emoji: '😅' },
        { value: 'jealousy', label: 'Jealousy / insecurity',   emoji: '😟' },
        { value: 'isolation',label: 'Pulling away from people',emoji: '🫥' },
      ]
    },
    {
      id: 'frequency', type: 'range', min: 1, max: 10,
      label: 'How often does this pattern cause problems?',
      minLabel: 'Rarely', maxLabel: 'Daily'
    },
    {
      id: 'context', type: 'select',
      label: 'Mostly happens with whom?',
      options: [
        { value: 'partner',  label: 'Partner / spouse', emoji: '💑' },
        { value: 'family',   label: 'Family',           emoji: '👨‍👩‍👧' },
        { value: 'coworkers',label: 'Coworkers',        emoji: '💼' },
        { value: 'friends',  label: 'Friends',          emoji: '👥' },
        { value: 'everyone', label: 'Everyone',         emoji: '🌐' },
      ]
    },
  ],
  addiction: [
    {
      id: 'substance', type: 'select',
      label: 'What do you want to reduce or quit?',
      options: [
        { value: 'alcohol',   label: 'Alcohol',    emoji: '🍺' },
        { value: 'smoking',   label: 'Smoking',    emoji: '🚬' },
        { value: 'social',    label: 'Social media addiction', emoji: '📲' },
        { value: 'porn',      label: 'Adult content', emoji: '🔒' },
        { value: 'gambling',  label: 'Gambling',   emoji: '🎰' },
        { value: 'other',     label: 'Other',      emoji: '🌀' },
      ]
    },
    {
      id: 'frequency', type: 'select',
      label: 'Current frequency',
      options: [
        { value: 'multiple_daily', label: 'Multiple times a day', emoji: '🔴' },
        { value: 'daily',          label: 'Once a day',           emoji: '🟠' },
        { value: 'few_week',       label: 'Few times a week',     emoji: '🟡' },
        { value: 'weekends',       label: 'Weekends only',        emoji: '🟢' },
      ]
    },
    {
      id: 'goal', type: 'select',
      label: 'Your goal',
      options: [
        { value: 'quit_completely', label: 'Quit completely',       emoji: '🛑' },
        { value: 'reduce_half',     label: 'Reduce by 50%',         emoji: '📉' },
        { value: 'control',         label: 'Learn to control it',   emoji: '⚖️' },
      ]
    },
  ],
  desire: [
    {
      id: 'desire_type', type: 'select',
      label: 'What desire do you struggle to resist?',
      options: [
        { value: 'distraction', label: 'Constant distraction',    emoji: '🌀' },
        { value: 'instant',     label: 'Instant gratification',   emoji: '⚡' },
        { value: 'procrastination', label: 'Procrastination',     emoji: '⏳' },
        { value: 'perfectionism',   label: 'Perfectionism / overthinking', emoji: '🔄' },
        { value: 'comparison',  label: 'Comparing with others',   emoji: '📊' },
      ]
    },
    {
      id: 'impact', type: 'select',
      label: 'How much does it affect your productivity?',
      options: [
        { value: 'severe',   label: 'Severely — I get almost nothing done', emoji: '🔴' },
        { value: 'moderate', label: 'Moderately — I lose 2-3 hours daily',  emoji: '🟠' },
        { value: 'mild',     label: 'Mildly — It slows me down sometimes',  emoji: '🟡' },
      ]
    },
  ],
  custom: [
    {
      id: 'behavior', type: 'select',
      label: 'What is the core problem?',
      options: [
        { value: 'consistency', label: 'Lack of consistency',   emoji: '📅' },
        { value: 'focus',       label: 'Lack of focus',         emoji: '🎯' },
        { value: 'motivation',  label: 'Low motivation',        emoji: '🔋' },
        { value: 'habits',      label: 'Bad daily habits',      emoji: '🔄' },
      ]
    },
    {
      id: 'frequency', type: 'range', min: 1, max: 10,
      label: 'How severe is the problem? (1 = minor, 10 = life-impacting)',
      minLabel: 'Minor', maxLabel: 'Severe'
    },
  ],
}

// ── Schedule options ──────────────────────────────────────────────────
const scheduleOptions = [
  { id: 'morning',  icon: '🌅', name: 'Morning check-in',  hint: 'Start each day with intention' },
  { id: 'evening',  icon: '🌆', name: 'Evening reflection', hint: 'Review your day before sleep' },
  { id: 'flexible', icon: '🌊', name: 'Flexible',           hint: 'Check in whenever works for you' },
]

// ── Computed ──────────────────────────────────────────────────────────
const progressPct = computed(() => ((step.value - 1) / (totalSteps - 1)) * 100)

const selectedArea = computed(() =>
  areas.find(a => a.id === form.value.areaId && a.id !== 'custom') ?? null
)

const currentAssessmentQuestions = computed(() =>
  assessmentQuestions[form.value.areaId] ?? assessmentQuestions.custom
)

const canProceedStep1 = computed(() => {
  if (!form.value.areaId) return false
  if (form.value.areaId === 'custom') return form.value.customAreaName.trim().length > 0
  return true
})

const canProceedStep2 = computed(() => {
  const questions = currentAssessmentQuestions.value
  return questions.every(q => {
    const val = assessment.value[q.id]
    if (q.type === 'number') return val !== undefined && val !== '' && val > 0
    if (q.type === 'select') return !!val
    if (q.type === 'multiselect') return Array.isArray(val) && val.length > 0
    if (q.type === 'range') return val !== undefined
    return true
  })
})

// ── Framework calculator ──────────────────────────────────────────────
const calculatedFramework = computed(() => {
  const a   = assessment.value
  const aId = form.value.areaId

  if (aId === 'money') {
    const income   = a.income   || 0
    const expenses = a.expenses || 0
    const savings  = a.savings  || 0
    const savingsRate = income > 0 ? (savings / income) * 100 : 0
    const disposable  = income - expenses

    const needs50    = Math.round(income * 0.50)
    const wants30    = Math.round(income * 0.30)
    const savings20  = Math.round(income * 0.20)
    const targetSave = Math.round(income * 0.20)
    const gap        = targetSave - savings

    const frameworkName = savingsRate < 5
      ? 'Emergency Fund First'
      : income > 80000
        ? 'Zero-Based Budget'
        : '50/30/20 Rule'

    return {
      name: frameworkName,
      description: savingsRate < 5
        ? 'Before investing, build a 3-month emergency fund. Safety first.'
        : 'Allocate every rupee intentionally across needs, wants, and savings.',
      warning: savingsRate < 5
        ? `You're currently saving only ${savingsRate.toFixed(0)}% of income. Target is 20%.`
        : null,
      breakdown: [
        {
          label: 'Needs (essentials)',
          emoji: '🏠',
          value: `₹${needs50.toLocaleString()}`,
          pct: '50%',
          hint: 'Rent, food, transport, bills',
          color: '#60a5fa'
        },
        {
          label: 'Wants (lifestyle)',
          emoji: '🎉',
          value: `₹${wants30.toLocaleString()}`,
          pct: '30%',
          hint: 'Dining, entertainment, shopping',
          color: '#fb923c'
        },
        {
          label: 'Savings / Investment',
          emoji: '💰',
          value: `₹${savings20.toLocaleString()}`,
          pct: '20%',
          hint: gap > 0 ? `You need to save ₹${gap.toLocaleString()} more` : 'You are on track!',
          color: '#34d399'
        },
      ],
      weeklyPlan: [
        { theme: 'Awareness',         action: `Log every expense for 7 days. Don't change behavior yet. Just observe where ₹${income.toLocaleString()} actually goes.` },
        { theme: 'Identify Leaks',    action: `Review your logs. Find the top 3 "Want" categories. Cut the biggest one by 50% this week.` },
        { theme: 'Automate Savings',  action: `Set up an auto-transfer of ₹${savings20.toLocaleString()} on your next salary date. Pay yourself first.` },
        { theme: 'Build the System',  action: `Cancel one unused subscription. Switch one food delivery order to home cooking. Track the money saved.` },
      ]
    }
  }

  if (aId === 'urges') {
    const freq = a.frequency || 5
    const trigger = a.trigger || 'bored'
    const urge    = a.urge_type || 'phone'

    const replacements = {
      phone:   '10-minute walk without phone',
      food:    'Drink a full glass of water and wait 10 minutes',
      gaming:  '5 minutes of stretching or pushups',
      shopping:'Write down what you want to buy — revisit in 48 hours',
      other:   'Take 5 deep breaths and journal the feeling',
    }

    return {
      name: 'Delay & Replace Method',
      description: `You experience the urge ~${freq} times daily. The science-backed approach: delay 5 minutes, then replace with a healthy behavior.`,
      warning: freq > 10 ? 'High frequency urges need gradual reduction, not cold turkey.' : null,
      breakdown: [
        { label: 'Your urge',        emoji: '⚡', value: urge.replace('_', ' '), pct: `${freq}x/day`, hint: 'What triggers it', color: '#f87171' },
        { label: 'Trigger time',     emoji: '🕐', value: trigger, pct: 'Peak time', hint: 'When to be most careful', color: '#fb923c' },
        { label: 'Your replacement', emoji: '✅', value: replacements[urge], pct: 'Use this', hint: 'Every time urge hits', color: '#34d399' },
      ],
      weeklyPlan: [
        { theme: 'Track Only',        action: `Every time the urge hits, open MindTrack and log it. Don't resist yet. Just build awareness of frequency.` },
        { theme: '5-Minute Delay',    action: `When urge hits: set a 5-minute timer. If still there after, you may act. Log whether you waited.` },
        { theme: 'Replace',           action: `When urge hits: do the replacement behavior (${replacements[urge]}) instead. Log the outcome.` },
        { theme: 'Measure Progress',  action: `Compare your resistance rate vs Week 1. Any improvement is a win. Identify your hardest trigger time.` },
      ]
    }
  }

  if (aId === 'relationships') {
    const pattern = a.pattern || 'anger'
    const context = a.context || 'everyone'

    const strategies = {
      anger:           'Pause 5 seconds before responding. Breathe first, react second.',
      avoidance:       'Schedule one difficult conversation per week. Start small.',
      people_pleasing: 'Practice saying "let me think about that" before agreeing to anything.',
      jealousy:        'Journal the feeling when it arrives. Ask: what does this tell me about what I value?',
      isolation:       'Send one message to someone you care about daily. Just check in.',
    }

    return {
      name: 'Pause & Respond Framework',
      description: `Focus: ${pattern.replace('_', ' ')} with ${context}. The goal is to respond thoughtfully instead of reacting automatically.`,
      warning: null,
      breakdown: [
        { label: 'Pattern to break',  emoji: '🔄', value: pattern.replace('_',' '), pct: 'Primary focus', hint: 'What you are changing', color: '#f87171' },
        { label: 'Daily strategy',    emoji: '⚙️', value: strategies[pattern], pct: 'Use daily', hint: 'Your core tool', color: '#7c6af7' },
        { label: 'Daily reflection',  emoji: '📔', value: '2-minute journal', pct: 'Every evening', hint: 'Rate your emotional control 1-10', color: '#34d399' },
      ],
      weeklyPlan: [
        { theme: 'Notice',            action: `Every time the pattern occurs, just notice it. Don't judge. Log it in journal. No pressure to change yet.` },
        { theme: 'Pause Practice',    action: `${strategies[pattern]} Practice this once per day, even in low-stakes situations.` },
        { theme: 'Rate Yourself',     action: `After each interaction with ${context}, rate your emotional control 1-10. Track the trend.` },
        { theme: 'One Conversation',  action: `Have one intentional, fully-present conversation this week. No phone. Full attention. Reflect afterward.` },
      ]
    }
  }

  if (aId === 'addiction') {
    const substance = a.substance || 'other'
    const goal      = a.goal || 'reduce_half'
    const freq      = a.frequency || 'daily'

    const reductions = {
      quit_completely: 'Reduce by 25% each week. Week 4 = zero.',
      reduce_half:     'Cut current frequency in half by end of Week 2.',
      control:         'Set a clear limit. Never exceed it. Log every instance.',
    }

    return {
      name: 'Gradual Reduction System',
      description: `Quitting cold turkey has a 95% failure rate. Gradual reduction with accountability has 3x better outcomes.`,
      warning: 'If you have physical dependence, consult a doctor before reducing. This plan is for behavioral habits.',
      breakdown: [
        { label: 'Target substance', emoji: '🎯', value: substance, pct: 'Primary focus', hint: 'What you are reducing', color: '#f87171' },
        { label: 'Your goal',        emoji: '🏁', value: goal.replace('_', ' '), pct: 'End state', hint: 'Where you want to be', color: '#60a5fa' },
        { label: 'Strategy',         emoji: '📉', value: reductions[goal], pct: 'Your plan', hint: 'Week by week reduction', color: '#34d399' },
      ],
      weeklyPlan: [
        { theme: 'Baseline',          action: `Log every single instance for 7 days without trying to reduce. You need accurate data first.` },
        { theme: 'First Reduction',   action: `Reduce by 25% from your baseline. Replace urge time with a physical activity or cold water.` },
        { theme: 'Second Reduction',  action: `Reduce by another 25%. Identify your 2 highest-risk trigger situations and plan around them.` },
        { theme: 'Lock In',           action: `Maintain your new baseline for 7 days straight. Celebrate every full day at target level.` },
      ]
    }
  }

  if (aId === 'desire') {
    const desire = a.desire_type || 'distraction'
    const impact = a.impact || 'moderate'

    const systems = {
      distraction:     'Time-blocking: assign specific tasks to specific hours. Everything else is off.',
      instant:         'The 24-hour rule: before any non-essential action, wait 24 hours.',
      procrastination: '2-minute rule: if it takes less than 2 minutes, do it now. Otherwise block time for it.',
      perfectionism:   'Set a "good enough" threshold before starting. Done > perfect.',
      comparison:      'Social media blackout 9AM–12PM daily. Replace with creation time.',
    }

    return {
      name: 'Structured Focus System',
      description: `Your core struggle: ${desire.replace('_', ' ')}. The fix is not more willpower — it's better structure.`,
      warning: impact === 'severe' ? 'Severe impact detected. Start with just 1 hour of structured focus daily.' : null,
      breakdown: [
        { label: 'Core pattern',   emoji: '🎯', value: desire.replace('_',' '), pct: 'Primary issue', hint: 'What you are fixing', color: '#f87171' },
        { label: 'Your system',    emoji: '⚙️', value: systems[desire], pct: 'Daily tool', hint: 'Use this every day', color: '#7c6af7' },
        { label: 'Daily goal',     emoji: '⏱️', value: impact === 'severe' ? '1 focused hour' : '3 focused hours', pct: 'Per day', hint: 'Distraction-free work', color: '#34d399' },
      ],
      weeklyPlan: [
        { theme: 'Audit',           action: `Track how you actually spend time for 3 days. Use a notebook. Be honest. No judgment.` },
        { theme: 'One System',      action: `Implement: ${systems[desire]}. One system only. Don't try to fix everything at once.` },
        { theme: 'Protect Time',    action: `Block 2 hours daily as "deep work". Phone off, notifications off, door closed. Guard it.` },
        { theme: 'Review & Adjust', action: `Review what worked. What broke the focus? Eliminate that one thing specifically next week.` },
      ]
    }
  }

  // Custom fallback
  return {
    name: 'Custom Discipline Plan',
    description: 'A practical step-by-step approach to building your discipline.',
    warning: null,
    breakdown: [
      { label: 'Focus area',    emoji: '🎯', value: form.value.customAreaName || 'Custom', pct: 'Your goal', hint: 'What you are working on', color: '#7c6af7' },
      { label: 'Daily minimum', emoji: '✅', value: '15 minutes', pct: 'Per day', hint: 'Non-negotiable daily practice', color: '#34d399' },
      { label: 'Weekly review', emoji: '📊', value: 'Every Sunday', pct: 'Reflection', hint: 'Rate progress 1-10', color: '#60a5fa' },
    ],
    weeklyPlan: [
      { theme: 'Awareness',   action: 'For 7 days, just observe and log the behavior without trying to change it.' },
      { theme: 'Reduce',      action: 'Identify the single biggest obstacle and remove or reduce it.' },
      { theme: 'Replace',     action: 'Install one positive behavior to replace the negative pattern.' },
      { theme: 'Measure',     action: 'Compare Week 4 to Week 1. Quantify the improvement.' },
    ]
  }
})

// ── Daily check-in questions per area ─────────────────────────────────
const dailyCheckInQuestions = computed(() => {
  const map = {
    money: [
      'Did you log all your expenses today?',
      'Did you stay within your wants budget today?',
    ],
    urges: [
      'How many times did the urge hit today?',
      'How many times did you successfully resist or delay?',
    ],
    relationships: [
      'Did you pause before reacting in any interaction today?',
      'Rate your emotional control today (1-10)',
    ],
    addiction: [
      'Did you stay at or below your daily target today?',
      'What triggered the urge today (if it hit)?',
    ],
    desire: [
      'How many hours of focused, distraction-free work today?',
      'Did you use your assigned system today?',
    ],
    custom: [
      'Did you take your daily action today?',
      'Rate your discipline today (1-10)',
    ],
  }
  return map[form.value.areaId] ?? map.custom
})

// Orb color changes per area
const orbColors = {
  money:         '#34d399',
  urges:         '#7c6af7',
  relationships: '#f472b6',
  addiction:     '#f97316',
  desire:        '#60a5fa',
  custom:        '#a78bfa',
  '':            '#7c6af7',
}
const orbStyle = computed(() => ({
  background: orbColors[form.value.areaId] ?? '#7c6af7'
}))

// ── Actions ───────────────────────────────────────────────────────────
function selectArea(area) {
  form.value.areaId  = area.id
  assessment.value   = {}
}

function toggleMulti(questionId, value) {
  if (!assessment.value[questionId]) assessment.value[questionId] = []
  const arr = assessment.value[questionId]
  const idx = arr.indexOf(value)
  if (idx === -1) arr.push(value)
  else arr.splice(idx, 1)
}

function next() {
  if (step.value < totalSteps) {
    step.value++
    if (step.value === 5) startConfirmAnimation()
  }
}

function prev() {
  if (step.value > 1) step.value--
}

function startConfirmAnimation() {
  confirmedDots.value = 0
  let i = 0
  const iv = setInterval(() => {
    if (i < 7) confirmedDots.value = ++i
    else clearInterval(iv)
  }, 100)
}

async function startNow() {
  submitting.value = true
  await new Promise(r => setTimeout(r, 500))

  emit('complete', {
    areaName:         selectedArea.value?.name ?? form.value.customAreaName,
    areaId:           form.value.areaId,
    areaEmoji:        selectedArea.value?.emoji ?? '🎯',
    behavior:         calculatedFramework.value.description,
    dailyAction:      calculatedFramework.value.weeklyPlan?.[0]?.action ?? '',
    framework:        calculatedFramework.value.name,
    scheduleType:     form.value.schedule.toUpperCase(),
    weeklyPlan:       calculatedFramework.value.weeklyPlan,
    assessmentData:   assessment.value,
    days:             [],
  })

  submitting.value = false
}
</script>

<style scoped>
/* ── Shell ───────────────────────────────────────────────────────────── */
.wizard-shell {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 24px 80px;
  position: relative;
  overflow: hidden;
  font-family: var(--font-display);
}

.bg-orb {
  position: fixed;
  width: 600px; height: 600px;
  border-radius: 50%;
  opacity: 0.07;
  filter: blur(100px);
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  transition: background 1s ease;
}

/* Progress */
.progress-rail {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--border);
  z-index: 100;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #a78bfa);
  transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
}

.step-counter {
  position: fixed;
  top: 18px; right: 24px;
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  z-index: 100;
}
.step-current { color: var(--text-secondary); }
.step-sep     { margin: 0 3px; }

/* Step wrapper */
.step-wrap {
  width: 100%;
  max-width: 580px;
  padding-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Typography */
.step-eyebrow {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
}

.step-heading {
  font-size: clamp(26px, 5vw, 38px);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}
.step-heading em {
  font-style: normal;
  background: linear-gradient(135deg, var(--accent), #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.step-sub {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}

/* Area grid */
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
  position: relative;
  font-family: var(--font-display);
}
.area-card:hover {
  border-color: var(--border-light);
  background: var(--bg-hover);
}
.area-card.selected {
  background: var(--accent-dim);
  border-color: var(--accent);
}

.area-emoji { font-size: 22px; flex-shrink: 0; }
.area-info  { flex: 1; min-width: 0; }
.area-name  { font-size: 13px; font-weight: 700; color: var(--text-primary); }
.area-desc  { font-size: 11px; color: var(--text-muted); margin-top: 2px; line-height: 1.4; }

.area-check {
  font-size: 12px;
  color: var(--accent);
  opacity: 0;
  transition: opacity 0.2s;
}
.area-card.selected .area-check { opacity: 1; }

.custom-area { width: 100%; margin-bottom: 16px; }

/* Inputs */
.wizard-input,
.wizard-textarea {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 11px 14px;
  font-size: 14px;
  color: var(--text-primary);
  font-family: var(--font-display);
  resize: none;
  outline: none;
  transition: border var(--transition), box-shadow var(--transition);
}
.wizard-input:focus,
.wizard-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}
.wizard-input::placeholder,
.wizard-textarea::placeholder { color: var(--text-muted); }

/* Assessment form */
.assessment-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 8px;
}

.assessment-field { display: flex; flex-direction: column; gap: 10px; }

.field-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
}

/* Input with unit prefix */
.input-with-unit { position: relative; }
.input-unit {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  pointer-events: none;
  z-index: 1;
}
.wizard-input.has-unit { padding-left: 30px; }

/* Select chips */
.select-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.select-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  font-family: var(--font-display);
}
.select-chip:hover {
  border-color: var(--border-light);
  color: var(--text-primary);
  background: var(--bg-hover);
}
.select-chip.selected {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--text-primary);
}
.chip-emoji { font-size: 14px; }

/* Range */
.range-wrap { display: flex; flex-direction: column; gap: 8px; }
.wizard-range {
  width: 100%;
  accent-color: var(--accent);
  height: 4px;
  cursor: pointer;
}
.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
}
.range-val {
  color: var(--accent);
  font-weight: 700;
}

/* Framework card */
.framework-card {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 24px;
}

.framework-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.framework-row:last-child { border-bottom: none; }

.fw-left { display: flex; align-items: center; gap: 12px; flex: 1; }
.fw-emoji { font-size: 20px; flex-shrink: 0; }
.fw-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.fw-hint  { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.fw-right { text-align: right; flex-shrink: 0; }
.fw-value { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; }
.fw-pct   { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }

.fw-warning {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: rgba(251, 146, 60, 0.1);
  border-top: 1px solid var(--border);
  padding: 12px 20px;
  font-size: 13px;
  color: #fb923c;
  line-height: 1.5;
}

/* Plan preview */
.plan-preview {
  width: 100%;
  margin-bottom: 8px;
}
.plan-preview-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.plan-week {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.plan-week:last-child { border-bottom: none; }

.plan-week-num {
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  min-width: 48px;
  padding-top: 2px;
}
.plan-week-theme {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 90px;
}
.plan-week-action {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  flex: 1;
}

/* Check-in preview */
.checkin-preview {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 24px;
}
.checkin-preview-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.checkin-q {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}
.checkin-q:last-child { margin-bottom: 0; }
.checkin-q-num {
  font-size: 11px;
  color: var(--accent);
  background: var(--accent-dim);
  border-radius: 50%;
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.checkin-q-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  padding-top: 1px;
}

/* Schedule cards */
.schedule-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-bottom: 8px;
}

.schedule-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
  font-family: var(--font-display);
}
.schedule-card:hover {
  border-color: var(--border-light);
  background: var(--bg-hover);
}
.schedule-card.selected {
  background: var(--accent-dim);
  border-color: var(--accent);
}
.schedule-icon { font-size: 20px; flex-shrink: 0; }
.schedule-name { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.schedule-hint { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.schedule-card .area-check { margin-left: auto; }

/* Summary */
.confirm-step { align-items: center; text-align: center; }
.confirm-step .step-heading { text-align: center; }

.confirm-icon {
  font-size: 56px;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 20px var(--accent-glow));
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

.summary-card {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 24px;
  text-align: left;
}
.summary-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}
.summary-row:last-child { border-bottom: none; }
.summary-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  min-width: 90px;
  padding-top: 3px;
}
.summary-value {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
}

/* Streak preview */
.streak-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  justify-content: center;
}
.streak-dots { display: flex; gap: 7px; }
.streak-dot {
  width: 11px; height: 11px;
  border-radius: 50%;
  background: var(--border);
  transition: background 0.3s, transform 0.3s;
}
.streak-dot.lit {
  background: var(--accent);
  transform: scale(1.2);
  box-shadow: 0 0 8px var(--accent-glow);
}
.streak-label {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
}

/* CTA buttons */
.wizard-cta {
  margin-top: 24px;
  padding: 13px 26px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-display);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition);
  align-self: flex-start;
}
.wizard-cta:hover:not(:disabled) {
  background: #9580ff;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px var(--accent-glow);
}
.wizard-cta:disabled { opacity: 0.35; cursor: not-allowed; }
.cta-arrow { font-size: 15px; }
.cta-large {
  padding: 15px 36px;
  font-size: 15px;
  width: 100%;
  justify-content: center;
}

.wizard-back {
  padding: 11px 20px;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-display);
  cursor: pointer;
  transition: all var(--transition);
}
.wizard-back:hover {
  border-color: var(--border-light);
  color: var(--text-primary);
}

.btn-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  width: 100%;
}
.btn-row .wizard-cta { margin-top: 0; }

.micro-copy {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 14px;
  font-style: italic;
}

/* Spinner */
.spinner-sm {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from { opacity: 0; transform: translateX(28px); }
.slide-leave-to   { opacity: 0; transform: translateX(-28px); }

@media (max-width: 480px) {
  .area-grid { grid-template-columns: 1fr; }
  .step-wrap { padding-top: 60px; }
}
</style>