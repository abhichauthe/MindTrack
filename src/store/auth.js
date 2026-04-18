import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

const STORAGE_KEY = 'mindtrack_user'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isLoggedIn = computed(() => !!user.value)
  const userId = computed(() => user.value?.userId)
  const username = computed(() => user.value?.username)

  // Actions
  function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try { user.value = JSON.parse(raw) } catch (_) {}
    }
  }

  function persistUser(userData) {
    user.value = userData
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }

  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authService.register(payload)
      persistUser(data)
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function login(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await authService.login(payload)
      persistUser(data)
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function clearError() {
    error.value = null
  }

  return {
    user, loading, error,
    isLoggedIn, userId, username,
    loadFromStorage, register, login, logout, clearError
  }
})