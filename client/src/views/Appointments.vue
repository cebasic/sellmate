<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Citas</h2>
      <button @click="openCreateModal()" class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Nueva cita
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-2xl font-bold text-primary-600">{{ stats.upcoming }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Proximas</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-2xl font-bold text-green-600">{{ stats.confirmed }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Confirmadas</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-2xl font-bold text-yellow-600">{{ stats.today }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Hoy</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <p class="text-2xl font-bold text-gray-600">{{ stats.total }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
      </div>
    </div>

    <!-- Calendar Header -->
    <CalendarHeader
      :current-view="currentView"
      :title="headerTitle"
      @update:view="currentView = $event"
      @navigate="$event === 'prev' ? goPrev() : goNext()"
      @today="goToday()"
    />

    <!-- Calendar Views -->
    <CalendarMonthView
      v-if="currentView === 'month'"
      :appointments="appointments"
      :current-date="currentDate"
      @select-appointment="openDetail"
      @create-at-date="openCreateModalWithDate"
    />

    <CalendarWeekView
      v-if="currentView === 'week'"
      :appointments="appointments"
      :current-date="currentDate"
      @select-appointment="openDetail"
      @create-at-slot="openCreateModalWithSlot"
    />

    <CalendarDayView
      v-if="currentView === 'day'"
      :appointments="appointments"
      :current-date="currentDate"
      @select-appointment="openDetail"
      @create-at-slot="openCreateModalWithSlot"
    />

    <!-- Appointment Detail Modal -->
    <AppointmentDetailModal
      v-if="showDetailModal && selectedAppointment"
      :appointment="selectedAppointment"
      @close="showDetailModal = false; selectedAppointment = null"
      @saved="handleSaved"
    />

    <!-- New Appointment Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showForm = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nueva cita</h3>
        <div class="space-y-3">
          <input v-model="form.phone_number" type="text" placeholder="Telefono del cliente"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
          <input v-model="form.contact_name" type="text" placeholder="Nombre del cliente (opcional)"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
          <input v-model="form.title" type="text" placeholder="Titulo de la cita"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
          <textarea v-model="form.description" placeholder="Descripcion (opcional)" rows="2"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
          <div class="grid grid-cols-2 gap-3">
            <input v-model="form.date" type="date"
              class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
            <input v-model="form.time" type="time"
              class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
          </div>
          <input v-model.number="form.duration_minutes" type="number" placeholder="Duracion (minutos)" min="15" step="15"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
          <div v-if="formError" class="text-sm text-red-600 dark:text-red-400">{{ formError }}</div>
          <div class="flex gap-3 pt-2">
            <button @click="showForm = false" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancelar
            </button>
            <button @click="createAppointment" :disabled="creating" class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm disabled:opacity-50">
              {{ creating ? 'Creando...' : 'Crear cita' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../lib/api'
import { useCalendar } from '../composables/useCalendar'
import CalendarHeader from '../components/calendar/CalendarHeader.vue'
import CalendarMonthView from '../components/calendar/CalendarMonthView.vue'
import CalendarWeekView from '../components/calendar/CalendarWeekView.vue'
import CalendarDayView from '../components/calendar/CalendarDayView.vue'
import AppointmentDetailModal from '../components/calendar/AppointmentDetailModal.vue'

const { currentDate, currentView, headerTitle, goToday, goPrev, goNext } = useCalendar()

const appointments = ref([])
const showForm = ref(false)
const creating = ref(false)
const formError = ref('')

// Detail modal
const selectedAppointment = ref(null)
const showDetailModal = ref(false)

const form = ref({
  phone_number: '', contact_name: '', title: '', description: '',
  date: '', time: '', duration_minutes: 60
})

const stats = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return {
    total: appointments.value.length,
    upcoming: appointments.value.filter(a => ['scheduled', 'confirmed'].includes(a.status) && a.date >= today).length,
    confirmed: appointments.value.filter(a => a.status === 'confirmed').length,
    today: appointments.value.filter(a => a.date === today && ['scheduled', 'confirmed'].includes(a.status)).length
  }
})

onMounted(fetchAppointments)

async function fetchAppointments() {
  try {
    const { data } = await api.get('/appointments')
    appointments.value = data.appointments
  } catch (e) { /* ignore */ }
}

// === Modal handlers ===

function openCreateModal() {
  form.value = { phone_number: '', contact_name: '', title: '', description: '', date: '', time: '', duration_minutes: 60 }
  formError.value = ''
  showForm.value = true
}

function openCreateModalWithDate(dateKey) {
  form.value = { phone_number: '', contact_name: '', title: '', description: '', date: dateKey, time: '', duration_minutes: 60 }
  formError.value = ''
  showForm.value = true
}

function openCreateModalWithSlot(dateKey, timeStr) {
  form.value = { phone_number: '', contact_name: '', title: '', description: '', date: dateKey, time: timeStr, duration_minutes: 60 }
  formError.value = ''
  showForm.value = true
}

function openDetail(appt) {
  selectedAppointment.value = appt
  showDetailModal.value = true
}

// === API actions ===

async function createAppointment() {
  formError.value = ''
  if (!form.value.phone_number || !form.value.title || !form.value.date || !form.value.time) {
    formError.value = 'Telefono, titulo, fecha y hora son requeridos'
    return
  }
  creating.value = true
  try {
    await api.post('/appointments', form.value)
    showForm.value = false
    await fetchAppointments()
  } catch (err) {
    formError.value = err.response?.data?.error || 'Error al crear cita'
  } finally {
    creating.value = false
  }
}

function handleSaved(updatedAppt) {
  const idx = appointments.value.findIndex(a => a.id === updatedAppt.id)
  if (idx !== -1) {
    appointments.value[idx] = updatedAppt
  }
  fetchAppointments()
}
</script>
