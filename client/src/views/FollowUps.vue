<template>
  <div class="p-4 sm:p-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Fidelizacion</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Reglas de seguimiento automatico para tus clientes</p>
      </div>
      <div class="flex gap-2">
        <button @click="executeNow" :disabled="executing"
          class="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50">
          <svg v-if="executing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ executing ? 'Ejecutando...' : 'Ejecutar ahora' }}
        </button>
        <button @click="showForm = true"
          class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva regla
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Reglas activas</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.activeRules }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Mensajes enviados</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalSent }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Enviados hoy</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.sentToday }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">Tasa de respuesta</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.responseRate }}%</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
      <button @click="activeTab = 'rules'" :class="activeTab === 'rules' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        class="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors">
        Reglas
      </button>
      <button @click="activeTab = 'log'; fetchLog()" :class="activeTab === 'log' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        class="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors">
        Historial
      </button>
    </div>

    <!-- Rules Tab -->
    <div v-if="activeTab === 'rules'">
      <div v-if="loading" class="text-center py-12">
        <svg class="w-8 h-8 animate-spin text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
      </div>

      <div v-else-if="rules.length === 0"
        class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">No hay reglas de fidelizacion configuradas</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Crea una regla para enviar mensajes automaticos a tus clientes</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="rule in rules" :key="rule.id"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ rule.name }}</h3>
                <span :class="rule.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
                  class="px-2 py-0.5 text-xs font-medium rounded-full">
                  {{ rule.active ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>{{ triggerLabel(rule.trigger_type) }} - {{ rule.delay_days }} dias</p>
                <p>Audiencia: {{ audienceLabel(rule.target_audience) }}</p>
                <p class="italic text-gray-400 dark:text-gray-500 truncate">"{{ rule.message_template }}"</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button @click="toggleRule(rule)" :title="rule.active ? 'Desactivar' : 'Activar'"
                class="p-2 rounded-lg" :class="rule.active ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'">
                <svg v-if="rule.active" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button @click="deleteRule(rule.id)"
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Tab -->
    <div v-if="activeTab === 'log'">
      <div v-if="log.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400">No hay mensajes de seguimiento enviados aun</p>
      </div>
      <div v-else class="space-y-2">
        <div v-for="entry in log" :key="entry.id"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-gray-900 dark:text-white">{{ entry.contact_name || entry.phone_number }}</span>
              <span class="text-gray-400 dark:text-gray-500">{{ entry.rule_name }}</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{{ entry.message_sent }}</p>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{{ formatDateTime(entry.sent_at) }}</span>
        </div>
      </div>
    </div>

    <!-- New Rule Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showForm = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nueva regla de seguimiento</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input v-model="form.name" type="text" placeholder="Ej: Seguimiento post-compra"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disparador</label>
              <select v-model="form.trigger_type"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none">
                <option value="days_after_last_contact">Dias sin contacto</option>
                <option value="days_after_appointment">Dias post-cita</option>
                <option value="days_after_purchase">Dias post-compra</option>
                <option value="recurring">Recurrente</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dias de espera</label>
              <input v-model.number="form.delay_days" type="number" min="1" max="365"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audiencia</label>
            <select v-model="form.target_audience"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="all">Todos los clientes</option>
              <option value="with_appointments">Con citas previas</option>
              <option value="without_appointments">Sin citas previas</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
            <textarea v-model="form.message_template" rows="3"
              placeholder="Hola {nombre}! Han pasado unos dias, queriamos saber si necesitas algo mas..."
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" />
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Variables: {nombre}, {bot_name}, {negocio}</p>
          </div>

          <div v-if="formError" class="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            {{ formError }}
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button @click="showForm = false"
              class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Cancelar
            </button>
            <button @click="createRule" :disabled="formLoading"
              class="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {{ formLoading ? 'Creando...' : 'Crear regla' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../lib/api'

const rules = ref([])
const log = ref([])
const stats = ref(null)
const loading = ref(true)
const activeTab = ref('rules')
const showForm = ref(false)
const formLoading = ref(false)
const formError = ref('')
const executing = ref(false)

const form = ref({
  name: '', trigger_type: 'days_after_last_contact', delay_days: 15,
  message_template: '', target_audience: 'all'
})

onMounted(async () => {
  await Promise.all([fetchRules(), fetchStats()])
})

async function fetchRules() {
  loading.value = true
  try {
    const { data } = await api.get('/followups/rules')
    rules.value = data.rules
  } catch (e) { console.error(e) }
  loading.value = false
}

async function fetchStats() {
  try {
    const { data } = await api.get('/followups/stats')
    stats.value = data.stats
  } catch (e) { console.error(e) }
}

async function fetchLog() {
  try {
    const { data } = await api.get('/followups/log')
    log.value = data.log
  } catch (e) { console.error(e) }
}

async function createRule() {
  formError.value = ''
  if (!form.value.name || !form.value.message_template) {
    formError.value = 'Nombre y mensaje son requeridos'
    return
  }
  formLoading.value = true
  try {
    const { data } = await api.post('/followups/rules', form.value)
    rules.value.unshift(data.rule)
    showForm.value = false
    form.value = { name: '', trigger_type: 'days_after_last_contact', delay_days: 15, message_template: '', target_audience: 'all' }
    fetchStats()
  } catch (e) {
    formError.value = e.response?.data?.error || 'Error creando regla'
  }
  formLoading.value = false
}

async function toggleRule(rule) {
  try {
    const { data } = await api.put(`/followups/rules/${rule.id}`, { active: !rule.active })
    const idx = rules.value.findIndex(r => r.id === rule.id)
    if (idx !== -1) rules.value[idx] = data.rule
    fetchStats()
  } catch (e) { console.error(e) }
}

async function deleteRule(id) {
  if (!confirm('Eliminar esta regla y su historial?')) return
  try {
    await api.delete(`/followups/rules/${id}`)
    rules.value = rules.value.filter(r => r.id !== id)
    fetchStats()
  } catch (e) { console.error(e) }
}

async function executeNow() {
  executing.value = true
  try {
    const { data } = await api.post('/followups/execute')
    alert(`Enviados: ${data.sentCount} mensajes, Omitidos: ${data.skippedCount}`)
    fetchStats()
    if (activeTab.value === 'log') fetchLog()
  } catch (e) {
    alert(e.response?.data?.error || 'Error ejecutando seguimientos')
  }
  executing.value = false
}

function triggerLabel(type) {
  const labels = {
    days_after_last_contact: 'Dias sin contacto',
    days_after_appointment: 'Dias post-cita',
    days_after_purchase: 'Dias post-compra',
    recurring: 'Recurrente'
  }
  return labels[type] || type
}

function audienceLabel(audience) {
  const labels = { all: 'Todos', with_appointments: 'Con citas', without_appointments: 'Sin citas' }
  return labels[audience] || audience
}

function formatDateTime(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}
</script>
