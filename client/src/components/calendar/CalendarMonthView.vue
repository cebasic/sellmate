<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Day name headers -->
    <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
      <div v-for="day in dayNames" :key="day"
        class="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7">
      <div v-for="(cell, idx) in cells" :key="cell.dateKey"
        class="min-h-[110px] p-1.5 border-b border-r border-gray-100 dark:border-gray-700/50 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
        :class="{
          'bg-gray-50/50 dark:bg-gray-900/30': !cell.isCurrentMonth,
          'border-r-0': (idx + 1) % 7 === 0
        }"
        @click="$emit('create-at-date', cell.dateKey)">

        <!-- Day number -->
        <div class="flex items-center justify-between mb-1">
          <span v-if="cell.isToday"
            class="w-7 h-7 flex items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
            {{ cell.dayNumber }}
          </span>
          <span v-else class="text-xs font-medium px-1"
            :class="cell.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'">
            {{ cell.dayNumber }}
          </span>
        </div>

        <!-- Appointment chips -->
        <div class="space-y-0.5">
          <div v-for="appt in getCellAppointments(cell.dateKey).slice(0, 3)" :key="appt.id"
            class="text-[10px] leading-tight px-1.5 py-0.5 rounded truncate cursor-pointer transition-colors"
            :class="chipClass(appt.status)"
            @click.stop="$emit('select-appointment', appt)">
            <span class="font-semibold">{{ appt.time }}</span> {{ appt.title }}
          </div>
          <p v-if="getCellAppointments(cell.dateKey).length > 3"
            class="text-[10px] text-gray-500 dark:text-gray-400 pl-1 font-medium">
            +{{ getCellAppointments(cell.dateKey).length - 3 }} mas
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCalendar } from '../../composables/useCalendar'

const props = defineProps({
  appointments: { type: Array, required: true },
  currentDate: { type: Date, required: true }
})

defineEmits(['select-appointment', 'create-at-date'])

const { getMonthGrid, buildAppointmentsByDate, DAYS_SHORT } = useCalendar()

const dayNames = DAYS_SHORT

const cells = computed(() => getMonthGrid(props.currentDate))

const appointmentsByDate = computed(() => buildAppointmentsByDate(props.appointments))

function getCellAppointments(dateKey) {
  return appointmentsByDate.value.get(dateKey) || []
}

function chipClass(status) {
  const map = {
    scheduled: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    confirmed: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    completed: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
    cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    no_show: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
  }
  return map[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
}
</script>
