<template>
  <header class="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
    <!-- Left: spacer -->
    <div></div>

    <!-- Right: notifications + user -->
    <div class="flex items-center gap-3">
      <!-- Notification Bell -->
      <div class="relative" data-notif-panel>
        <button @click="notifStore.togglePanel()" class="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Notificaciones">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span v-if="notifStore.totalUnread > 0" class="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-orange-500 rounded-full leading-none animate-pulse">
            {{ notifStore.totalUnread > 99 ? '99+' : notifStore.totalUnread }}
          </span>
        </button>

        <!-- Notification Dropdown -->
        <Transition
          enter-active-class="transition ease-out duration-150"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1">
          <div v-if="notifStore.showPanel" class="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
                <span v-if="notifStore.totalUnread > 0" class="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full">
                  {{ notifStore.totalUnread }} nuevas
                </span>
              </div>
              <button v-if="notifStore.totalUnread > 0" @click="notifStore.markAllRead()" class="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Marcar todo leido
              </button>
            </div>

            <!-- Notification List -->
            <div class="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
              <div v-if="notifStore.notifications.length === 0" class="py-10 text-center">
                <svg class="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p class="text-sm text-gray-400 dark:text-gray-500">Sin notificaciones</p>
              </div>

              <div v-for="notif in notifStore.notifications" :key="notif.id"
                @click="handleNotifClick(notif)"
                class="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                :class="notif.read
                  ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  : 'bg-orange-50/60 dark:bg-orange-950/20 hover:bg-orange-50 dark:hover:bg-orange-950/30'">
                <!-- Icon -->
                <div class="flex-shrink-0 mt-0.5">
                  <span class="flex items-center justify-center w-9 h-9 rounded-full"
                    :class="{
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400': notif.type === 'conversations',
                      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': notif.type === 'orders',
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400': notif.type === 'appointments'
                    }">
                    <svg v-if="notif.type === 'conversations'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <svg v-else-if="notif.type === 'orders'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ notif.title }}</p>
                    <span v-if="!notif.read" class="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500"></span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{{ notif.message }}</p>
                  <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{{ formatTime(notif.createdAt) }}</p>
                </div>

                <!-- Arrow -->
                <div class="flex-shrink-0 mt-2">
                  <span class="text-xs text-primary-500 dark:text-primary-400 font-medium">Ver</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'
import { useNotificationsStore } from '../stores/notifications'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifStore = useNotificationsStore()

const settingsStore = useSettingsStore()

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/conversations': 'Conversaciones',
  '/products': 'Productos',
  '/clients': 'Clientes',
  '/orders': 'Pedidos',
  '/appointments': 'Citas',
  '/followups': 'Fidelizacion',
  '/settings': 'Ajustes',
  '/ai-usage': 'Consumo IA'
}

const pageTitle = computed(() => {
  if (route.path === '/business') return settingsStore.businessInfo?.name || 'Mi Negocio'
  if (route.path.startsWith('/conversations/')) return 'Chat'
  return pageTitles[route.path] || ''
})

function handleNotifClick(notif) {
  notifStore.markOneRead(notif.id)
  notifStore.closePanel()
  if (notif.link) router.push(notif.link)
}

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin}m`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `Hace ${diffHrs}h`
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function handleClickOutside(e) {
  if (notifStore.showPanel && !e.target.closest('[data-notif-panel]')) {
    notifStore.closePanel()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
