<template>
  <div id="app-shell">
    <RouterView v-slot="{ Component, route }">
      <Transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup>
// App.vue is intentionally lean.
// All layout (sidebar, nav) lives inside the views themselves,
// keeping route-level components in full control of their own chrome.
// To add global state hydration, do it here via onMounted.
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Rehydrate user session from localStorage on every cold load
  authStore.loadFromStorage()
})
</script>

<style>
/* ─── Page transition: fade + lift ─────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(7px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* ─── Slide transition (opt-in via route.meta.transition) ───── */
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

/* ─── App shell ─────────────────────────────────────────────── */
#app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-display);
}
</style>