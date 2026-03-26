<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-xl">
      <!-- Header -->
      <div class="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">{{ editForm.title }}</h3>
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
      <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
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

        <!-- Editable: Title -->
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Titulo</label>
          <input v-model="editForm.title" type="text"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
        </div>

        <!-- Editable: Date & Time -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha</label>
            <input v-model="editForm.date" type="date"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hora</label>
            <input v-model="editForm.time" type="time"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
          </div>
        </div>

        <!-- Editable: Duration -->
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Duracion (minutos)</label>
          <input v-model.number="editForm.duration_minutes" type="number" min="15" step="15"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
        </div>

        <!-- Editable: Description -->
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Descripcion</label>
          <textarea v-model="editForm.description" rows="2"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
        </div>

        <!-- Editable: Notes -->
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Notas</label>
          <textarea v-model="editForm.notes" rows="2" placeholder="Notas internas..."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm" />
        </div>

        <!-- Status change -->
        <div>
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</label>
          <select v-model="editForm.status"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg">
            <option value="scheduled">Programada</option>
            <option value="confirmed">Confirmada</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
            <option value="no_show">No asistio</option>
          </select>
        </div>

        <!-- Status changed notification -->
        <div v-if="statusChanged" class="space-y-3">
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p class="text-sm text-amber-700 dark:text-amber-300">
              El estado cambio de <span class="font-semibold">{{ originalStatusLabel }}</span> a <span class="font-semibold">{{ newStatusLabel }}</span>
            </p>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="notifyCustomer" type="checkbox" class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Notificar al cliente por WhatsApp</span>
          </label>
        </div>

        <!-- Confirmation link -->
        <div v-if="appointment.confirm_token" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Link de confirmacion</label>
          <div class="flex items-center gap-2">
            <input readonly :value="confirmUrl" class="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg truncate" />
            <button @click="copyLink" class="px-3 py-1.5 text-xs font-medium text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors whitespace-nowrap">
              {{ copied ? 'Copiado' : 'Copiar' }}
            </button>
          </div>
        </div>

        <!-- Success/Error messages -->
        <div v-if="saveSuccess" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
          <p class="text-sm text-green-700 dark:text-green-300">Cita guardada exitosamente</p>
        </div>
        <div v-if="saveError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
          <p class="text-sm text-red-700 dark:text-red-300">{{ saveError }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center gap-2 p-5 border-t border-gray-200 dark:border-gray-700">
        <button @click="$emit('close')"
          class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Cancelar
        </button>
        <button @click="saveAppointment" :disabled="saving"
          class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50">
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import api from '../../lib/api'

const props = defineProps({
  appointment: { type: Object, required: true }
})

const emit = defineEmits(['close', 'saved'])

const editForm = reactive({
  title: props.appointment.title || '',
  date: props.appointment.date || '',
  time: props.appointment.time || '',
  duration_minutes: props.appointment.duration_minutes || 60,
  description: props.appointment.description || '',
  notes: props.appointment.notes || '',
  status: props.appointment.status || 'scheduled'
})

const notifyCustomer = ref(false)
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')
const copied = ref(false)

const originalStatus = props.appointment.status

const STATUS_LABELS = { scheduled: 'Programada', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada', no_show: 'No asistio' }

const statusChanged = computed(() => editForm.status !== originalStatus)
const originalStatusLabel = computed(() => STATUS_LABELS[originalStatus] || originalStatus)
const newStatusLabel = computed(() => STATUS_LABELS[editForm.status] || editForm.status)
const statusLabel = computed(() => STATUS_LABELS[editForm.status] || editForm.status)

const statusBadgeClass = computed(() => {
  const map = {
    scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    completed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    no_show: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
  }
  return map[editForm.status] || ''
})

const confirmUrl = computed(() => {
  if (!props.appointment.confirm_token) return ''
  const base = window.location.origin
  return `${base}/cita/${props.appointment.confirm_token}`
})

async function copyLink() {
  try {
    await navigator.clipboard.writeText(confirmUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) { /* ignore */ }
}

async function saveAppointment() {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  try {
    const payload = {
      title: editForm.title,
      date: editForm.date,
      time: editForm.time,
      duration_minutes: editForm.duration_minutes,
      description: editForm.description,
      notes: editForm.notes,
      status: editForm.status,
      notify_customer: statusChanged.value && notifyCustomer.value
    }
    const { data } = await api.put(`/appointments/${props.appointment.id}`, payload)
    saveSuccess.value = true
    // Update the appointment object in parent
    Object.assign(props.appointment, data.appointment)
    emit('saved', data.appointment)
    setTimeout(() => { emit('close') }, 800)
  } catch (err) {
    saveError.value = err.response?.data?.error || 'Error al guardar la cita'
  } finally {
    saving.value = false
  }
}
</script>
