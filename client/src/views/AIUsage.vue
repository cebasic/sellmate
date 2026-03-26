<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <router-link to="/ai-settings"
          class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </router-link>
        <div>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Consumo de IA</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Analisis detallado del uso de inteligencia artificial</p>
        </div>
      </div>

      <!-- Currency + Date range -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Currency selector -->
        <select v-model="selectedCurrency"
          class="px-2.5 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
          <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.flag }} {{ c.code }}</option>
        </select>

        <div class="w-px h-6 bg-gray-200 dark:bg-gray-600 hidden sm:block"></div>

        <button v-for="preset in datePresets" :key="preset.days" @click="setPreset(preset.days)"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="activeDays === preset.days
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
          {{ preset.label }}
        </button>
        <div class="flex items-center gap-1.5">
          <input type="date" v-model="startDate"
            class="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          <span class="text-gray-400 text-xs">-</span>
          <input type="date" v-model="endDate"
            class="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          <button @click="activeDays = null; fetchData()"
            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors">
            Aplicar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
    </div>

    <div v-else class="space-y-6">
      <!-- Summary cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Requests</span>
          </div>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ formatNumber(summary.total_requests) }}</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Tokens Consumidos</span>
          </div>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ formatNumber(summary.total_tokens) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span class="text-blue-500">{{ formatNumber(summary.input_tokens) }} in</span> /
            <span class="text-green-500">{{ formatNumber(summary.output_tokens) }} out</span>
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Costo Estimado</span>
          </div>
          <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ currencySymbol }}{{ formatCost(convertCost(summary.estimated_cost)) }}</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Costo Promedio / Req</span>
          </div>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ currencySymbol }}{{ formatCostPrecise(convertCost(summary.avg_cost_per_request)) }}</p>
        </div>
      </div>

      <!-- Charts grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Line chart: Daily tokens -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-800 dark:text-white mb-4">Consumo Diario</h3>
          <div class="h-64">
            <Line v-if="dailyTokensData" :data="dailyTokensData" :options="lineChartOptions" />
            <div v-else class="flex items-center justify-center h-full text-sm text-gray-400">Sin datos</div>
          </div>
        </div>

        <!-- Bar chart: Requests per day -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-800 dark:text-white mb-4">Requests por Dia</h3>
          <div class="h-64">
            <Bar v-if="dailyRequestsData" :data="dailyRequestsData" :options="barChartOptions" />
            <div v-else class="flex items-center justify-center h-full text-sm text-gray-400">Sin datos</div>
          </div>
        </div>

        <!-- Doughnut: Distribution by model -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-800 dark:text-white mb-4">Distribucion por Modelo</h3>
          <div class="h-64 flex items-center justify-center">
            <Doughnut v-if="modelDistData" :data="modelDistData" :options="doughnutOptions" />
            <div v-else class="text-sm text-gray-400">Sin datos</div>
          </div>
        </div>

        <!-- Bar chart: Cost by provider -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-800 dark:text-white mb-4">Costo por Provider</h3>
          <div class="h-64">
            <Bar v-if="providerCostData" :data="providerCostData" :options="horizontalBarOptions" />
            <div v-else class="flex items-center justify-center h-full text-sm text-gray-400">Sin datos</div>
          </div>
        </div>
      </div>

      <!-- History table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-800 dark:text-white">Historial Detallado</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50">
                <th v-for="col in tableColumns" :key="col.key"
                  @click="toggleSort(col.key)"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none">
                  <span class="flex items-center gap-1">
                    {{ col.label }}
                    <svg v-if="sortKey === col.key" class="w-3 h-3" :class="sortDir === 'asc' ? '' : 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                    </svg>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="row in paginatedRows" :key="row.date + row.provider + row.model"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td class="px-4 py-3 text-gray-800 dark:text-gray-200">{{ row.date }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full" :class="providerDot(row.provider)"></span>
                    <span class="text-gray-800 dark:text-gray-200">{{ row.provider }}</span>
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{{ row.model }}</td>
                <td class="px-4 py-3 text-gray-800 dark:text-gray-200">{{ formatNumber(row.requests) }}</td>
                <td class="px-4 py-3 text-blue-600 dark:text-blue-400">{{ formatNumber(row.input_tokens) }}</td>
                <td class="px-4 py-3 text-green-600 dark:text-green-400">{{ formatNumber(row.output_tokens) }}</td>
                <td class="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{{ currencySymbol }}{{ formatCostPrecise(convertCost(row.cost)) }}</td>
              </tr>
              <tr v-if="sortedRows.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-gray-400">No hay datos para el periodo seleccionado</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Mostrando {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, sortedRows.length) }} de {{ sortedRows.length }}
          </p>
          <div class="flex items-center gap-1">
            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
              class="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
              Anterior
            </button>
            <span class="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import api from '../lib/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

