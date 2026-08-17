<template>
  <div class="landing">
    <!-- Nav -->
    <nav class="nav">
      <div class="nav-brand">
        <span class="brand-mark">◆</span>
        <span class="brand-name">MindTrack</span>
      </div>
      <div class="nav-actions">
        <router-link to="/login" class="btn btn-ghost btn-sm">Log in</router-link>
        <router-link to="/register" class="btn btn-primary btn-sm">Try MindTrack</router-link>
      </div>
    </nav>

    <!-- Hero -->
    <header class="hero">
      <div class="hero-eyebrow mono">DAILY DISCIPLINE, MEASURED</div>
      <h1 class="hero-title">
        Discipline isn't motivation.<br />
        <span class="accent-text">It's a system you check in on.</span>
      </h1>
      <p class="hero-sub">
        MindTrack turns vague goals — save money, resist urges, focus better —
        into a daily loop: a plan, a check-in, and a streak you can see.
      </p>
      <div class="hero-cta">
        <router-link to="/register" class="btn btn-primary btn-lg">
          Start your first journey →
        </router-link>
        <router-link to="/login" class="btn btn-ghost btn-lg">I already have an account</router-link>
      </div>

      <!-- Live preview card, echoes the real dashboard card -->
      <div class="hero-preview card">
        <div class="preview-header">
          <span class="preview-emoji">🎯</span>
          <div>
            <div class="preview-area mono">MONEY</div>
            <div class="preview-badge">ACTIVE</div>
          </div>
        </div>
        <div class="preview-week">
          <div class="preview-theme">Week 2 · Track before you spend</div>
          <div class="preview-action">Log every expense within an hour of spending it.</div>
        </div>
        <div class="preview-checkin">
          <span>✓</span> Daily check-in <span class="arrow">→</span>
        </div>
      </div>
    </header>

    <!-- Features -->
    <section class="section">
      <div class="section-head">
        <div class="section-eyebrow mono">HOW IT WORKS</div>
        <h2>One loop, applied to whatever you're building</h2>
      </div>
      <div class="feature-grid">
        <div class="feature-card card">
          <div class="feature-icon">🧭</div>
          <h3>Pick an area</h3>
          <p>Money, focus, relationships, addiction, or something custom. Each one gets its own framework.</p>
        </div>
        <div class="feature-card card">
          <div class="feature-icon">📋</div>
          <h3>Get a real plan</h3>
          <p>A week-by-week plan built for your situation, not a generic checklist.</p>
        </div>
        <div class="feature-card card">
          <div class="feature-icon">✓</div>
          <h3>Check in daily</h3>
          <p>Two or three quick questions. Yes/no, a number, or a rating — under 30 seconds.</p>
        </div>
        <div class="feature-card card">
          <div class="feature-icon">📈</div>
          <h3>See it add up</h3>
          <p>Streaks, weekly reviews, and gamification that reward consistency, not intensity.</p>
        </div>
      </div>
    </section>

    <!-- Areas -->
    <section class="section section-alt">
      <div class="section-head">
        <div class="section-eyebrow mono">BUILT FOR</div>
        <h2>Discipline, in whatever shape you need it</h2>
      </div>
      <div class="pill-row">
        <span class="pill">💰 Money</span>
        <span class="pill">🎯 Urges &amp; Habits</span>
        <span class="pill">❤️ Relationships</span>
        <span class="pill">🚫 Addiction</span>
        <span class="pill">🧠 Focus &amp; Desire</span>
        <span class="pill">⚙️ Custom</span>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="cta-section">
      <h2>Your next check-in is one click away.</h2>
      <p class="text-secondary">Free to start. No credit card. Just a plan and a streak.</p>
      <router-link to="/register" class="btn btn-primary btn-lg">Try MindTrack →</router-link>
    </section>

    <footer class="footer">
      <span class="mono text-muted">MindTrack</span>
      <span class="text-muted">Built for people who show up daily, not just when motivated.</span>
    </footer>
  </div>
</template>

<script setup>
// Pure presentational landing page — no store dependencies, safe to route
// to publicly without auth.
</script>

