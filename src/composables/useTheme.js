// composables/useTheme.js
// ─────────────────────────────────────────────────────────────────────
// Shared IST-aware theme composable.
// Import and call useTheme() in EVERY view's <script setup>.
// The first caller initialises the theme and starts the auto-switch
// interval; subsequent callers just get the reactive ref + toggle.
// ─────────────────────────────────────────────────────────────────────

import { ref, onUnmounted } from 'vue'

// Module-level singletons so state is shared across all component instances
const isDark        = ref(false)
let   intervalId    = null
let   initialised   = false

// ── IST helpers ──────────────────────────────────────────────────────
function getISTHour() {
  const now   = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const istMs = utcMs + 5.5 * 3600000   // UTC+5:30
  return new Date(istMs).getHours()
}

function shouldBeDark() {
  const h = getISTHour()
  return h < 6 || h >= 20               // dark: 8 PM – 5:59 AM IST
}

// ── Apply to DOM ─────────────────────────────────────────────────────
function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

// ── Init (runs once on first useTheme() call) ─────────────────────────
function init() {
  if (initialised) return
  initialised = true

  // Honour manual session override, otherwise follow IST schedule
  try {
    const override = sessionStorage.getItem('themeOverride')
    isDark.value = override ? override === 'dark' : shouldBeDark()
  } catch {
    isDark.value = shouldBeDark()
  }

  applyTheme()

  // Re-check every minute; auto-switch at 6 AM / 8 PM IST
  // unless the user has manually overridden for this session
  intervalId = setInterval(() => {
    try { if (sessionStorage.getItem('themeOverride')) return } catch {}
    const next = shouldBeDark()
    if (next !== isDark.value) {
      isDark.value = next
      applyTheme()
    }
  }, 60000)
}

// ── Public composable ─────────────────────────────────────────────────
export function useTheme() {
  // Run init on first use (idempotent)
  init()

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
    try {
      sessionStorage.setItem('themeOverride', isDark.value ? 'dark' : 'light')
    } catch {}
  }

  // Each component that calls useTheme() clears the interval on unmount
  // only if it was the last one — but since isDark is module-level,
  // simply let the interval run for the app lifetime (negligible cost).
  // If you need strict cleanup, track consumer count here.

  return { isDark, toggleTheme }
}   