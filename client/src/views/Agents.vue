<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Agentes</h2>
      <button @click="showForm = true"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        + Crear agente
      </button>
    </div>

    <!-- Create Agent Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Nuevo Agente</h3>
        <div class="space-y-3">
          <input v-model="form.name" placeholder="Nombre" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          <input v-model="form.email" type="email" placeholder="Email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          <input v-model="form.password" type="password" placeholder="Contrasena" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <p v-if="formError" class="text-red-500 text-sm mt-2">{{ formError }}</p>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="showForm = false; formError = ''" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">Cancelar</button>
          <button @click="createAgent" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Crear</button>
        </div>
      </div>
    </div>

    <!-- Agents List -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div v-if="agents.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        <p class="text-sm">No hay agentes aun</p>
      </div>
      <div v-else>
        <div v-for="agent in agents" :key="agent.id"
          class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
              {{ agent.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800 dark:text-white">{{ agent.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ agent.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs px-2 py-1 rounded-full" :class="agent.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'">
              {{ agent.active ? 'Activo' : 'Inactivo' }}
            </span>
            <button v-if="agent.active" @click="deactivateAgent(agent.id)"
              class="text-xs text-red-500 hover:underline">Desactivar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../lib/api'

const agents = ref([])
const showForm = ref(false)
const form = ref({ name: '', email: '', password: '' })
const formError = ref('')

onMounted(async () => {
  const { data } = await api.get('/auth/agents')
  agents.value = data.agents
})

async function createAgent() {
  formError.value = ''
  try {
    const { data } = await api.post('/auth/agents', form.value)
    agents.value.push({ ...data.agent, active: 1 })
    showForm.value = false
    form.value = { name: '', email: '', password: '' }
  } catch (err) {
    formError.value = err.response?.data?.error || 'Error'
  }
}

async function deactivateAgent(id) {
  if (!confirm('¿Desactivar este agente?')) return
  await api.delete(`/auth/agents/${id}`)
  const agent = agents.value.find(a => a.id === id)
  if (agent) agent.active = 0
}
</script>
