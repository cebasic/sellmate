import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Landing', component: () => import('../views/Landing.vue'), meta: { public: true } },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { public: true } },
  { path: '/setup', name: 'SetupWizard', component: () => import('../views/SetupWizard.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/products', name: 'Products', component: () => import('../views/Products.vue') },
  { path: '/business', name: 'Business', component: () => import('../views/BusinessInfo.vue') },
  { path: '/conversations', name: 'Conversations', component: () => import('../views/Conversations.vue') },
  { path: '/conversations/:id', name: 'ChatView', component: () => import('../views/ChatView.vue') },
  { path: '/appointments', name: 'Appointments', component: () => import('../views/Appointments.vue') },
  { path: '/followups', name: 'FollowUps', component: () => import('../views/FollowUps.vue') },
  { path: '/settings', name: 'Settings', component: () => import('../views/Settings.vue') },
  { path: '/agents', name: 'Agents', component: () => import('../views/Agents.vue') },
  { path: '/modules', name: 'Modules', component: () => import('../views/Modules.vue') },
  { path: '/ai-settings', redirect: '/settings' },
  { path: '/ai-usage', name: 'AIUsage', component: () => import('../views/AIUsage.vue'), meta: { requiresAuth: true } },
  { path: '/clients', name: 'Clients', component: () => import('../views/Clients.vue') },
  { path: '/orders', name: 'Orders', component: () => import('../views/Orders.vue') },
  { path: '/cita/:token', name: 'AppointmentConfirm', component: () => import('../views/AppointmentConfirm.vue'), meta: { public: true } },
  { path: '/privacidad', name: 'Privacy', component: () => import('../views/Privacy.vue'), meta: { public: true } },
  { path: '/terminos', name: 'Terms', component: () => import('../views/Terms.vue'), meta: { public: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  if (!to.meta.public && !token) {
    next('/login')
  } else if (token && to.name === 'Landing') {
    // Authenticated users on landing page go to dashboard
    next('/dashboard')
  } else if (token && to.name !== 'SetupWizard' && to.name !== 'Login' && to.name !== 'Landing') {
    // Check if setup is completed
    try {
      const { useSettingsStore } = await import('../stores/settings')
      const settingsStore = useSettingsStore()
      if (!settingsStore.settings) {
        await settingsStore.fetchSettings()
      }
      if (settingsStore.settings && settingsStore.settings.setup_completed === 0) {
        next('/setup')
        return
      }
    } catch (e) {
      // If settings fetch fails, let them through
    }
    next()
  } else {
    next()
  }
})

export default router
