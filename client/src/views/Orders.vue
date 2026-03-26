<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Pedidos</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestiona los pedidos de tus clientes</p>
      </div>
      <!-- View toggle -->
      <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        <button @click="viewMode = 'cards'" class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          :class="viewMode === 'cards' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          Comandas
        </button>
        <button @click="viewMode = 'table'" class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          :class="viewMode === 'table' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          Tabla
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Pendientes</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-2xl font-bold text-orange-600">{{ stats.preparing }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">En preparacion</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-2xl font-bold text-green-600">{{ stats.ready }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Listos</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-2xl font-bold text-gray-600 dark:text-gray-300">{{ stats.total }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Total hoy</p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="tab in tabs" :key="tab.value" @click="activeFilter = tab.value"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="activeFilter === tab.value
          ? 'bg-primary-600 text-white'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'">
        {{ tab.label }}
        <span v-if="tab.count > 0" class="ml-1 text-xs opacity-75">({{ tab.count }})</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="text-center py-16">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <p class="text-gray-500 dark:text-gray-400 text-sm">
        {{ activeFilter === 'all' ? 'No hay pedidos aun' : 'No hay pedidos con este estado' }}
      </p>
      <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">Los pedidos se crean cuando un cliente ordena por WhatsApp</p>
    </div>

    <!-- ===== CARDS VIEW (Comandas) ===== -->
    <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="order in filteredOrders" :key="order.id"
        class="bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden transition-all"
        :class="order.status === 'pending' ? 'border-yellow-300 dark:border-yellow-700 shadow-md' : 'border-gray-200 dark:border-gray-700'">

        <!-- Card Header -->
        <div class="flex items-center justify-between px-4 py-3" :class="statusHeaderBg[order.status]">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold" :class="statusHeaderText[order.status]">#{{ order.id }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusColors[order.status]">
              {{ statusLabels[order.status] }}
            </span>
          </div>
          <span class="text-xs" :class="statusHeaderText[order.status]">{{ timeAgo(order.created_at) }}</span>
        </div>

        <!-- Customer -->
        <div class="px-4 pt-3 pb-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-bold">
              {{ (order.contact_name || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-800 dark:text-white truncate">{{ order.contact_name || 'Sin nombre' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <span v-if="phoneData(order.phone_number).flag">{{ phoneData(order.phone_number).flag }} </span>{{ phoneData(order.phone_number).localNumber }}
              </p>
            </div>
          </div>

          <!-- Items -->
          <div class="space-y-1.5 mb-3">
            <div v-for="(item, idx) in parseItems(order.items)" :key="idx"
              class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">
                <span class="inline-flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold text-gray-600 dark:text-gray-400 mr-1.5">{{ item.quantity }}</span>
                {{ item.name }}
              </span>
              <span v-if="item.unit_price" class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                ${{ (item.quantity * item.unit_price).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="order.notes" class="mb-3 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p class="text-xs text-yellow-700 dark:text-yellow-300 flex items-start gap-1.5">
              <svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
              {{ order.notes }}
            </p>
          </div>

          <!-- Total -->
          <div class="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
            <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
            <span class="text-lg font-bold text-primary-600 dark:text-primary-400">${{ Number(order.total).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-4 pb-4">
          <div v-if="order.status === 'delivered' || order.status === 'cancelled'" class="flex items-center justify-between">
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ order.status === 'delivered' ? 'Entregado' : 'Cancelado' }}</span>
            <button @click="deleteOrder(order)" class="text-xs text-red-400 hover:text-red-600 transition-colors">Eliminar</button>
          </div>
          <div v-else class="flex gap-2">
            <button @click="updateStatus(order, prevStatus[order.status])" v-if="prevStatus[order.status]"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              {{ prevStatusLabel[order.status] }}
            </button>
            <button @click="updateStatus(order, nextStatus[order.status])" v-if="nextStatus[order.status]"
              class="flex-1 px-3 py-2 text-white text-sm font-medium rounded-lg transition-colors"
              :class="nextStatusBtnColor[order.status]">
              {{ nextStatusLabel[order.status] }}
            </button>
            <button @click="updateStatus(order, 'cancelled')" v-if="order.status === 'pending'"
              class="px-3 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== TABLE VIEW ===== -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cliente</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Items</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Estado</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tiempo</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
            <td class="px-4 py-3">
              <span class="text-sm font-bold text-gray-900 dark:text-white">#{{ order.id }}</span>
            </td>
            <td class="px-4 py-3">
              <p class="text-sm font-medium text-gray-800 dark:text-white">{{ order.contact_name || 'Sin nombre' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <span v-if="phoneData(order.phone_number).flag">{{ phoneData(order.phone_number).flag }} </span>{{ phoneData(order.phone_number).localNumber }}
              </p>
            </td>
            <td class="px-4 py-3">
              <div class="text-xs text-gray-600 dark:text-gray-300 space-y-0.5 max-w-xs">
                <span v-for="(item, idx) in parseItems(order.items)" :key="idx" class="block">
                  {{ item.quantity }}x {{ item.name }}
                </span>
              </div>
              <p v-if="order.notes" class="text-xs text-yellow-600 dark:text-yellow-400 mt-1 italic">{{ order.notes }}</p>
            </td>
            <td class="px-4 py-3 text-right">
              <span class="text-sm font-bold text-primary-600 dark:text-primary-400">${{ Number(order.total).toFixed(2) }}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="statusColors[order.status]">
                {{ statusLabels[order.status] }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ timeAgo(order.created_at) }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button v-if="prevStatus[order.status]" @click="updateStatus(order, prevStatus[order.status])"
                  class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" :title="prevStatusLabel[order.status]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button v-if="nextStatus[order.status]" @click="updateStatus(order, nextStatus[order.status])"
                  class="px-2.5 py-1 text-xs font-medium rounded-lg text-white transition-colors" :class="nextStatusBtnColor[order.status]">
                  {{ nextStatusLabel[order.status] }}
                </button>
                <button v-if="order.status === 'pending'" @click="updateStatus(order, 'cancelled')"
                  class="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Cancelar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
                <button v-if="order.status === 'delivered' || order.status === 'cancelled'" @click="deleteOrder(order)"
                  class="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Eliminar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../lib/api'
import { parsePhone } from '../lib/phone'
import { useSocket } from '../composables/useSocket'

const orders = ref([])
const loading = ref(true)
const activeFilter = ref('all')
const viewMode = ref('cards')

const { on, off } = useSocket()

const statusLabels = {
  pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'En preparacion',
  ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado'
}

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  preparing: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  ready: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  delivered: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
}

const statusHeaderBg = {
  pending: 'bg-yellow-50 dark:bg-yellow-900/20',
  confirmed: 'bg-blue-50 dark:bg-blue-900/20',
  preparing: 'bg-orange-50 dark:bg-orange-900/20',
  ready: 'bg-green-50 dark:bg-green-900/20',
  delivered: 'bg-gray-50 dark:bg-gray-900',
  cancelled: 'bg-red-50 dark:bg-red-900/20'
}

const statusHeaderText = {
  pending: 'text-yellow-700 dark:text-yellow-300',
  confirmed: 'text-blue-700 dark:text-blue-300',
  preparing: 'text-orange-700 dark:text-orange-300',
  ready: 'text-green-700 dark:text-green-300',
  delivered: 'text-gray-500 dark:text-gray-400',
  cancelled: 'text-red-700 dark:text-red-300'
}

// Forward flow
const nextStatus = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' }
const nextStatusLabel = { pending: 'Confirmar pedido', confirmed: 'En preparacion', preparing: 'Marcar listo', ready: 'Entregado' }
const nextStatusBtnColor = {
  pending: 'bg-blue-600 hover:bg-blue-700',
  confirmed: 'bg-orange-600 hover:bg-orange-700',
  preparing: 'bg-green-600 hover:bg-green-700',
  ready: 'bg-gray-600 hover:bg-gray-700'
}

// Backward flow
const prevStatus = { confirmed: 'pending', preparing: 'confirmed', ready: 'preparing' }
const prevStatusLabel = { confirmed: 'Volver a pendiente', preparing: 'Volver a confirmado', ready: 'Volver a preparando' }

const stats = computed(() => ({
  total: orders.value.length,
  pending: orders.value.filter(o => o.status === 'pending').length,
  preparing: orders.value.filter(o => o.status === 'preparing').length,
  ready: orders.value.filter(o => o.status === 'ready').length
}))

const tabs = computed(() => [
  { value: 'all', label: 'Todos', count: orders.value.length },
  { value: 'pending', label: 'Pendientes', count: orders.value.filter(o => o.status === 'pending').length },
  { value: 'confirmed', label: 'Confirmados', count: orders.value.filter(o => o.status === 'confirmed').length },
  { value: 'preparing', label: 'Preparando', count: orders.value.filter(o => o.status === 'preparing').length },
  { value: 'ready', label: 'Listos', count: orders.value.filter(o => o.status === 'ready').length },
  { value: 'delivered', label: 'Entregados', count: orders.value.filter(o => o.status === 'delivered').length },
  { value: 'cancelled', label: 'Cancelados', count: orders.value.filter(o => o.status === 'cancelled').length }
])

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return orders.value
  return orders.value.filter(o => o.status === activeFilter.value)
})

function handleNewOrder(order) {
  if (!orders.value.find(o => o.id === order.id)) orders.value.unshift(order)
}

function handleUpdatedOrder(order) {
  const idx = orders.value.findIndex(o => o.id === order.id)
  if (idx !== -1) orders.value[idx] = order
}

onMounted(async () => {
  await fetchOrders()
  on('order:new', handleNewOrder)
  on('order:updated', handleUpdatedOrder)
})

onUnmounted(() => {
  off('order:new', handleNewOrder)
  off('order:updated', handleUpdatedOrder)
})

async function fetchOrders() {
  loading.value = true
  try { const { data } = await api.get('/orders'); orders.value = data.orders }
  catch (e) { /* ignore */ }
  finally { loading.value = false }
}

function parseItems(itemsStr) {
  try { return JSON.parse(itemsStr) } catch { return [] }
}

function phoneData(phone) { return parsePhone(phone) }

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'Z')
  const now = new Date()
  const diff = now - d
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Ahora'
  if (min < 60) return `${min}m`
  const hr = Math.floor(diff / 3600000)
  if (hr < 24) return `${hr}h`
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function updateStatus(order, status) {
  try {
    const { data } = await api.put(`/orders/${order.id}/status`, { status })
    const idx = orders.value.findIndex(o => o.id === order.id)
    if (idx !== -1) orders.value[idx] = data.order
  } catch (e) { alert(e.response?.data?.error || 'Error actualizando estado') }
}

async function deleteOrder(order) {
  if (!confirm(`Eliminar pedido #${order.id}?`)) return
  try { await api.delete(`/orders/${order.id}`); orders.value = orders.value.filter(o => o.id !== order.id) }
  catch (e) { alert(e.response?.data?.error || 'Error eliminando') }
}
</script>
