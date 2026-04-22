<template>
  <aside class="sidebar">
    <!-- Brand mark -->
    <div class="brand">◈</div>

    <!-- Nav items -->
    <nav class="nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        class="nav-item"
        :class="{ active: active === item.key }"
        :title="item.label"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-badge" v-if="item.key === 'notifications' && unreadCount > 0">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </RouterLink>
    </nav>

    <!-- Logout -->
    <button class="logout-btn" @click="logout" title="Logout">⇥</button>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import apiClient from '@/services/apiClient'

defineProps({ active: { type: String, default: '' } })

const router      = useRouter()
const authStore   = useAuthStore()
const unreadCount = ref(0)

async function fetchUnreadCount() {
  try {
    const { data } = await apiClient.get('/notifications/unread/count')
    // Backend returns either a number or { count: number }
    unreadCount.value = typeof data === 'number' ? data : (data.count ?? 0)
  } catch (_) {
    // Silently fail — badge just won't show
  }
}

const navItems = [
  { key: 'dashboard',     label: 'Habits',         icon: '◧', to: '/dashboard'      },
  { key: 'focus',         label: 'Focus Timer',    icon: '◔', to: '/focus'          },
  { key: 'journal',       label: 'Journal',        icon: '◫', to: '/journal'        },
  { key: 'timetable',     label: 'Timetable',      icon: '⊞', to: '/timetable'      },
  { key: 'gamification',  label: 'Progress',       icon: '⭐', to: '/gamification'   },
  { key: 'weekly',        label: 'Weekly Review',  icon: '📊', to: '/weekly-review'  },
  { key: 'discipline', label: 'Discipline', icon: '🧠', to: '/discipline' },
  { key: 'notifications', label: 'Notifications',  icon: '◉', to: '/notifications'  },
]

function logout() {
  authStore.logout()
  router.push({ name: 'Login' })
}

onMounted(() => {
  fetchUnreadCount()
})
</script>

<style scoped>
.sidebar {
  width: 56px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  height: 100vh;
  position: sticky;
  top: 0;
}

.brand {
  font-size: 20px;
  color: var(--accent);
  margin-bottom: 24px;
  font-weight: 800;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  width: 100%;
  align-items: center;
}

.nav-item {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition);
  position: relative;
}
.nav-item:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--accent-dim);
  color: var(--accent);
}

.nav-icon { line-height: 1; }

.nav-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--accent);
  color: #fff;
  font-size: 9px;
  font-family: var(--font-mono);
  border-radius: 8px;
  min-width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

.logout-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
  margin-top: auto;
}
.logout-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}
</style>