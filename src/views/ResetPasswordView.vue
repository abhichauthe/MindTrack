<template>
  <div class="auth-layout">
    <div class="auth-brand">
      <span class="brand-icon">◈</span>
      <span class="brand-name">MindTrack</span>
    </div>

    <div class="auth-card card">
      <div class="auth-header">
        <h1>Reset password</h1>
        <p class="text-secondary text-sm mt-1">
          Choose a strong new password.
        </p>
      </div>

      <div class="divider" />

      <div v-if="error" class="alert alert-error" style="margin-bottom:16px">
        {{ error }}
      </div>

      <form @submit.prevent="handleReset" class="auth-form">
        <div class="form-group">
          <label class="form-label">New password</label>
          <input
            v-model="newPassword"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="new-password"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Confirm password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="new-password"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%; margin-top:8px"
          :disabled="loading || !token"
        >
          <span v-if="loading" class="spinner" />
          <span v-else>Reset Password</span>
        </button>
      </form>

      <p class="auth-footer text-sm text-secondary">
        <RouterLink to="/login" class="text-accent">← Back to login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/authService'

const route = useRoute()
const router = useRouter()

const token = computed(() => String(route.query.token || ''))
const newPassword = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const error = ref(null)

async function handleReset() {
  error.value = null

  if (!token.value) {
    error.value = 'Reset link is invalid or expired.'
    return
  }
  if (newPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    await authService.confirmPasswordReset({
      token: token.value,
      newPassword: newPassword.value
    })
    router.replace({ name: 'Login', query: { passwordUpdated: 'true' } })
  } catch (e) {
    error.value = e.message || 'Failed to reset password.'
  } finally {
    loading.value = false
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
