<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="w-full max-w-md">
      <!-- Back to landing -->
      <div class="mb-6">
        <router-link to="/"
          class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </router-link>
      </div>

      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-600 mb-4 hover:bg-primary-700 transition-colors">
            <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        </router-link>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">SellMate</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Sistema de ventas autonomo por WhatsApp</p>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {{ formTitle }}
        </h2>

        <div class="space-y-4">
          <!-- Name field (register modes) -->
          <div v-if="isRegister || isTenantRegister">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input v-model="name" type="text" placeholder="Tu nombre"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
          </div>

          <!-- Business name field (tenant register) -->
          <div v-if="isTenantRegister">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre del negocio</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <input v-model="businessName" type="text" placeholder="Mi Negocio"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input v-model="email" type="email" placeholder="tu@email.com"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contrasena</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="handleSubmit"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none" />
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            {{ error }}
          </div>

          <!-- Submit button -->
          <button @click="handleSubmit" :disabled="loading"
            class="w-full bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            {{ loading ? 'Cargando...' : submitLabel }}
          </button>

          <!-- Toggle links -->
          <div v-if="!isRegister" class="text-center pt-2 space-y-2">
            <button v-if="!isTenantRegister" @click="isTenantRegister = true"
              class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Registrar nuevo negocio
            </button>
            <button v-else @click="isTenantRegister = false"
              class="text-sm text-gray-500 dark:text-gray-400 hover:underline">
              Ya tengo cuenta, iniciar sesion
            </button>
          </div>
        </div>
      </div>

      <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
        SellMate &mdash; Automatiza tus ventas por WhatsApp
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../lib/api'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const name = ref('')
const businessName = ref('')
const error = ref('')
const loading = ref(false)
const isRegister = ref(false)
const isTenantRegister = ref(false)

const formTitle = computed(() => {
  if (isRegister.value) return 'Crear cuenta de administrador'
  if (isTenantRegister.value) return 'Registrar nuevo negocio'
  return 'Iniciar sesion'
})

const submitLabel = computed(() => {
  if (isRegister.value) return 'Crear cuenta'
  if (isTenantRegister.value) return 'Registrar negocio'
  return 'Iniciar sesion'
})

onMounted(async () => {
  if (auth.isLoggedIn) return router.push('/dashboard')
  try {
    const { data } = await api.get('/auth/check')
    isRegister.value = !data.hasAdmin
  } catch (e) { /* ignore */ }
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    if (isRegister.value) {
      await auth.register(email.value, password.value, name.value, businessName.value || 'Mi Negocio')
    } else if (isTenantRegister.value) {
      if (!businessName.value.trim()) {
        error.value = 'El nombre del negocio es requerido'
        loading.value = false
        return
      }
      await auth.registerTenant(email.value, password.value, name.value, businessName.value)
    } else {
      await auth.login(email.value, password.value)
    }
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error de conexion'
  } finally {
    loading.value = false
  }
}
</script>
