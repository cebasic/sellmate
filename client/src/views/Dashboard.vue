<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stat.value }}</p>
          </div>
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="stat.bgClass">
            <component :is="stat.iconComponent" />
          </div>
        </div>
      </div>
    </div>

    <!-- WhatsApp disconnected shortcut -->
    <router-link v-if="auth.isAdmin && settingsStore.whatsappStatus !== 'connected'" to="/settings"
      class="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
      <span class="w-2.5 h-2.5 rounded-full animate-pulse" :class="settingsStore.whatsappStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-400'"></span>
      <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <div class="flex-1">
        <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">WhatsApp no esta conectado</p>
        <p class="text-xs text-yellow-600 dark:text-yellow-400">Ve a Ajustes para conectar tu WhatsApp</p>
      </div>
      <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
    </router-link>

    <!-- Recent conversations -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Conversaciones recientes</h3>
        <router-link to="/conversations" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">Ver todas</router-link>
      </div>
      <div v-if="convStore.conversations.length === 0" class="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
        No hay conversaciones aun
      </div>
      <div v-else class="space-y-1">
        <router-link v-for="conv in convStore.conversations.slice(0, 5)" :key="conv.id"
          :to="`/conversations/${conv.id}`"
          class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm">
              {{ (conv.contact_name || conv.phone_number).charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ conv.contact_name || conv.phone_number }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ conv.phone_number }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Topic badge -->
            <span v-if="conv.topic" class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {{ topicLabel(conv.topic) }}
            </span>
            <span class="text-xs px-2 py-1 rounded-full font-medium" :class="statusBadge(conv.status)">
              {{ statusLabel(conv.status) }}
            </span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useConversationsStore } from '../stores/conversations'
import { useSettingsStore } from '../stores/settings'
import api from '../lib/api'

const auth = useAuthStore()
const convStore = useConversationsStore()
const settingsStore = useSettingsStore()

const stats = ref([])

// Topic label mapping
const topicLabels = {
  cotizacion: 'Cotizacion',
  informacion_productos: 'Productos',
  consulta_horario: 'Horario',
  consulta_sucursales: 'Sucursales',
  soporte: 'Soporte',
  compra: 'Compra',
  saludo: 'Saludo',
  otro: 'General'
}

function topicLabel(topic) {
  return topicLabels[topic] || topic
}

function statusLabel(status) {
  return { bot: 'Bot', human: 'Humano', closed: 'Cerrada' }[status] || status
}

// Stat icon components
const statIcons = {
  conversations: () => h('svg', { class: 'w-5 h-5 text-blue-600 dark:text-blue-400', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' })
  ]),
  bot: () => h('svg', { class: 'w-5 h-5 text-primary-600 dark:text-primary-400', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
  ]),
  human: () => h('svg', { class: 'w-5 h-5 text-orange-600 dark:text-orange-400', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
  ]),
  products: () => h('svg', { class: 'w-5 h-5 text-purple-600 dark:text-purple-400', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' })
  ])
}

onMounted(async () => {
  await convStore.fetchConversations()
  const totalConvs = convStore.conversations.length
  const botConvs = convStore.conversations.filter(c => c.status === 'bot').length
  const humanConvs = convStore.conversations.filter(c => c.status === 'human').length

  let totalProducts = 0
  try {
    const { data } = await api.get('/products')
    totalProducts = data.products.length
  } catch (e) { /* ignore */ }

  stats.value = [
    { label: 'Conversaciones', value: totalConvs, iconComponent: statIcons.conversations, bgClass: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Atendidas por Bot', value: botConvs, iconComponent: statIcons.bot, bgClass: 'bg-primary-100 dark:bg-primary-900/30' },
    { label: 'Atendidas por Humano', value: humanConvs, iconComponent: statIcons.human, bgClass: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Productos', value: totalProducts, iconComponent: statIcons.products, bgClass: 'bg-purple-100 dark:bg-purple-900/30' }
  ]

  try {
    const { data } = await api.get('/whatsapp/status')
    if (data.status) settingsStore.whatsappStatus = data.status
  } catch (e) { /* ignore */ }
})

function statusBadge(status) {
  return {
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': status === 'bot',
    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300': status === 'human',
    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300': status === 'closed'
  }
}

</script>