// Currencies
const currencies = [
  { code: 'USD', symbol: '$', flag: '🇺🇸', rate: 1 },
  { code: 'MXN', symbol: '$', flag: '🇲🇽', rate: 17.15 },
  { code: 'COP', symbol: '$', flag: '🇨🇴', rate: 4150 },
  { code: 'ARS', symbol: '$', flag: '🇦🇷', rate: 1065 },
  { code: 'CLP', symbol: '$', flag: '🇨🇱', rate: 940 },
  { code: 'PEN', symbol: 'S/', flag: '🇵🇪', rate: 3.72 },
  { code: 'BRL', symbol: 'R$', flag: '🇧🇷', rate: 5.05 },
  { code: 'UYU', symbol: '$', flag: '🇺🇾', rate: 42.5 },
  { code: 'BOB', symbol: 'Bs', flag: '🇧🇴', rate: 6.91 },
  { code: 'GTQ', symbol: 'Q', flag: '🇬🇹', rate: 7.75 },
  { code: 'DOP', symbol: 'RD$', flag: '🇩🇴', rate: 58.5 },
  { code: 'CRC', symbol: '₡', flag: '🇨🇷', rate: 510 },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', rate: 0.92 },
]

const selectedCurrency = ref(localStorage.getItem('aiUsageCurrency') || 'USD')
const exchangeRates = ref(Object.fromEntries(currencies.map(c => [c.code, c.rate])))

// Fetch live rates on mount
async function fetchExchangeRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await res.json()
    if (data?.rates) {
      for (const c of currencies) {
        if (data.rates[c.code]) exchangeRates.value[c.code] = data.rates[c.code]
      }
    }
  } catch (e) {
    // Keep fallback rates
  }
}

watch(selectedCurrency, (v) => localStorage.setItem('aiUsageCurrency', v))

const currencySymbol = computed(() => {
  const c = currencies.find(c => c.code === selectedCurrency.value)
  return c ? c.symbol : '$'
})

function convertCost(usdAmount) {
  return (usdAmount || 0) * (exchangeRates.value[selectedCurrency.value] || 1)
}

// State
const loading = ref(true)
const startDate = ref('')
const endDate = ref('')
const activeDays = ref(30)
const detailedData = ref([])
const providerData = ref([])

// Summary
const summary = ref({
  total_requests: 0,
  total_tokens: 0,
  input_tokens: 0,
  output_tokens: 0,
  estimated_cost: 0,
  avg_cost_per_request: 0
})

// Table state
const sortKey = ref('date')
const sortDir = ref('desc')
const currentPage = ref(1)
const pageSize = 20

const datePresets = [
  { days: 7, label: '7 dias' },
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' }
]

const tableColumns = [
  { key: 'date', label: 'Fecha' },
  { key: 'provider', label: 'Provider' },
  { key: 'model', label: 'Modelo' },
  { key: 'requests', label: 'Requests' },
  { key: 'input_tokens', label: 'Input Tokens' },
  { key: 'output_tokens', label: 'Output Tokens' },
  { key: 'cost', label: 'Costo' }
]

