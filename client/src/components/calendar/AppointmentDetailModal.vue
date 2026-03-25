<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-xl">
      <!-- Header -->
      <div class="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">{{ appointment.title }}</h3>
            <span class="px-2 py-0.5 text-[10px] rounded-full font-semibold whitespace-nowrap" :class="statusBadgeClass">
              {{ statusLabel }}
            </span>
          </div>
          <p v-if="appointment.created_by === 'bot'" class="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Creada por el bot
          </p>
        </div>
        <button @click="$emit('close')"
          class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-5 space-y-4">
        <!-- Contact -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ appointment.contact_name || 'Sin nombre' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ appointment.phone_number }}</p>
          </div>
        </div>

        <!-- Date & Time -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ formattedDate }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ appointment.time }} &mdash; {{ appointment.duration_minutes }} min</p>
          </div>
        </div>

        <!-- Description -->
        <div v-if="appointment.description" class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
            </svg>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 pt-1">{{ appointment.description }}</p>
        </div>

        <!-- Status change -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Cambiar estado</label>
            <select :value="appointment.status" @change="$emit('update-status', appointment, $event.target.value)"
              class="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg">
              <option value="scheduled">Programada</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
              <option value="no_show">No asistio</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="flex items-center gap-2 p-5 border-t border-gray-200 dark:border-gray-700">
        <button @click="$emit('send-ics', appointment)"
          class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          Enviar al cliente
        </button>
        <button @click="$emit('download-ics', appointment)"
          class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Descargar .ics
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  appointment: { type: Object, required: true }
})

defineEmits(['close', 'update-status', 'send-ics', 'download-ics'])

const DAYS = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado']
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

const formattedDate = computed(() => {
  const d = new Date(props.appointment.date + 'T12:00:00')
  return `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
})

const statusLabel = computed(() => {
  const map = { scheduled: 'Programada', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada', no_show: 'No asistio' }
  return map[props.appointment.status] || props.appointment.status
})

const statusBadgeClass = computed(() => {
  const map = {
    scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    completed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    no_show: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  }
  return map[props.appointment.status] || ''
})
</script>
