<template>
  <div class="landing">

    <!-- Navigation -->
    <nav class="nav">
      <router-link to="/" class="nav-brand">
        <span class="brand-mark">◆</span>
        <span class="brand-name">MindTrack</span>
      </router-link>

      <div class="nav-actions">
        <router-link
          :to="loginRoute"
          class="btn btn-ghost btn-sm"
        >
          {{ authStore.isLoggedIn ? 'Dashboard' : 'Log in' }}
        </router-link>

        <router-link
          :to="tryMindTrackRoute"
          class="btn btn-primary btn-sm"
        >
          {{ authStore.isLoggedIn ? 'Open Dashboard' : 'Try MindTrack' }}
        </router-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-eyebrow mono">
        DAILY DISCIPLINE, MEASURED
      </div>

      <h1 class="hero-title">
        Discipline isn't motivation.
        <br />
        <span class="accent-text">
          It's a system you check in on.
        </span>
      </h1>

      <p class="hero-sub">
        MindTrack helps you turn vague goals into a structured daily
        system. Plan your goals, build habits, stay focused, track
        progress, and improve consistently.
      </p>

      <div class="hero-cta">
        <router-link
          :to="tryMindTrackRoute"
          class="btn btn-primary btn-lg"
        >
          {{
            authStore.isLoggedIn
              ? 'Open your dashboard →'
              : 'Start your first journey →'
          }}
        </router-link>

        <router-link
          :to="loginRoute"
          class="btn btn-ghost btn-lg"
        >
          {{
            authStore.isLoggedIn
              ? 'Continue using MindTrack'
              : 'I already have an account'
          }}
        </router-link>
      </div>

      <!-- Application Preview -->
      <div class="hero-preview card">

        <div class="preview-header">
          <span class="preview-emoji">🎯</span>

          <div>
            <div class="preview-area mono">
              TODAY'S FOCUS
            </div>

            <div class="preview-badge">
              ACTIVE
            </div>
          </div>
        </div>

        <div class="preview-week">
          <div class="preview-theme">
            Build consistency, one day at a time
          </div>

          <div class="preview-action">
            Complete your habits, stay focused, and review your progress.
          </div>
        </div>

        <div class="preview-checkin">
          <span>✓</span>
          Daily progress check-in
          <span class="arrow">→</span>
        </div>

      </div>
    </header>

    <!-- Features -->
    <section class="section">

      <div class="section-head">
        <div class="section-eyebrow mono">
          HOW IT WORKS
        </div>

        <h2>
          Everything you need to build a better system
        </h2>
      </div>

      <div class="feature-grid">

        <div class="feature-card card">
          <div class="feature-icon">📅</div>

          <h3>Plan your journey</h3>

          <p>
            Create structured plans and organize what you want to achieve.
          </p>
        </div>

        <div class="feature-card card">
          <div class="feature-icon">🎯</div>

          <h3>Stay focused</h3>

          <p>
            Use focus sessions and build better concentration habits.
          </p>
        </div>

        <div class="feature-card card">
          <div class="feature-icon">📔</div>

          <h3>Reflect daily</h3>

          <p>
            Capture your thoughts, progress, and lessons through journaling.
          </p>
        </div>

        <div class="feature-card card">
          <div class="feature-icon">📈</div>

          <h3>Track progress</h3>

          <p>
            Use analytics, streaks, reviews, and gamification to stay
            consistent.
          </p>
        </div>

      </div>
    </section>

    <!-- MindTrack Features -->
    <section class="section section-alt">

      <div class="section-head">
        <div class="section-eyebrow mono">
          EVERYTHING IN ONE PLACE
        </div>

        <h2>
          Your personal productivity system
        </h2>
      </div>

      <div class="pill-row">
        <span class="pill">🎯 Focus</span>
        <span class="pill">📔 Journal</span>
        <span class="pill">📅 Timetable</span>
        <span class="pill">🔥 Discipline</span>
        <span class="pill">📋 Planning</span>
        <span class="pill">🏆 Gamification</span>
        <span class="pill">📊 Analytics</span>
        <span class="pill">🔔 Notifications</span>
        <span class="pill">📈 Weekly Review</span>
      </div>

    </section>

    <!-- Final CTA -->
    <section class="cta-section">

      <h2>
        Ready to take control of your progress?
      </h2>

      <p class="text-secondary">
        Build your system. Stay consistent. Track your progress.
      </p>

      <router-link
        :to="tryMindTrackRoute"
        class="btn btn-primary btn-lg"
      >
        {{
          authStore.isLoggedIn
            ? 'Go to Dashboard →'
            : 'Try MindTrack →'
        }}
      </router-link>

    </section>

    <!-- Footer -->
    <footer class="footer">

      <span class="mono text-muted">
        MindTrack
      </span>

      <span class="text-muted">
        Built for people who want to improve consistently.
      </span>

    </footer>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const tryMindTrackRoute = computed(() => {
  return authStore.isLoggedIn
    ? '/dashboard'
    : '/register'
})

