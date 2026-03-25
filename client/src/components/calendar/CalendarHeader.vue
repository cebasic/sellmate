<template>
  <div class="flex items-center justify-between mb-4">
    <!-- Left: Navigation -->
    <div class="flex items-center gap-2">
      <button @click="$emit('navigate', 'prev')"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <button @click="$emit('navigate', 'next')"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
      <button @click="$emit('today')"
        class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        Hoy
      </button>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white ml-2">{{ title }}</h3>
    </div>

    <!-- Right: View switcher -->
    <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
      <button v-for="v in views" :key="v.key"
        @click="$emit('update:view', v.key)"
        class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
        :class="currentView === v.key
          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'">
        {{ v.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentView: { type: String, required: true },
  title: { type: String, required: true }
})

defineEmits(['update:view', 'navigate', 'today'])

const views = [
  { key: 'month', label: 'Mes' },
  { key: 'week', label: 'Semana' },
  { key: 'day', label: 'Dia' }
]
</script>
