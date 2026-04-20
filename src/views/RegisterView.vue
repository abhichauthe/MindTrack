<template>
  <div class="auth-layout">
    <div class="auth-brand">
      <span class="brand-icon">◈</span>
      <span class="brand-name">MindTrack</span>
    </div>

    <div class="auth-card card">
      <div class="auth-header">
        <h1>Start tracking</h1>
        <p class="text-secondary text-sm mt-1">
          Create your account to begin building habits
        </p>
      </div>

      <div class="divider" />

      <!-- Error alert -->
      <div v-if="authStore.error" class="alert alert-error" style="margin-bottom:16px">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="mindful_warrior"
            required
            minlength="3"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
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
            minlength="6"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%; margin-top:8px"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="spinner" />
          <span v-else>Create Account</span>
        </button>
      </form>

      <p class="auth-footer text-sm text-secondary">
        Already have an account?
        <RouterLink to="/login" class="text-accent">Sign in →</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router    = useRouter()
const authStore = useAuthStore()

const form = reactive({ username: '', email: '', password: '' })

async function handleRegister() {
  authStore.clearError()
  try {
    await authStore.register(form)

    // ✅ Redirect to login page with success message query param
    router.push({ name: 'Login', query: { registered: 'true' } })

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