<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <!-- Loading -->
    <div v-if="loading" class="text-center">
      <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500 dark:text-gray-400 text-sm">Cargando cita...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center">
      <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
      </div>
      <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Cita no encontrada</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">El enlace que usaste no es valido o la cita ya no existe.</p>
    </div>

    <!-- Appointment Card -->
    <div v-else-if="appointment" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden">
      <!-- Business Header -->
      <div class="bg-primary-600 dark:bg-primary-700 px-6 py-5 text-center">
        <h1 class="text-xl font-bold text-white">{{ appointment.business_name || 'Tu cita' }}</h1>
        <p v-if="appointment.business_address" class="text-primary-100 text-sm mt-1">{{ appointment.business_address }}</p>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-5">
        <!-- Title & Status -->
        <div class="text-center">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ appointment.title }}</h2>
          <span class="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full" :class="statusBadgeClass">
            {{ statusLabel }}
          </span>
        </div>

        <!-- Date & Time -->
        <div class="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formattedDate }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ appointment.time }} &mdash; {{ appointment.duration_minutes || 60 }} minutos</p>
          </div>
        </div>

        <!-- Location -->
        <div v-if="appointment.business_address" class="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div class="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">Ubicacion</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ appointment.business_address }}</p>
          </div>
        </div>

        <!-- Description -->
        <div v-if="appointment.description" class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">{{ appointment.description }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="confirmMessage" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <svg class="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm font-medium text-green-700 dark:text-green-300">{{ confirmMessage }}</p>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <!-- Confirm Button (only if scheduled) -->
          <button
            v-if="appointment.status === 'scheduled'"
            @click="confirmAppointment"
            :disabled="confirming"
            class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg v-if="!confirming" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <div v-if="confirming" class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            {{ confirming ? 'Confirmando...' : 'Confirmar cita' }}
          </button>

          <!-- Already confirmed -->
          <div v-if="appointment.status === 'confirmed'" class="w-full py-3 px-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-semibold rounded-xl text-sm text-center flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Cita confirmada
          </div>

          <!-- Cancelled -->
          <div v-if="appointment.status === 'cancelled'" class="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-semibold rounded-xl text-sm text-center">
            Esta cita fue cancelada
          </div>

          <!-- Completed -->
          <div v-if="appointment.status === 'completed'" class="w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold rounded-xl text-sm text-center">
            Esta cita ya fue completada
          </div>

          <!-- Add to calendar -->
          <button
            @click="downloadIcs"
            class="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Agregar al calendario
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="appointment.business_phone" class="border-t border-gray-200 dark:border-gray-700 px-6 py-4 text-center">
        <p class="text-xs text-gray-400 dark:text-gray-500">Contacto: {{ appointment.business_phone }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const appointment = ref(null)
const loading = ref(true)
const error = ref(false)
const confirming = ref(false)
const confirmMessage = ref('')

const DAYS = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado']
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

const formattedDate = computed(() => {
  if (!appointment.value) return ''
  const d = new Date(appointment.value.date + 'T12:00:00')
  return `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
})

const statusLabel = computed(() => {
  if (!appointment.value) return ''
  const map = { scheduled: 'Programada', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada', no_show: 'No asistio' }
  return map[appointment.value.status] || appointment.value.status
})

const statusBadgeClass = computed(() => {
  if (!appointment.value) return ''
  const map = {
    scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    completed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    no_show: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  }
  return map[appointment.value.status] || ''
})

onMounted(async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || ''
    const { data } = await axios.get(`${baseUrl}/api/appointments/confirm/${route.params.token}`)
    appointment.value = data.appointment
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
})

async function confirmAppointment() {
  confirming.value = true
  try {
    const baseUrl = import.meta.env.VITE_API_URL || ''
    const { data } = await axios.post(`${baseUrl}/api/appointments/confirm/${route.params.token}`)
    appointment.value = data.appointment
    confirmMessage.value = data.message || 'Cita confirmada exitosamente'
  } catch (e) {
    confirmMessage.value = ''
    alert(e.response?.data?.error || 'Error al confirmar la cita')
  } finally {
    confirming.value = false
  }
}

function downloadIcs() {
  const appt = appointment.value
  if (!appt) return
  const start = new Date(`${appt.date}T${appt.time}`)
  const end = new Date(start.getTime() + (appt.duration_minutes || 60) * 60000)
  const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SellMate//ES',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${appt.title}`,
    `LOCATION:${appt.business_address || ''}`,
    `DESCRIPTION:${appt.business_name || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `cita-${appt.date}.ics`
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>