const providerColors = {
  openai: { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgb(16, 185, 129)', dot: 'bg-emerald-500' },
  anthropic: { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgb(245, 158, 11)', dot: 'bg-amber-500' },
  gemini: { bg: 'rgba(99, 102, 241, 0.8)', border: 'rgb(99, 102, 241)', dot: 'bg-indigo-500' },
  custom: { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgb(168, 85, 247)', dot: 'bg-purple-500' }
}

// Helpers
function formatNumber(n) {
  return (n || 0).toLocaleString('es-CL')
}
function formatCost(n) {
  return Number(n || 0).toFixed(2)
}
function formatCostPrecise(n) {
  return Number(n || 0).toFixed(4)
}
function providerDot(provider) {
  return providerColors[provider]?.dot || 'bg-gray-400'
}

function getDateRange() {
  return { start_date: startDate.value, end_date: endDate.value }
}

function setPreset(days) {
  activeDays.value = days
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  startDate.value = start.toISOString().slice(0, 10)
  endDate.value = end.toISOString().slice(0, 10)
  fetchData()
}

function isDark() {
  return document.documentElement.classList.contains('dark')
}

// Chart data computeds
const dailyTokensData = computed(() => {
  if (!detailedData.value.length) return null
  // Aggregate by date
  const byDate = {}
  for (const row of detailedData.value) {
    if (!byDate[row.date]) byDate[row.date] = { input: 0, output: 0 }
    byDate[row.date].input += row.input_tokens || 0
    byDate[row.date].output += row.output_tokens || 0
  }
  const dates = Object.keys(byDate).sort()
  const dark = isDark()
  return {
    labels: dates,
    datasets: [
      {
        label: 'Input Tokens',
        data: dates.map(d => byDate[d].input),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2
      },
      {
        label: 'Output Tokens',
        data: dates.map(d => byDate[d].output),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2
      }
    ]
  }
})

const dailyRequestsData = computed(() => {
  if (!detailedData.value.length) return null
  // Aggregate by date + provider
  const byDate = {}
  const providerSet = new Set()
  for (const row of detailedData.value) {
    if (!byDate[row.date]) byDate[row.date] = {}
    byDate[row.date][row.provider] = (byDate[row.date][row.provider] || 0) + (row.requests || 0)
    providerSet.add(row.provider)
  }
  const dates = Object.keys(byDate).sort()
  const providers = [...providerSet]
  return {
    labels: dates,
    datasets: providers.map(p => ({
      label: p,
      data: dates.map(d => byDate[d][p] || 0),
      backgroundColor: providerColors[p]?.bg || 'rgba(156, 163, 175, 0.8)',
      borderColor: providerColors[p]?.border || 'rgb(156, 163, 175)',
      borderWidth: 1,
      borderRadius: 4
    }))
  }
})

const modelDistData = computed(() => {
  if (!detailedData.value.length) return null
  const byModel = {}
  for (const row of detailedData.value) {
    byModel[row.model] = (byModel[row.model] || 0) + (row.cost || 0)
  }
  const models = Object.keys(byModel)
  const colors = [
    'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
    'rgba(168, 85, 247, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(20, 184, 166, 0.8)',
    'rgba(236, 72, 153, 0.8)', 'rgba(99, 102, 241, 0.8)'
  ]
  return {
    labels: models,
    datasets: [{
      data: models.map(m => Number(convertCost(byModel[m]).toFixed(4))),
      backgroundColor: models.map((_, i) => colors[i % colors.length]),
      borderWidth: 0
    }]
  }
})

const providerCostData = computed(() => {
  if (!providerData.value.length && !detailedData.value.length) return null
  // Use providerData if available, else aggregate from detailed
  let byProvider = {}
  const source = providerData.value.length ? providerData.value : detailedData.value
  for (const row of source) {
    const p = row.provider
    byProvider[p] = (byProvider[p] || 0) + (row.cost || row.estimated_cost || 0)
  }
  const providers = Object.keys(byProvider)
  return {
    labels: providers,
    datasets: [{
      label: `Costo (${selectedCurrency.value})`,
      data: providers.map(p => Number(convertCost(byProvider[p]).toFixed(4))),
      backgroundColor: providers.map(p => providerColors[p]?.bg || 'rgba(156, 163, 175, 0.8)'),
      borderColor: providers.map(p => providerColors[p]?.border || 'rgb(156, 163, 175)'),
      borderWidth: 1,
      borderRadius: 4
    }]
  }
})

// Chart options
const chartTextColor = computed(() => isDark() ? '#9ca3af' : '#6b7280')
const gridColor = computed(() => isDark() ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)')

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { labels: { color: chartTextColor.value, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 } } },
    tooltip: { backgroundColor: isDark() ? '#1f2937' : '#fff', titleColor: isDark() ? '#fff' : '#111827', bodyColor: isDark() ? '#d1d5db' : '#4b5563', borderColor: isDark() ? '#374151' : '#e5e7eb', borderWidth: 1 }
  },
  scales: {
    x: { ticks: { color: chartTextColor.value, font: { size: 10 } }, grid: { color: gridColor.value } },
    y: { ticks: { color: chartTextColor.value, font: { size: 10 } }, grid: { color: gridColor.value } }
  }
}))

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: chartTextColor.value, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 } } },
    tooltip: { backgroundColor: isDark() ? '#1f2937' : '#fff', titleColor: isDark() ? '#fff' : '#111827', bodyColor: isDark() ? '#d1d5db' : '#4b5563', borderColor: isDark() ? '#374151' : '#e5e7eb', borderWidth: 1 }
  },
  scales: {
    x: { stacked: true, ticks: { color: chartTextColor.value, font: { size: 10 } }, grid: { color: gridColor.value } },
    y: { stacked: true, ticks: { color: chartTextColor.value, font: { size: 10 } }, grid: { color: gridColor.value } }
  }
}))

const horizontalBarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: isDark() ? '#1f2937' : '#fff', titleColor: isDark() ? '#fff' : '#111827', bodyColor: isDark() ? '#d1d5db' : '#4b5563', borderColor: isDark() ? '#374151' : '#e5e7eb', borderWidth: 1, callbacks: { label: (ctx) => `${currencySymbol.value}${convertCost(ctx.raw).toFixed(4)}` } }
  },
  scales: {
    x: { ticks: { color: chartTextColor.value, font: { size: 10 }, callback: (v) => `${currencySymbol.value}${convertCost(v).toFixed(2)}` }, grid: { color: gridColor.value } },
    y: { ticks: { color: chartTextColor.value, font: { size: 11 } }, grid: { display: false } }
  }
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { color: chartTextColor.value, usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 11 } } },
    tooltip: { backgroundColor: isDark() ? '#1f2937' : '#fff', titleColor: isDark() ? '#fff' : '#111827', bodyColor: isDark() ? '#d1d5db' : '#4b5563', borderColor: isDark() ? '#374151' : '#e5e7eb', borderWidth: 1, callbacks: { label: (ctx) => `${ctx.label}: ${currencySymbol.value}${convertCost(ctx.raw).toFixed(4)}` } }
  }
}))

// Table sorting
const sortedRows = computed(() => {
  const rows = [...detailedData.value]
  rows.sort((a, b) => {
    let va = a[sortKey.value]
    let vb = b[sortKey.value]
    if (typeof va === 'string') {
      va = va.toLowerCase()
      vb = (vb || '').toLowerCase()
    }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
  return rows
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pageSize)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedRows.value.slice(start, start + pageSize)
})

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
  currentPage.value = 1
}

// Data fetching
async function fetchData() {
  loading.value = true
  currentPage.value = 1
  const params = getDateRange()
  try {
    const [summaryRes, detailedRes, providerRes] = await Promise.all([
      api.get('/usage', { params: { period: 'custom', ...params } }).catch(() => null),
      api.get('/usage/detailed', { params }).catch(() => null),
      api.get('/usage/by-provider', { params }).catch(() => null)
    ])

    if (summaryRes?.data?.summary) {
      const s = summaryRes.data.summary
      summary.value = {
        total_requests: s.total_requests || 0,
        total_tokens: s.total_tokens || 0,
        input_tokens: s.total_input_tokens || 0,
        output_tokens: s.total_output_tokens || 0,
        estimated_cost: s.total_cost || 0,
        avg_cost_per_request: s.total_requests
          ? (s.total_cost || 0) / s.total_requests
          : 0
      }
    }

    detailedData.value = detailedRes?.data?.daily || []
    providerData.value = providerRes?.data?.providers || []
  } catch (e) {
    console.error('Error fetching usage data:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchExchangeRates()
  setPreset(30)
})
</script>
