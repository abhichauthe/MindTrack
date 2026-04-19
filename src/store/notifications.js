    import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationService } from '@/services/notificationService'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading       = ref(false)
  const error         = ref(null)

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await notificationService.getAll()
      notifications.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id) {
    await notificationService.markAsRead(id)
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }

  async function markAllRead() {
    await notificationService.markAllRead()
    notifications.value.forEach(n => n.read = true)
  }

  return { notifications, loading, error, unreadCount, fetchAll, markAsRead, markAllRead }
})