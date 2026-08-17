<template>
  <div class="landing">

    <!-- ================= NAV ================= -->
    <nav class="nav">
      <router-link to="/" class="nav-brand">
        <span class="brand-mark">◆</span>
        <span class="brand-name">MindTrack</span>
      </router-link>

      <div class="nav-links">
        <a href="#system" class="nav-link">System</a>
        <a href="#product" class="nav-link">Product</a>
        <a href="#faq" class="nav-link">FAQ</a>
        <a href="#owner" class="nav-link">Contact</a>
      </div>

      <div class="nav-actions">
        <router-link :to="loginRoute" class="btn btn-ghost btn-sm">
          {{ authStore.isLoggedIn ? 'Dashboard' : 'Log in' }}
        </router-link>

        <router-link :to="tryMindTrackRoute" class="btn btn-primary btn-sm">
          {{ authStore.isLoggedIn ? 'Open Dashboard' : 'Try MindTrack' }}
        </router-link>
      </div>
    </nav>

    <!-- ================= HERO ================= -->
    <header class="hero">
      <div class="hero-glow" aria-hidden="true"></div>

      <div class="hero-grid">

        <div class="hero-copy">
          <div class="hero-eyebrow mono">
            PERSONAL PRODUCTIVITY SYSTEM
          </div>

          <h1 class="hero-title">
            Build the discipline
            <br />
            <span class="accent-text">behind your goals.</span>
          </h1>

          <p class="hero-sub">
            Plan your day around the work that actually matters. Turn goals
            into actions you can consistently complete, and see whether
            your consistency is improving week after week.
          </p>

          <div class="hero-cta">
            <router-link :to="tryMindTrackRoute" class="btn btn-primary btn-lg">
              {{ authStore.isLoggedIn ? 'Open your dashboard →' : 'Start your first journey →' }}
            </router-link>

            <router-link :to="loginRoute" class="btn btn-ghost btn-lg">
              {{ authStore.isLoggedIn ? 'Continue using MindTrack' : 'I already have an account' }}
            </router-link>
          </div>

          <div class="hero-proof mono">
            NO CREDIT CARD · SET UP IN 2 MINUTES
          </div>
        </div>

        <div class="hero-visual" id="product">
          <!-- Floating badge cards -->
          <div class="float-card float-card--streak">
            <span class="float-emoji">🔥</span>
            <div>
              <div class="float-value">12</div>
              <div class="float-label">day streak</div>
            </div>
          </div>

          <div class="float-card float-card--consistency">
            <span class="float-emoji float-emoji--up">↗</span>
            <div>
              <div class="float-value">+14%</div>
              <div class="float-label">consistency</div>
            </div>
          </div>

          <div class="float-card float-card--goal">
            <span class="float-emoji">✓</span>
            <div class="float-label float-label--tight">Daily goal completed</div>
          </div>

          <!-- Main product preview -->
          <div class="app-preview">
            <div class="app-preview-bar">
              <div class="app-preview-brand">
                <span class="brand-mark brand-mark--sm">◆</span>
                MindTrack
              </div>
              <div class="app-preview-icons">
                <span class="app-icon">🔔</span>
                <span class="app-avatar">AB</span>
              </div>
            </div>

            <div class="app-preview-body">
              <div class="app-greeting">
                <div class="app-greeting-title">Good morning 👋</div>
                <div class="app-greeting-sub">Here's your progress for today</div>
              </div>

              <div class="stat-row">
                <div class="stat-card">
                  <div class="stat-value">78%</div>
                  <div class="stat-label mono">PROGRESS</div>
                  <div class="stat-bar"><div class="stat-bar-fill" style="width: 78%"></div></div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">3h 24m</div>
                  <div class="stat-label mono">FOCUS</div>
                  <div class="stat-bar"><div class="stat-bar-fill stat-bar-fill--blue" style="width: 60%"></div></div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">🔥 12</div>
                  <div class="stat-label mono">STREAK</div>
                  <div class="stat-bar"><div class="stat-bar-fill stat-bar-fill--orange" style="width: 90%"></div></div>
                </div>
              </div>

              <div class="plan-block">
                <div class="plan-title">Today's Plan</div>

                <div class="plan-row plan-row--done">
                  <span class="plan-check">✓</span>
                  <span class="plan-name">Deep Work</span>
                  <span class="plan-time mono">08:00</span>
                </div>
                <div class="plan-row plan-row--done">
                  <span class="plan-check">✓</span>
                  <span class="plan-name">DSA Practice</span>
                  <span class="plan-time mono">10:30</span>
                </div>
                <div class="plan-row">
                  <span class="plan-check plan-check--pending">○</span>
                  <span class="plan-name">Project Work</span>
                  <span class="plan-time mono">15:00</span>
                </div>
              </div>

              <div class="weekly-block">
                <div class="plan-title">Weekly Consistency</div>
                <div class="weekly-bars">
                  <span class="bar" style="height: 30%"></span>
                  <span class="bar" style="height: 55%"></span>
                  <span class="bar" style="height: 68%"></span>
                  <span class="bar" style="height: 42%"></span>
                  <span class="bar" style="height: 80%"></span>
                  <span class="bar" style="height: 65%"></span>
                  <span class="bar bar--today" style="height: 92%"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>

    <!-- ================= SYSTEM LOOP (signature element) ================= -->
    <section class="section loop-section" id="system">
      <div class="section-head">
        <div class="section-eyebrow mono">THE MINDTRACK LOOP</div>
        <h2>A system you check in on, not a list you abandon</h2>
        <p class="section-sub">
          Every goal moves through the same loop, so improvement compounds
          instead of resetting every Monday.
        </p>
      </div>

      <div class="loop">
        <div
          v-for="(step, i) in loopSteps"
          :key="step.title"
          class="loop-step"
          :class="{ 'loop-step--raised': i % 2 === 1 }"
        >
          <div class="loop-node">
            <span class="loop-index mono">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="loop-icon">{{ step.icon }}</span>
          </div>
          <div class="loop-body">
            <div class="loop-title">{{ step.title }}</div>
            <div class="loop-example">{{ step.example }}</div>
          </div>
          <div v-if="i < loopSteps.length - 1" class="loop-arrow" aria-hidden="true">→</div>
        </div>

        <div class="loop-repeat">
          <span class="loop-repeat-arrow" aria-hidden="true">↺</span>
          <span class="mono">REPEATS EVERY WEEK</span>
        </div>
      </div>
    </section>

    <!-- ================= FEATURES ================= -->
    <section class="section">
      <div class="section-head">
        <div class="section-eyebrow mono">HOW IT WORKS</div>
        <h2>Everything you need to build a better system</h2>
      </div>

      <div class="feature-grid">
        <div class="feature-card card" v-for="f in features" :key="f.title">
          <div class="feature-icon">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ================= ALL-IN-ONE ================= -->
    <section class="section section-alt">
      <div class="section-head">
        <div class="section-eyebrow mono">EVERYTHING IN ONE PLACE</div>
        <h2>Your personal productivity system</h2>
        <p class="section-sub">Understand where your attention is going, and build a system you can actually stick with.</p>
      </div>

      <div class="pill-row">
        <span class="pill" v-for="p in pills" :key="p">{{ p }}</span>
      </div>
    </section>

    <!-- ================= FAQ ================= -->
    <section class="section faq-section" id="faq">
      <div class="section-head">
        <div class="section-eyebrow mono">QUESTIONS</div>
        <h2>Good to know</h2>
      </div>

      <div class="faq-list">
        <div
          v-for="(item, i) in faqs"
          :key="item.q"
          class="faq-item"
          :class="{ 'faq-item--open': openFaq === i }"
        >
          <button class="faq-question" @click="toggleFaq(i)">
            <span>{{ item.q }}</span>
            <span class="faq-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="faq-answer-wrap">
            <p class="faq-answer">{{ item.a }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= OWNER / CONTACT (FOUNDER SECTION) ================= -->
    <section class="section owner-section" id="owner">
      <div class="owner-card">
        <div class="owner-glow" aria-hidden="true"></div>

        <div class="owner-main">
          <div class="owner-avatar">AC</div>

          <div class="owner-text">
            <div class="owner-eyebrow mono">BUILT BY THE PERSON BEHIND MINDTRACK</div>
            <h2 class="owner-name">Abhishek Chauthe</h2>
            <div class="owner-tagline">Founder &amp; Creator of MindTrack · Software Engineer</div>

            <p class="owner-role">
              MindTrack is an independent product — conceptualized, designed, and
              built end-to-end by Abhishek to help people build real focus,
              discipline, and consistent habits around the goals that matter to them.
            </p>

            <div class="owner-location mono">
              📍 Pune, Maharashtra, India &nbsp;·&nbsp; Built with ❤️
            </div>
          </div>
        </div>

        <div class="owner-contact">
          <a href="mailto:chautheabhishek@gmail.com" class="owner-link" title="Email">
            <svg class="owner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 6-10 7L2 6" />
            </svg>
            <span>
              <span class="owner-link-label mono">EMAIL</span>
              <span class="owner-link-value">chautheabhishek@gmail.com</span>
            </span>
          </a>

          <a href="https://github.com/abhichauthe" target="_blank" rel="noopener noreferrer" class="owner-link" title="GitHub">
            <svg class="owner-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.28 7.78 10.78.57.1.78-.25.78-.55v-1.94c-3.16.69-3.83-1.52-3.83-1.52-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.65 1.24 3.3.95.1-.73.4-1.24.72-1.53-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.46.11-3.03 0 0 .96-.31 3.14 1.16a10.9 10.9 0 0 1 5.72 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.74.11 3.03.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.35.77 1.04.77 2.1v3.11c0 .3.21.65.79.55A11.26 11.26 0 0 0 23.25 11.75C23.25 5.48 18.27.5 12 .5Z" />
            </svg>
            <span>
              <span class="owner-link-label mono">GITHUB</span>
              <span class="owner-link-value">github.com/abhichauthe</span>
            </span>
          </a>

          <a href="https://leetcode.com/u/chautheabhishek/" target="_blank" rel="noopener noreferrer" class="owner-link" title="LeetCode">
            <svg class="owner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
            </svg>
            <span>
              <span class="owner-link-label mono">LEETCODE</span>
              <span class="owner-link-value">chautheabhishek</span>
            </span>
          </a>

          <a href="https://linkedin.com/in/abhishek-chauthe" target="_blank" rel="noopener noreferrer" class="owner-link" title="LinkedIn">
            <svg class="owner-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.11 20.45H3.56V9h3.55v11.45Z" />
            </svg>
            <span>
              <span class="owner-link-label mono">LINKEDIN</span>
              <span class="owner-link-value">abhishek-chauthe</span>
            </span>
          </a>
        </div>
      </div>
    </section>

    <!-- ================= FINAL CTA ================= -->
    <section class="cta-section">
      <h2>Ready to take control of your progress?</h2>
      <p class="text-secondary">Build your system. Stay consistent. Track your progress.</p>

      <router-link :to="tryMindTrackRoute" class="btn btn-primary btn-lg">
        {{ authStore.isLoggedIn ? 'Go to Dashboard →' : 'Try MindTrack →' }}
      </router-link>
    </section>

    <!-- ================= FOOTER ================= -->
    <footer class="footer">
      <span class="mono text-muted">MindTrack</span>
      <span class="text-muted">
        Built for people who want to improve consistently — by
        <a href="#owner" class="footer-owner-link">Abhishek Chauthe</a>
      </span>
    </footer>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const tryMindTrackRoute = computed(() => (authStore.isLoggedIn ? '/dashboard' : '/register'))
const loginRoute = computed(() => (authStore.isLoggedIn ? '/dashboard' : '/login'))

const loopSteps = [
  { icon: '🎯', title: 'Goal', example: '"Prepare for technical interviews"' },
  { icon: '📋', title: 'Plan', example: 'DSA · Java · System Design' },
  { icon: '⏱️', title: 'Focus', example: 'Deep Work — 45:32 remaining' },
  { icon: '✅', title: 'Check-in', example: 'Did you complete today\'s goal?' },
  { icon: '📈', title: 'Reflect', example: 'Weekly consistency: 84%' },
  { icon: '🔧', title: 'Improve', example: '+15 min focused study next week' },
]

const features = [
  { icon: '📅', title: 'Plan your journey', desc: 'Create structured plans and organize what you want to achieve.' },
  { icon: '🎯', title: 'Stay focused', desc: 'Use focus sessions and build better concentration habits.' },
  { icon: '📔', title: 'Reflect daily', desc: 'Capture your thoughts, progress, and lessons through journaling.' },
  { icon: '📈', title: 'Track progress', desc: 'Use analytics, streaks, reviews, and gamification to stay consistent.' },
]

const pills = [
  '🎯 Focus', '📔 Journal', '📅 Timetable', '🔥 Discipline',
  '📋 Planning', '🏆 Gamification', '📊 Analytics', '🔔 Notifications', '📈 Weekly Review',
]

const faqs = [
  { q: 'Do I need to plan every single day?', a: 'No. Set up your goals and a rough weekly rhythm once, then MindTrack surfaces what to focus on each day. You can always adjust as things change.' },
  { q: 'What happens if I miss a day?', a: 'Your streak resets, but your history and weekly trends don\'t. MindTrack is built around consistency over time, not a perfect record.' },
  { q: 'Can I use MindTrack for more than one goal at a time?', a: 'Yes. Most people run a few goals in parallel — for example a study plan alongside a fitness or reading goal — each with its own plan and check-ins.' },
  { q: 'Is there a free plan?', a: 'You can create an account and start using MindTrack\'s core planning, focus, and tracking tools at no cost, no credit card required.' },
]

const openFaq = ref(0)
function toggleFaq(i) {
  openFaq.value = openFaq.value === i ? -1 : i
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.landing {
  min-height: 100vh;
  color: var(--text-primary, #e6e6e6);
  background: var(--bg, #0b0b0f);
  overflow-x: hidden;
}

.mono {
  font-family: 'SFMono-Regular', ui-monospace, Menlo, Consolas, monospace;
}

.text-secondary { color: var(--text-secondary, #a3a3af); }
.text-muted { color: var(--text-muted, #6b6b76); }

.card {
  background: var(--bg-hover, #131318);
  border: 1px solid var(--border, #1f1f27);
  border-radius: 14px;
}

/* ================= NAV ================= */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 40px;
  border-bottom: 1px solid var(--border, #1f1f27);
  position: sticky;
  top: 0;
  background: rgba(11, 11, 15, 0.82);
  backdrop-filter: blur(12px);
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
  letter-spacing: -0.01em;
}

.brand-mark {
  color: var(--accent, #7c6af7);
  filter: drop-shadow(0 0 8px rgba(124, 106, 247, 0.5));
}

.brand-mark--sm { font-size: 13px; }

.nav-links {
  display: flex;
  gap: 28px;
}

.nav-link {
  font-size: 13.5px;
  color: var(--text-secondary, #a3a3af);
  text-decoration: none;
  position: relative;
  padding-bottom: 2px;
  transition: color 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 1px;
  background: var(--accent, #7c6af7);
  transition: width 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary, #e6e6e6);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  gap: 10px;
}

/* ================= HERO ================= */
.hero {
  position: relative;
  padding: 88px 40px 40px;
  max-width: 1280px;
  margin: 0 auto;
}

.hero-glow {
  position: absolute;
  top: -140px;
  right: -120px;
  width: 620px;
  height: 620px;
  background: radial-gradient(circle, rgba(124, 106, 247, 0.22) 0%, rgba(124, 106, 247, 0) 70%);
  pointer-events: none;
  z-index: 0;
}

.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}

.hero-copy {
  max-width: 480px;
}

.hero-eyebrow {
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--accent, #7c6af7);
  margin-bottom: 20px;
}

.hero-title {
  font-size: 50px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 22px;
}

.accent-text {
  background: linear-gradient(90deg, #a396ff, #7c6af7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-sub {
  font-size: 16.5px;
  line-height: 1.65;
  color: var(--text-secondary, #a3a3af);
  margin-bottom: 32px;
}

.hero-cta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.hero-proof {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--text-muted, #6b6b76);
}

/* Product visual */
.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}

.app-preview {
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--border, #1f1f27);
  border-radius: 18px;
  background: linear-gradient(180deg, #16161d 0%, #0f0f14 100%);
  box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(124, 106, 247, 0.06);
  overflow: hidden;
  transform: perspective(1400px) rotateY(-4deg) rotateX(2deg);
  transition: transform 0.4s ease;
}

.app-preview:hover {
  transform: perspective(1400px) rotateY(-1deg) rotateX(0.5deg);
}

.app-preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border, #1f1f27);
}

.app-preview-brand {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 13px;
}

.app-preview-icons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-icon { font-size: 13px; opacity: 0.8; }

.app-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent, #7c6af7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}

.app-preview-body {
  padding: 20px;
}

.app-greeting-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 2px;
}

.app-greeting-sub {
  font-size: 12.5px;
  color: var(--text-muted, #6b6b76);
  margin-bottom: 18px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border, #1f1f27);
  border-radius: 10px;
  padding: 10px 10px 12px;
}

.stat-value {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 9px;
  letter-spacing: 0.06em;
  color: var(--text-muted, #6b6b76);
  margin-bottom: 8px;
}

.stat-bar {
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: #34d399;
  animation: growBar 1.1s ease-out both;
}

.stat-bar-fill--blue { background: #60a5fa; }
.stat-bar-fill--orange { background: #fb923c; }

@keyframes growBar {
  from { width: 0% !important; }
}

.plan-block { margin-bottom: 20px; }

.plan-title {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-secondary, #a3a3af);
  margin-bottom: 10px;
}

.plan-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.plan-row:last-child { border-bottom: none; }

.plan-check {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  font-size: 10px;
  flex-shrink: 0;
}

.plan-check--pending {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted, #6b6b76);
}

.plan-row--done .plan-name {
  color: var(--text-secondary, #a3a3af);
  text-decoration: line-through;
  text-decoration-color: rgba(163, 163, 175, 0.4);
}

.plan-name { flex: 1; }
.plan-time { font-size: 11px; color: var(--text-muted, #6b6b76); }

.weekly-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 46px;
}

.bar {
  flex: 1;
  background: rgba(124, 106, 247, 0.28);
  border-radius: 3px 3px 0 0;
  transition: transform 0.2s ease;
}

.bar--today { background: var(--accent, #7c6af7); }
.bar:hover { transform: scaleY(1.06); }

/* Floating badge cards */
.float-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(19, 19, 24, 0.9);
  border: 1px solid var(--border, #1f1f27);
  backdrop-filter: blur(8px);
  box-shadow: 0 14px 30px -12px rgba(0, 0, 0, 0.55);
  z-index: 2;
  animation: floaty 5s ease-in-out infinite;
}

.float-card--streak {
  top: 6%;
  left: -4%;
  animation-delay: 0s;
}

.float-card--consistency {
  bottom: 20%;
  right: -8%;
  animation-delay: 1.4s;
}

.float-card--goal {
  bottom: -4%;
  left: 10%;
  animation-delay: 2.6s;
}

.float-emoji { font-size: 18px; }
.float-emoji--up { color: #34d399; font-size: 16px; font-weight: 800; }

.float-value { font-size: 14px; font-weight: 800; line-height: 1.1; }
.float-label { font-size: 10.5px; color: var(--text-muted, #6b6b76); }
.float-label--tight { font-size: 12px; color: var(--text-primary, #e6e6e6); font-weight: 600; }

@keyframes floaty {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-9px); }
}

/* ================= LOOP (signature) ================= */
.loop-section {
  padding-top: 90px;
}

.section-sub {
  max-width: 520px;
  margin: 10px auto 0;
  font-size: 14.5px;
  color: var(--text-secondary, #a3a3af);
  line-height: 1.6;
}

.loop {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0;
  max-width: 1120px;
  margin: 0 auto;
  padding-top: 24px;
}

.loop-step {
  display: flex;
  align-items: center;
  gap: 14px;
}

.loop-step--raised {
  transform: translateY(-18px);
}

.loop-node {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: var(--bg-hover, #131318);
  border: 1px solid var(--border, #1f1f27);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.loop-step:hover .loop-node {
  transform: translateY(-4px);
  border-color: rgba(124, 106, 247, 0.5);
}

.loop-index {
  font-size: 8px;
  color: var(--text-muted, #6b6b76);
}

.loop-icon { font-size: 18px; }

.loop-body {
  max-width: 130px;
}

.loop-title {
  font-size: 13.5px;
  font-weight: 700;
  margin-bottom: 2px;
}

.loop-example {
  font-size: 11px;
  color: var(--text-muted, #6b6b76);
  line-height: 1.4;
}

.loop-arrow {
  color: var(--text-muted, #6b6b76);
  font-size: 14px;
  margin: 0 12px;
}

.loop-repeat {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px;
  padding: 8px 14px;
  border: 1px dashed rgba(124, 106, 247, 0.4);
  border-radius: 999px;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--accent, #7c6af7);
}

.loop-repeat-arrow {
  font-size: 14px;
  animation: spin 3.5s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ================= SECTIONS ================= */
.section {
  padding: 80px 40px;
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
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--accent, #7c6af7);
  margin-bottom: 10px;
}

.section-head h2 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

/* Feature cards */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 26px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(124, 106, 247, 0.4);
}

.feature-icon { font-size: 26px; margin-bottom: 14px; }
.feature-card h3 { font-size: 15.5px; margin-bottom: 8px; }
.feature-card p { font-size: 13px; color: var(--text-secondary, #a3a3af); line-height: 1.6; }

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
  font-size: 13.5px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--border, #1f1f27);
  background: var(--bg, #0b0b0f);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.pill:hover {
  border-color: rgba(124, 106, 247, 0.5);
  transform: translateY(-2px);
}

/* FAQ */
.faq-list {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.faq-item {
  border: 1px solid var(--border, #1f1f27);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-hover, #131318);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: transparent;
  border: none;
  color: var(--text-primary, #e6e6e6);
  font-size: 14.5px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.faq-chevron {
  font-size: 16px;
  color: var(--text-muted, #6b6b76);
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.faq-item--open .faq-chevron {
  transform: rotate(180deg);
  color: var(--accent, #7c6af7);
}

.faq-answer-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.faq-item--open .faq-answer-wrap {
  grid-template-rows: 1fr;
}

.faq-answer {
  overflow: hidden;
  min-height: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-secondary, #a3a3af);
  padding: 0 18px;
}

.faq-item--open .faq-answer {
  padding: 0 18px 16px;
}

/* ================= OWNER / FOUNDER SECTION ================= */
.owner-card {
  position: relative;
  max-width: 880px;
  margin: 0 auto;
  padding: 44px;
  border-radius: 20px;
  background: var(--bg-hover, #131318);
  border: 1px solid var(--border, #1f1f27);
  overflow: hidden;
}

.owner-glow {
  position: absolute;
  top: -100px;
  left: -80px;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(124, 106, 247, 0.18) 0%, rgba(124, 106, 247, 0) 70%);
  pointer-events: none;
}

.owner-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 22px;
  margin-bottom: 28px;
}

.owner-avatar {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, #a396ff, #7c6af7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 12px 26px -10px rgba(124, 106, 247, 0.6);
}

.owner-eyebrow {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--accent, #7c6af7);
  margin-bottom: 8px;
}

.owner-name {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}

.owner-tagline {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent, #7c6af7);
  margin-bottom: 12px;
}

.owner-role {
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-secondary, #a3a3af);
  max-width: 560px;
}

.owner-location {
  margin-top: 14px;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--text-muted, #6b6b76);
}

.owner-contact {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.owner-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-radius: 12px;
  border: 1px solid var(--border, #1f1f27);
  background: var(--bg, #0b0b0f);
  text-decoration: none;
  color: var(--text-primary, #e6e6e6);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.owner-link:hover {
  border-color: rgba(124, 106, 247, 0.5);
  transform: translateY(-2px);
}

.owner-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--accent, #7c6af7);
}

.owner-link-label {
  display: block;
  font-size: 9.5px;
  letter-spacing: 0.1em;
  color: var(--text-muted, #6b6b76);
  margin-bottom: 2px;
}

.owner-link-value {
  display: block;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .owner-card { padding: 28px; }
  .owner-main { flex-direction: column; gap: 16px; }
  .owner-contact { grid-template-columns: 1fr; }
}

/* CTA */
.cta-section {
  text-align: center;
  padding: 100px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.cta-section h2 { font-size: 30px; font-weight: 800; }
.cta-section .btn { margin-top: 16px; }

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

.footer-owner-link {
  color: var(--accent, #7c6af7);
  text-decoration: none;
}

.footer-owner-link:hover {
  text-decoration: underline;
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
  transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
}

.btn-sm { padding: 8px 14px; font-size: 13px; }
.btn-lg { padding: 13px 24px; font-size: 15px; }

.btn-primary {
  background: var(--accent, #7c6af7);
  color: #ffffff;
  box-shadow: 0 10px 24px -10px rgba(124, 106, 247, 0.6);
}

.btn-primary:hover {
  opacity: 0.92;
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

/* ================= RESPONSIVE ================= */
@media (max-width: 980px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 60px;
  }
  .hero-copy { max-width: 100%; text-align: center; }
  .hero-cta { justify-content: center; }
  .hero-visual { padding-top: 20px; }
  .loop-step--raised { transform: none; }
  .float-card--streak { left: 2%; }
  .float-card--consistency { right: 2%; }
}

@media (max-width: 640px) {
  .nav-links { display: none; }
  .nav, .hero, .section, .footer { padding-left: 20px; padding-right: 20px; }
  .hero { padding-top: 56px; }
  .hero-title { font-size: 32px; }
  .hero-sub { font-size: 15px; }
  .nav-actions { gap: 6px; }
  .btn-sm { padding: 7px 10px; }
  .footer { flex-direction: column; align-items: flex-start; }
  .loop { flex-direction: column; gap: 22px; }
  .loop-step { flex-direction: column; text-align: center; }
  .loop-arrow { display: none; }
  .loop-repeat { margin-left: 0; margin-top: 10px; }
  .float-card { position: static; margin-bottom: 10px; animation: none; }
  .app-preview { transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .float-card, .loop-repeat-arrow, .stat-bar-fill { animation: none !important; }
  .app-preview { transform: none !important; }
}
</style>
