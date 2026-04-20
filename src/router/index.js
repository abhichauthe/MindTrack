import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  { path: '/', redirect: '/dashboard' },

  { path: '/login',    name: 'Login',    component: () => import('@/views/LoginView.vue'),    meta: { guestOnly: true  } },
  { path: '/register', name: 'Register', component: () => import('@/views/RegisterView.vue'), meta: { guestOnly: true  } },

  { path: '/dashboard',     name: 'Dashboard',     component: () => import('@/views/DashboardView.vue'),     meta: { requiresAuth: true } },
  { path: '/focus',         name: 'Focus',         component: () => import('@/views/FocusView.vue'),         meta: { requiresAuth: true } },
  { path: '/journal',       name: 'Journal',       component: () => import('@/views/JournalView.vue'),       meta: { requiresAuth: true } },
  { path: '/notifications', name: 'Notifications', component: () => import('@/views/NotificationsView.vue'), meta: { requiresAuth: true } },
{ path: '/gamification', name: 'Gamification', component: () => import('@/views/GamificationView.vue'), meta: { requiresAuth: true } },  
{ path: '/weekly-review', name: 'WeeklyReview', component: () => import('@/views/WeeklyReviewView.vue'), meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  auth.loadFromStorage()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next({ name: 'Login' })
  if (to.meta.guestOnly  && auth.isLoggedIn)   return next({ name: 'Dashboard' })
  next()
})

export default router