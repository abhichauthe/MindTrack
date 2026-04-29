<template>
  <div class="auth-layout">
    <div class="auth-brand">
      <span class="brand-icon">◈</span>
      <span class="brand-name">MindTrack</span>
    </div>

    <div class="auth-card card">
      <div class="auth-header">
        <h1>Forgot password</h1>
        <p class="text-secondary text-sm mt-1">
          We’ll email you a reset link.
        </p>
      </div>

      <div class="divider" />

      <div class="auth-tabs" style="margin-bottom:16px">
        <button
          type="button"
          class="tab"
          :class="{ active: mode === 'email' }"
          @click="setMode('email')"
        >
          Email reset link
        </button>
        <button
          type="button"
          class="tab"
          :class="{ active: mode === 'mobile' }"
          @click="setMode('mobile')"
        >
          Mobile OTP
        </button>
      </div>

      <div v-if="success" class="alert alert-success" style="margin-bottom:16px">
        If an account exists for that email, you’ll receive a reset link shortly.
      </div>

      <form v-if="mode === 'email'" @submit.prevent="handleSend" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
            autocomplete="email"
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%; margin-top:8px"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner" />
          <span v-else>Send Reset Link</span>
        </button>
      </form>

      <form
        v-else
        @submit.prevent="otpStep === 1 ? handleSendOtp() : handleVerifyOtp()"
        class="auth-form"
      >
        <div class="form-group">
          <label class="form-label">Mobile number</label>
          <input
            v-model="otpForm.phone"
            type="tel"
            inputmode="tel"
            class="form-input"
            placeholder="e.g. 9876543210"
            required
            autocomplete="tel"
            :disabled="otpBusy || otpStep === 2"
            @input="onPhoneInput"
          />
          <div v-if="phoneTouched && !isPhoneValid" class="text-sm" style="color:var(--red)">
            Enter a valid Indian mobile number (10 digits starting 6–9).
          </div>
        </div>

        <div v-if="otpStep === 2" class="form-group">
          <label class="form-label">OTP</label>
          <input
            v-model="otpForm.otp"
            type="text"
            inputmode="numeric"
            pattern="\\d*"
            maxlength="6"
            class="form-input"
            placeholder="6-digit code"
            required
            :disabled="otpBusy"
            @input="onOtpInput"
          />
          <div v-if="otpError" class="text-sm" style="color:var(--red)">
            {{ otpError }}
          </div>

          <div class="otp-row">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="otpBusy || resendLeft > 0"
              @click="handleResendOtp"
            >
              Resend OTP<span v-if="resendLeft > 0"> ({{ resendText }})</span>
            </button>

            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="otpBusy"
              @click="goBackToPhone"
            >
              Change number
            </button>
          </div>

          <p class="text-sm text-secondary" style="margin-top:10px">
            If this number is registered, you’ll receive an OTP shortly.
          </p>
        </div>

        <button
          v-if="otpStep === 1"
          type="submit"
          class="btn btn-primary"
          style="width:100%; margin-top:8px"
          :disabled="otpBusy"
        >
          <span v-if="otpBusy" class="spinner" />
          <span v-else>Send OTP</span>
        </button>

        <button
          v-else
          type="submit"
          class="btn btn-primary"
          style="width:100%; margin-top:8px"
          :disabled="otpBusy || otpForm.otp.length !== 6"
        >
          <span v-if="otpBusy" class="spinner" />
          <span v-else>Verify & Sign in</span>
        </button>
      </form>

      <p class="auth-footer text-sm text-secondary">
        <RouterLink to="/login" class="text-accent">← Back to login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('email') // 'email' | 'mobile'

const email = ref('')
const loading = ref(false)
const success = ref(false)

const otpStep = ref(1) // 1: phone, 2: otp
const otpForm = reactive({ phone: '', otp: '' })
const otpBusy = ref(false)
const otpError = ref(null)

const phoneTouched = ref(false)
const normalizedPhone = computed(() => normalizeIndianPhone(otpForm.phone))
const isPhoneValid = computed(() => /^[6-9]\d{9}$/.test(normalizedPhone.value))

const resendLeft = ref(0)
let resendTimer = null

function setMode(nextMode) {
  mode.value = nextMode
  success.value = false
  clearOtpState()
}

function clearOtpErrors() {
  otpError.value = null
}

function normalizeIndianPhone(input) {
  const raw = String(input || '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/[()]/g, '')
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(2)
  if (digits.length > 10) digits = digits.slice(-10)
  return digits
}

function onPhoneInput() {
  phoneTouched.value = true
  clearOtpErrors()
  otpForm.phone = normalizeIndianPhone(otpForm.phone)
}

function clearOtpState() {
  otpStep.value = 1
  otpForm.phone = ''
  otpForm.otp = ''
  otpBusy.value = false
  otpError.value = null
  phoneTouched.value = false
  stopResendTimer()
  resendLeft.value = 0
}

function goBackToPhone() {
  otpStep.value = 1
  otpForm.otp = ''
  otpError.value = null
  stopResendTimer()
  resendLeft.value = 0
}

function onOtpInput() {
  otpError.value = null
  otpForm.otp = String(otpForm.otp || '').replace(/\D/g, '').slice(0, 6)
}

const resendText = computed(() => `0:${String(resendLeft.value).padStart(2, '0')}`)

function startResendTimer() {
  stopResendTimer()
  resendLeft.value = 30
  resendTimer = setInterval(() => {
    resendLeft.value = Math.max(0, resendLeft.value - 1)
    if (resendLeft.value === 0) stopResendTimer()
  }, 1000)
}

function stopResendTimer() {
  if (resendTimer) clearInterval(resendTimer)
  resendTimer = null
}

onUnmounted(() => {
  stopResendTimer()
})

async function handleSend() {
  success.value = false
  loading.value = true
  try {
    await authService.requestPasswordReset({ email: email.value })
    success.value = true
  } catch (e) {
    // Requirement: always show same success message whether email exists or not.
    // We also keep the UX identical even if the request fails.
    success.value = true
  } finally {
    loading.value = false
  }
}

async function handleSendOtp() {
  clearOtpErrors()
  phoneTouched.value = true
  if (!isPhoneValid.value) return
  otpBusy.value = true
  try {
    await authService.requestOtp({ phone: normalizedPhone.value })
    otpStep.value = 2
    otpForm.otp = ''
    startResendTimer()
  } catch (e) {
    // Enumeration-safe: proceed to OTP screen even if backend rejects.
    otpStep.value = 2
    otpForm.otp = ''
    startResendTimer()
  } finally {
    otpBusy.value = false
  }
}

async function handleResendOtp() {
  await handleSendOtp()
}

async function handleVerifyOtp() {
  otpError.value = null
  otpBusy.value = true
  try {
    await authStore.loginWithOtp({ phone: normalizedPhone.value, otp: otpForm.otp })
    router.push({ name: 'Dashboard' })
  } catch (e) {
    otpError.value = e?.message || 'Invalid or expired OTP.'
  } finally {
    otpBusy.value = false
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

.auth-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
}

.tab {
  flex: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--transition);
}
.tab:hover { background: var(--bg-hover); color: var(--text-primary); }
.tab.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--text-primary);
  box-shadow: 0 0 0 3px var(--accent-dim);
}

.otp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 6px;
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
}

a { color: var(--accent); text-decoration: none; font-weight: 600; }
a:hover { text-decoration: underline; }
</style>
