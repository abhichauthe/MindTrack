<template>
  <div class="auth-layout">
    <div class="auth-brand">
      <span class="brand-icon">◈</span>
      <span class="brand-name">MindTrack</span>
    </div>

    <div class="auth-card card">
      <div class="auth-header">
        <h1>Welcome back</h1>
        <p class="text-secondary text-sm mt-1">
          Sign in to continue your discipline streak
        </p>
      </div>

      <div class="divider" />

      <!-- ✅ Success message shown after registration -->
      <div v-if="justRegistered" class="alert alert-success" style="margin-bottom:16px">
        ✅ Account created successfully! Please sign in to continue.
      </div>

      <!-- Error alert -->
      <div v-if="authStore.error" class="alert alert-error" style="margin-bottom:16px">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%; margin-top:8px"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="spinner" />
          <span v-else>Sign In</span>
        </button>
      </form>

      <p class="auth-footer text-sm text-secondary">
        No account?
        <RouterLink to="/register" class="text-accent">Create one →</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })

// ✅ Shows success banner if redirected from registration
const justRegistered = computed(() => route.query.registered === 'true')

async function handleLogin() {
  authStore.clearError()
  try {
    await authStore.login(form)
    router.push({ name: 'Dashboard' })
  } catch (_) {
    // error is already set in the store
  }
}
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 24px;
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.brand-icon { color: var(--accent); font-size: 24px; }

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-header h1 { font-size: 22px; font-weight: 700; }

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
}

a { color: var(--accent); text-decoration: none; font-weight: 600; }
a:hover { text-decoration: underline; }
</style>