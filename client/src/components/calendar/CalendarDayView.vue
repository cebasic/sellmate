<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Day header -->
    <div class="grid border-b border-gray-200 dark:border-gray-700" style="grid-template-columns: 56px 1fr">
      <div class="border-r border-gray-200 dark:border-gray-700"></div>
      <div class="py-3 px-4" :class="isToday ? 'bg-primary-50 dark:bg-primary-900/10' : ''">
        <p class="text-sm font-bold" :class="isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'">
          {{ dayLabel }}
        </p>
        <p v-if="dayAppointments.length" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {{ dayAppointments.length }} cita{{ dayAppointments.length !== 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <!-- Time grid -->
    <div ref="scrollContainer" class="overflow-y-auto" style="max-height: calc(100vh - 320px)">
      <div class="grid relative" style="grid-template-columns: 56px 1fr">
        <!-- Hour rows -->
        <template v-for="slot in hourSlots" :key="slot.hour">
          <div class="h-[60px] text-right pr-2 text-[10px] text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700 flex items-start justify-end -mt-0.5 pt-0">
            {{ slot.label }}
          </div>
          <div class="h-[60px] border-b border-gray-100 dark:border-gray-700/30 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
            @click="$emit('create-at-slot', dateKey, slot.label)">
          </div>
        </template>

        <!-- Appointment blocks -->
        <div class="absolute top-0 bottom-0 pointer-events-none" style="left: 56px; right: 0">
          <div v-for="appt in positionedAppointments" :key="appt.id"
            class="absolute left-1 right-1 rounded-lg px-3 py-2 overflow-hidden cursor-pointer pointer-events-auto transition-opacity hover:opacity-90 border-l-4"
            :class="blockClass(appt.status)"
            :style="{ top: appt.topPx + 'px', height: Math.max(appt.heightPx, 28) + 'px' }"
            @click="$emit('select-appointment', appt)">
            <div class="flex items-start justify-between">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold truncate">{{ appt.title }}</p>
                <p class="text-xs truncate opacity-80">{{ appt.time }} - {{ appt.contact_name || appt.phone_number }}</p>
                <p v-if="appt.heightPx >= 50 && appt.description" class="text-[10px] mt-0.5 truncate opacity-60">{{ appt.description }}</p>
              </div>
              <span class="text-[10px] font-medium opacity-70 ml-2 whitespace-nowrap">{{ appt.duration_minutes }} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useCalendar } from '../../composables/useCalendar'

const props = defineProps({
  appointments: { type: Array, required: true },
  currentDate: { type: Date, required: true }
})

defineEmits(['select-appointment', 'create-at-slot'])

const { formatDateKey, todayKey, getHourSlots, MONTHS } = useCalendar()

const START_HOUR = 6
const scrollContainer = ref(null)

const DAYS_LONG = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado']

const dateKey = computed(() => formatDateKey(props.currentDate))
const isToday = computed(() => dateKey.value === todayKey())

const dayLabel = computed(() => {
  const d = props.currentDate
  return `${DAYS_LONG[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`
})

const hourSlots = computed(() => getHourSlots(START_HOUR, 22))

const dayAppointments = computed(() => {
  return props.appointments
    .filter(a => a.date === dateKey.value)
    .sort((a, b) => a.time.localeCompare(b.time))
})

const positionedAppointments = computed(() => {
  return dayAppointments.value.map(a => {
    const [h, m] = a.time.split(':').map(Number)
    const minutesFromStart = (h - START_HOUR) * 60 + (m || 0)
    const duration = a.duration_minutes || 60
    return {
      ...a,
      topPx: Math.max(minutesFromStart, 0),
      heightPx: duration
    }
  }).filter(a => a.topPx >= 0)
})

function blockClass(status) {
  const map = {
    scheduled: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-500',
    confirmed: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-500',
    completed: 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-gray-400',
    cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-500',
    no_show: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-500'
  }
  return map[status] || 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-400'
}

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = (8 - START_HOUR) * 60
  }
})
</script>