const loginRoute = computed(() => {
  return authStore.isLoggedIn
    ? '/dashboard'
    : '/login'
})
</script>

<style scoped>
.landing {
  min-height: 100vh;
  color: var(--text-primary, #e6e6e6);
  background: var(--bg, #0b0b0f);
}

/* Navigation */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  border-bottom: 1px solid var(--border, #1f1f27);
  position: sticky;
  top: 0;
  background: rgba(11, 11, 15, 0.9);
  backdrop-filter: blur(10px);
  z-index: 50;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 17px;
  text-decoration: none;
  color: inherit;
}

.brand-mark {
  color: var(--accent, #7c6af7);
}

.nav-actions {
  display: flex;
  gap: 10px;
}

/* Hero */
.hero {
  padding: 96px 40px 64px;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-eyebrow,
.section-eyebrow {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--accent, #7c6af7);
}

.hero-eyebrow {
  margin-bottom: 18px;
}

.hero-title {
  font-size: 48px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 20px;
}

.accent-text {
  color: var(--accent, #7c6af7);
}

.hero-sub {
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary, #a3a3af);
  max-width: 600px;
  margin-bottom: 32px;
}

.hero-cta {
  display: flex;
  gap: 14px;
  margin-bottom: 56px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Preview */
.hero-preview {
  width: 100%;
  max-width: 420px;
  padding: 22px;
  text-align: left;
  border: 1px solid var(--border, #1f1f27);
  border-radius: 12px;
  background: var(--bg-hover, #131318);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.preview-emoji {
  font-size: 28px;
}

.preview-area {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--text-muted, #6b6b76);
  margin-bottom: 4px;
}

.preview-badge {
  display: inline-block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}

.preview-week {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border, #1f1f27);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
}

.preview-theme {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent, #7c6af7);
  margin-bottom: 6px;
}

.preview-action {
  font-size: 13px;
  color: var(--text-secondary, #a3a3af);
  line-height: 1.5;
}

.preview-checkin {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  background: rgba(52, 211, 153, 0.15);
  border-radius: 10px;
  color: #34d399;
  font-size: 13px;
  font-weight: 600;
}

.arrow {
  margin-left: auto;
}

/* Sections */
.section {
  padding: 72px 40px;
  max-width: 1100px;
  margin: 0 auto;
}

.section-alt {
  max-width: none;
  background: var(--bg-hover, #131318);
}

.section-head {
  text-align: center;
  margin-bottom: 44px;
}

.section-eyebrow {
  margin-bottom: 10px;
}

.section-head h2 {
  font-size: 30px;
  font-weight: 800;
}

/* Feature Cards */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 24px;
  border: 1px solid var(--border, #1f1f27);
  border-radius: 12px;
}

.feature-icon {
  font-size: 28px;
  margin-bottom: 12px;
}

.feature-card h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 13px;
  color: var(--text-secondary, #a3a3af);
  line-height: 1.6;
}

/* Pills */
.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
}

.pill {
  font-size: 14px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--border, #1f1f27);
  background: var(--bg, #0b0b0f);
}

/* CTA */
.cta-section {
  text-align: center;
  padding: 96px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.cta-section h2 {
  font-size: 30px;
  font-weight: 800;
}

.cta-section .btn {
  margin-top: 16px;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  border-top: 1px solid var(--border, #1f1f27);
  font-size: 13px;
  flex-wrap: wrap;
  gap: 10px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: 0.2s ease;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 13px;
}

.btn-lg {
  padding: 13px 24px;
  font-size: 15px;
}

.btn-primary {
  background: var(--accent, #7c6af7);
  color: #ffffff;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary, #a3a3af);
  border-color: var(--border, #1f1f27);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.04);
}

/* Mobile */
@media (max-width: 640px) {
  .nav,
  .hero,
  .section,
  .footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .hero {
    padding-top: 64px;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-sub {
    font-size: 15px;
  }

  .nav-actions {
    gap: 6px;
  }

  .btn-sm {
    padding: 7px 10px;
  }

  .footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
