<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header row: day names -->
    <div class="grid border-b border-gray-200 dark:border-gray-700" style="grid-template-columns: 56px repeat(7, 1fr)">
      <div class="border-r border-gray-200 dark:border-gray-700"></div>
      <div v-for="day in weekDays" :key="day.dateKey"
        class="py-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0"
        :class="day.isToday ? 'bg-primary-50 dark:bg-primary-900/10' : ''">
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ day.dayName }}</p>
        <p class="text-sm font-bold mt-0.5"
          :class="day.isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'">
          {{ day.dayNumber }}
        </p>
      </div>
    </div>

    <!-- Time grid body -->
    <div ref="scrollContainer" class="overflow-y-auto" style="max-height: calc(100vh - 320px)">
      <div class="grid relative" style="grid-template-columns: 56px repeat(7, 1fr)">
        <!-- Hour rows -->
        <template v-for="slot in hourSlots" :key="slot.hour">
          <!-- Hour label -->
          <div class="h-[60px] text-right pr-2 text-[10px] text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700 flex items-start justify-end -mt-0.5 pt-0">
            {{ slot.label }}
          </div>
          <!-- Day columns for this hour -->
          <div v-for="day in weekDays" :key="`${slot.hour}-${day.dateKey}`"
            class="h-[60px] border-b border-r border-gray-100 dark:border-gray-700/30 last:border-r-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
            :class="day.isToday ? 'bg-primary-50/30 dark:bg-primary-900/5' : ''"
            @click="$emit('create-at-slot', day.dateKey, slot.label)">
          </div>
        </template>

        <!-- Appointment blocks overlaid -->
        <div v-for="(day, dayIdx) in weekDays" :key="'appts-' + day.dateKey"
          class="absolute top-0 bottom-0 pointer-events-none"
          :style="{ left: `calc(56px + (100% - 56px) / 7 * ${dayIdx})`, width: `calc((100% - 56px) / 7)` }">
          <div v-for="appt in getPositionedAppointments(day.dateKey)" :key="appt.id"
            class="absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 overflow-hidden cursor-pointer pointer-events-auto transition-opacity hover:opacity-90 border-l-[3px]"
            :class="blockClass(appt.status)"
            :style="{ top: appt.topPx + 'px', height: Math.max(appt.heightPx, 20) + 'px' }"
            @click="$emit('select-appointment', appt)">
            <p class="text-[10px] font-bold truncate leading-tight">{{ appt.title }}</p>
            <p class="text-[9px] truncate leading-tight opacity-80">{{ appt.time }} - {{ appt.contact_name || appt.phone_number }}</p>
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

const { getWeekDays, getHourSlots, buildAppointmentsByDate } = useCalendar()

const START_HOUR = 6
const scrollContainer = ref(null)

const weekDays = computed(() => getWeekDays(props.currentDate))
const hourSlots = computed(() => getHourSlots(START_HOUR, 22))
const appointmentsByDate = computed(() => buildAppointmentsByDate(props.appointments))

function getPositionedAppointments(dateKey) {
  const dayAppts = appointmentsByDate.value.get(dateKey) || []
  return dayAppts.map(a => {
    const [h, m] = a.time.split(':').map(Number)
    const minutesFromStart = (h - START_HOUR) * 60 + (m || 0)
    const duration = a.duration_minutes || 60
    return {
      ...a,
      topPx: Math.max(minutesFromStart, 0),
      heightPx: duration
    }
  }).filter(a => a.topPx >= 0)
}

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
  // Scroll to 8am by default
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = (8 - START_HOUR) * 60
  }
})
</script>
