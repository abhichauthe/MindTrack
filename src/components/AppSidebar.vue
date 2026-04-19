<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <span class="brand-icon">◈</span>
      <span class="brand-name">MindTrack</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="nav-item"
        :class="{ active: active === item.key }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        {{ item.label }}
        <span
          v-if="item.key === 'notifications' && notifStore.unreadCount > 0"
          class="nav-badge"
        >
          {{ notifStore.unreadCount }}
        </span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="user-pill">
        <div class="user-avatar">{{ initials }}</div>
        <div>
          <div class="user-name">{{ authStore.username }}</div>
          <div class="text-muted text-sm">{{ authStore.user?.email }}</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px" @click="handleLogout">
        Sign out
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useNotificationStore } from '@/store/notifications'

defineProps({ active: { type: String, default: '' } })

const router        = useRouter()
const authStore     = useAuthStore()
const notifStore    = useNotificationStore()

const navItems = [
  { key: 'dashboard',     label: 'Habits',        icon: '◧', to: '/dashboard'     },
  { key: 'focus',         label: 'Focus Timer',   icon: '◔', to: '/focus'         },
  { key: 'journal',       label: 'Journal',       icon: '◫', to: '/journal'       },
  { key: 'notifications', label: 'Notifications', icon: '◉', to: '/notifications' },
]

const initials = computed(() => (authStore.username || '').slice(0, 2).toUpperCase())

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}

onMounted(() => notifStore.fetchAll())
</script>

<style scoped>
.sidebar {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
  padding: 0 8px;
  margin-bottom: 32px;
}
.brand-icon { color: var(--accent); font-size: 22px; }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition);
}
.nav-item:hover  { background: var(--bg-hover); color: var(--text-primary); }
.nav-item.active { background: var(--accent-dim); color: var(--accent); }

.nav-icon { font-size: 16px; }

.nav-badge {
  margin-left: auto;
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  font-family: var(--font-mono);
}

.sidebar-footer { border-top: 1px solid var(--border); padding-top: 16px; }

.user-pill { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent-dim); color: var(--accent);
  font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-name { font-size: 14px; font-weight: 600; }
</style>