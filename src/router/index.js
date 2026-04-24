import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  // ── Public routes ──────────────────────────────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true }
  },

  // ── Protected routes ───────────────────────────────────────────────
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/focus',
    name: 'Focus',
    component: () => import('@/views/FocusView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/journal',
    name: 'Journal',
    component: () => import('@/views/JournalView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/timetable',
    name: 'Timetable',
    component: () => import('@/views/TimetableView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/gamification',
    name: 'Gamification',
    component: () => import('@/views/GamificationView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/weekly-review',
    name: 'WeeklyReview',
    component: () => import('@/views/WeeklyReviewView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationsView.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/discipline', name: 'Discipline', component: () => import('@/views/DisciplineView.vue'), meta: { requiresAuth: true } },

  { path: '/plan', name: 'Plan', component: () => import('@/views/PlanView.vue'), meta: { requiresAuth: true } },
  // ── Default redirect ───────────────────────────────────────────────
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ── Navigation guards ─────────────────────────────────────────────────
router.beforeEach((to, from, next) => {
  const authStore  = useAuthStore()
  const isLoggedIn = authStore.isLoggedIn

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login' })
    return
  }

  if (to.meta.guestOnly && isLoggedIn) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router