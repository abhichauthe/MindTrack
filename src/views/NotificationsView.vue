<template>
  <div class="dashboard">
    <AppSidebar active="notifications" />

    <main class="main">
      <div class="page-header flex justify-between items-center">
        <div>
          <h2>Notifications</h2>
          <p class="text-secondary text-sm mt-1">
            {{ notifStore.unreadCount }} unread
          </p>
        </div>
        <button
          v-if="notifStore.unreadCount > 0"
          class="btn btn-ghost btn-sm"
          @click="notifStore.markAllRead()"
        >
          Mark all read
        </button>
      </div>

      <div v-if="notifStore.loading" class="loading-state">
        <div class="spinner" />
      </div>

      <div v-else-if="!notifStore.notifications.length" class="empty-state">
        <div class="empty-icon">🔔</div>
        <h3>All caught up!</h3>
        <p class="text-secondary text-sm">No notifications yet. Complete habits and focus sessions to get updates.</p>
      </div>

      <div v-else class="notif-list">
        <TransitionGroup name="habit-list" tag="div" class="notif-list-inner">
          <div
            v-for="n in notifStore.notifications"
            :key="n.id"
            class="notif-card card"
            :class="{ unread: !n.read }"
            @click="notifStore.markAsRead(n.id)"
          >
            <div class="notif-icon" :style="{ background: typeColor(n.type) + '22', color: typeColor(n.type) }">
              {{ typeIcon(n.type) }}
            </div>
            <div class="notif-body">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-msg text-secondary text-sm">{{ n.message }}</div>
              <div class="notif-time text-muted mono" style="font-size:11px; margin-top:4px">
                {{ formatTime(n.createdAt) }}
              </div>
            </div>
            <div class="notif-dot" v-if="!n.read" />
          </div>
        </TransitionGroup>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useNotificationStore } from '@/store/notifications'
import AppSidebar from '@/components/AppSidebar.vue'

const notifStore = useNotificationStore()

const typeIcon = (type) => ({
  HABIT_REMINDER:  '◧',
  FOCUS_COMPLETE:  '◔',
  JOURNAL_REMINDER:'◫',
  SYSTEM:          '◉'
}[type] || '◈')

const typeColor = (type) => ({
  HABIT_REMINDER:  'var(--accent)',
  FOCUS_COMPLETE:  'var(--green)',
  JOURNAL_REMINDER:'#fb923c',
  SYSTEM:          'var(--text-secondary)'
}[type] || 'var(--accent)')

function formatTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => notifStore.fetchAll())
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }
.main { flex: 1; padding: 32px 40px; max-width: 720px; }
.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 20px; }

.notif-list-inner { display: flex; flex-direction: column; gap: 10px; }

.notif-card {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 16px 20px; cursor: pointer;
  transition: border-color var(--transition);
  position: relative;
}
.notif-card:hover { border-color: var(--border-light); }
.notif-card.unread { border-left: 3px solid var(--accent); }

.notif-icon {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}

.notif-body { flex: 1; }
.notif-title { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
.notif-msg { line-height: 1.5; }

.notif-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); flex-shrink: 0; margin-top: 4px;
}

.empty-state, .loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 24px; text-align: center;
  border: 1px dashed var(--border); border-radius: var(--radius);
}
.empty-icon { font-size: 36px; opacity: 0.4; }
.empty-state h3 { font-size: 18px; }

.habit-list-enter-active { transition: all 0.3s ease; }
.habit-list-enter-from { opacity: 0; transform: translateX(-10px); }
.habit-list-leave-active { transition: all 0.2s ease; }
.habit-list-leave-to { opacity: 0; }
</style>