<style scoped>
.landing {
  min-height: 100vh;
  color: var(--text-primary, #e6e6e6);
  background: var(--bg, #0b0b0f);
}

/* Nav */
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 40px;
  border-bottom: 1px solid var(--border, #1f1f27);
  position: sticky; top: 0;
  background: rgba(11,11,15,0.85);
  backdrop-filter: blur(8px);
  z-index: 50;
}
.nav-brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 16px; }
.brand-mark { color: var(--accent, #7c6af7); }
.nav-actions { display: flex; gap: 10px; }

/* Hero */
.hero {
  padding: 96px 40px 64px;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  display: flex; flex-direction: column; align-items: center;
}
.hero-eyebrow {
  font-size: 11px; letter-spacing: 0.14em; color: var(--accent, #7c6af7);
  margin-bottom: 18px;
}
.hero-title {
  font-size: 44px; line-height: 1.15; font-weight: 800;
  letter-spacing: -0.02em; margin-bottom: 20px;
}
.accent-text { color: var(--accent, #7c6af7); }
.hero-sub {
  font-size: 17px; line-height: 1.6; color: var(--text-secondary, #a3a3af);
  max-width: 560px; margin-bottom: 32px;
}
.hero-cta { display: flex; gap: 14px; margin-bottom: 56px; flex-wrap: wrap; justify-content: center; }

/* Hero preview card — mirrors the real discipline card */
.hero-preview {
  width: 100%; max-width: 380px;
  padding: 20px; text-align: left;
  border: 1px solid var(--border, #1f1f27);
  border-radius: var(--radius-sm, 10px);
  background: var(--bg-hover, #131318);
}
.preview-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.preview-emoji { font-size: 26px; }
.preview-area { font-size: 11px; letter-spacing: 0.08em; color: var(--text-muted, #6b6b76); margin-bottom: 4px; }
.preview-badge {
  display: inline-block; font-size: 10px; font-family: var(--font-mono, monospace);
  text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px;
  border-radius: 999px; background: var(--green-dim, rgba(52,211,153,0.15)); color: var(--green, #34d399);
}
.preview-week {
  background: rgba(255,255,255,0.03); border: 1px solid var(--border, #1f1f27);
  border-radius: var(--radius-sm, 10px); padding: 12px 14px; margin-bottom: 14px;
}
.preview-theme { font-size: 13px; font-weight: 700; color: var(--accent, #7c6af7); margin-bottom: 4px; }
.preview-action { font-size: 12px; color: var(--text-secondary, #a3a3af); line-height: 1.5; }
.preview-checkin {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  background: var(--green-dim, rgba(52,211,153,0.15)); border-radius: var(--radius-sm, 10px);
  color: var(--green, #34d399); font-size: 13px; font-weight: 600;
}
.preview-checkin .arrow { margin-left: auto; }

/* Sections */
.section { padding: 72px 40px; max-width: 1100px; margin: 0 auto; }
.section-alt { background: var(--bg-hover, #131318); max-width: 100%; }
.section-alt > * { max-width: 1100px; margin-left: auto; margin-right: auto; }
.section-head { text-align: center; margin-bottom: 44px; }
.section-eyebrow { font-size: 11px; letter-spacing: 0.14em; color: var(--accent, #7c6af7); margin-bottom: 10px; }
.section-head h2 { font-size: 28px; font-weight: 800; letter-spacing: -0.01em; }

.feature-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.feature-card { padding: 24px; border: 1px solid var(--border, #1f1f27); border-radius: var(--radius-sm, 10px); }
.feature-icon { font-size: 26px; margin-bottom: 12px; }
.feature-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
.feature-card p { font-size: 13px; color: var(--text-secondary, #a3a3af); line-height: 1.55; }

.pill-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.pill {
  font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 999px;
  border: 1px solid var(--border, #1f1f27); background: var(--bg, #0b0b0f);
}

.cta-section {
  text-align: center; padding: 88px 40px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.cta-section h2 { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
.cta-section .btn { margin-top: 18px; }

.footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px 40px; border-top: 1px solid var(--border, #1f1f27);
  font-size: 13px; flex-wrap: wrap; gap: 8px;
}

/* Buttons — assumes global .btn classes already exist in the app;
   fallback styles kept minimal so this still looks right standalone. */
.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: var(--radius-sm, 8px);
  font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
.btn-sm { padding: 8px 14px; font-size: 13px; }
.btn-lg { padding: 13px 24px; font-size: 15px; }
.btn-primary { background: var(--accent, #7c6af7); color: #fff; }
.btn-ghost { background: transparent; color: var(--text-secondary, #a3a3af); border-color: var(--border, #1f1f27); }

@media (max-width: 640px) {
  .nav, .hero, .section, .footer { padding-left: 20px; padding-right: 20px; }
  .hero-title { font-size: 32px; }
}
</style>
