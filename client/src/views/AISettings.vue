<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Configuracion de IA</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona tus llaves de API y el motor de inteligencia artificial</p>
    </div>

    <div class="max-w-3xl space-y-6">

      <!-- Section 1: API Keys list -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white">Llaves de API</h3>
          <button @click="openAddModal()"
            class="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Agregar llave
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loadingKeys" class="flex items-center justify-center py-10">
          <svg class="animate-spin h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
        </div>

        <!-- Empty state -->
        <div v-else-if="keys.length === 0" class="flex flex-col items-center py-10 text-center">
          <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
            <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">No tienes llaves configuradas</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Agrega una llave de API para empezar a usar el bot con IA</p>
        </div>

        <!-- Keys list -->
        <div v-else class="space-y-3">
          <div v-for="key in keys" :key="key.id"
            class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all"
            :class="key.is_active
              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
              : 'border-gray-200 dark:border-gray-600'">

            <!-- Provider icon -->
            <div class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
              :class="providerBg(key.provider)">
              <svg v-if="key.provider === 'openai'" class="w-5 h-5 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>
              <svg v-else-if="key.provider === 'anthropic'" class="w-5 h-5 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></svg>
              <svg v-else-if="key.provider === 'gemini'" class="w-5 h-5" viewBox="0 0 24 24"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" fill="url(#gl)"/><defs><linearGradient id="gl" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#4285F4"/><stop offset=".5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs></svg>
              <svg v-else class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-gray-800 dark:text-white truncate">{{ key.label }}</p>
                <span v-if="key.is_active"
                  class="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  Activa
                </span>
              </div>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ key.provider }}</span>
                <span class="text-xs text-gray-300 dark:text-gray-600">|</span>
                <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ key.model }}</span>
                <span class="text-xs text-gray-300 dark:text-gray-600">|</span>
                <span class="text-xs text-gray-400 dark:text-gray-500 font-mono">{{ key.api_key_masked }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <button v-if="!key.is_active" @click="activateKey(key.id)"
                title="Usar esta llave"
                class="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
              <button @click="testKey(key)"
                title="Probar conexion"
                :disabled="testingKeyId === key.id"
                class="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-40">
                <svg v-if="testingKeyId !== key.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
              </button>
              <button @click="confirmDelete(key)"
                title="Eliminar"
                class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Test result toast -->
        <p v-if="testResultMsg" class="mt-3 text-sm" :class="testResultSuccess ? 'text-green-600' : 'text-red-600'">
          {{ testResultMsg }}
        </p>
      </div>

    </div>

    <!-- Add/Edit key modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/50" @click="showModal = false"></div>

          <!-- Modal -->
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Agregar llave de API</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Provider selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proveedor</label>
              <div class="grid grid-cols-4 gap-2">
                <button v-for="prov in [
                  { key: 'openai', name: 'OpenAI' },
                  { key: 'anthropic', name: 'Anthropic' },
                  { key: 'gemini', name: 'Gemini' },
                  { key: 'custom', name: 'Custom' }
                ]" :key="prov.key" @click="modalForm.provider = prov.key"
                  class="flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center"
                  :class="modalForm.provider === prov.key ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
                  <svg v-if="prov.key === 'openai'" class="w-7 h-7 mb-1.5 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>
                  <svg v-else-if="prov.key === 'anthropic'" class="w-7 h-7 mb-1.5 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></svg>
                  <svg v-else-if="prov.key === 'gemini'" class="w-7 h-7 mb-1.5" viewBox="0 0 24 24"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" fill="url(#gm)"/><defs><linearGradient id="gm" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#4285F4"/><stop offset=".5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs></svg>
                  <svg v-else class="w-7 h-7 mb-1.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span class="text-xs font-semibold text-gray-800 dark:text-white">{{ prov.name }}</span>
                </button>
              </div>
            </div>

            <!-- Label -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre / etiqueta</label>
              <input v-model="modalForm.label" placeholder="Ej: OpenAI produccion"
                class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>

            <!-- API Key -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
              <div class="relative">
                <input v-model="modalForm.api_key" :type="showModalKey ? 'text' : 'password'" placeholder="sk-..."
                  class="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                <button @click="showModalKey = !showModalKey" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <svg v-if="!showModalKey" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                </button>
              </div>
            </div>

            <!-- Model -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
              <div class="relative">
                <select v-model="modalForm.model"
                  class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  :disabled="loadingModalModels">
                  <option value="">Seleccionar modelo...</option>
                  <option v-for="m in modalModels" :key="typeof m === 'string' ? m : m.id" :value="typeof m === 'string' ? m : m.id">
                    {{ typeof m === 'string' ? m : (m.name || m.id) }}
                  </option>
                </select>
                <svg v-if="loadingModalModels" class="animate-spin h-4 w-4 text-gray-400 absolute right-8 top-3" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
              </div>
            </div>

            <!-- Custom endpoint -->
            <div v-if="modalForm.provider === 'custom'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint personalizado</label>
              <input v-model="modalForm.custom_endpoint" placeholder="https://your-api.com/v1/chat/completions"
                class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>

            <!-- Error -->
            <p v-if="modalError" class="text-sm text-red-600">{{ modalError }}</p>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button @click="showModal = false"
                class="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button @click="saveKey" :disabled="savingKey"
                class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {{ savingKey ? 'Guardando...' : 'Guardar llave' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="showDeleteModal = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-1">Eliminar llave</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Seguro que quieres eliminar <strong class="text-gray-700 dark:text-gray-200">{{ deleteTarget?.label }}</strong>?
              <span v-if="deleteTarget?.is_active" class="block mt-1 text-amber-600 dark:text-amber-400 font-medium">Esta es la llave activa. Se activara otra automaticamente.</span>
            </p>
            <div class="flex items-center justify-center gap-3">
              <button @click="showDeleteModal = false"
                class="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button @click="deleteKey()" :disabled="deletingKey"
                class="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {{ deletingKey ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../lib/api'

// Keys list
const keys = ref([])
const loadingKeys = ref(true)

// Test
const testingKeyId = ref(null)
const testResultMsg = ref('')
const testResultSuccess = ref(false)

// Modal state
const showModal = ref(false)
const showModalKey = ref(false)
const savingKey = ref(false)
const modalError = ref('')
const loadingModalModels = ref(false)
const modalFetchedModels = ref(null)

const modalForm = ref({
  provider: 'openai',
  label: '',
  api_key: '',
  model: '',
  custom_endpoint: ''
})

// Delete modal
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const deletingKey = ref(false)

const fallbackModels = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1', 'gpt-4.1-nano', 'gpt-4-turbo', 'o3-mini', 'o4-mini'],
  anthropic: ['claude-haiku-4-5-20250315', 'claude-sonnet-4-6-20250514', 'claude-opus-4-6-20250514'],
  gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  custom: ['gpt-4o-mini', 'gpt-4o']
}

const modalModels = computed(() => {
  if (modalFetchedModels.value && modalFetchedModels.value.length > 0) return modalFetchedModels.value
  return fallbackModels[modalForm.value.provider] || fallbackModels.custom
})

// Helpers
function providerBg(provider) {
  return {
    openai: 'bg-emerald-100 dark:bg-emerald-900/30',
    anthropic: 'bg-amber-100 dark:bg-amber-900/30',
    gemini: 'bg-blue-100 dark:bg-blue-900/30',
    custom: 'bg-purple-100 dark:bg-purple-900/30'
  }[provider] || 'bg-gray-100 dark:bg-gray-700'
}
// (no helpers needed - usage moved to Settings.vue)

// Fetch keys
async function fetchKeys() {
  loadingKeys.value = true
  try {
    const { data } = await api.get('/settings/ai-keys')
    keys.value = data.keys || []
  } catch (e) {
    keys.value = []
  } finally {
    loadingKeys.value = false
  }
}

// Fetch models for modal
async function fetchModalModels() {
  const provider = modalForm.value.provider
  const apiKey = modalForm.value.api_key
  if (!provider) return

  loadingModalModels.value = true
  try {
    const params = { provider }
    if (apiKey && !apiKey.startsWith('****')) params.api_key = apiKey
    const { data } = await api.get('/settings/models', { params })
    if (data.models?.length > 0) {
      modalFetchedModels.value = data.models
    } else {
      modalFetchedModels.value = null
    }
  } catch (e) {
    modalFetchedModels.value = null
  } finally {
    loadingModalModels.value = false
  }
}

// Watch provider/api_key changes in modal to refetch models
watch(() => modalForm.value.provider, () => {
  modalForm.value.model = ''
  modalFetchedModels.value = null
  fetchModalModels()
})

// Debounced watch on api_key to fetch models after user types
let apiKeyTimer = null
watch(() => modalForm.value.api_key, (val) => {
  clearTimeout(apiKeyTimer)
  if (val && val.length > 10) {
    apiKeyTimer = setTimeout(() => fetchModalModels(), 800)
  }
})

// Open modal
function openAddModal() {
  modalForm.value = { provider: 'openai', label: '', api_key: '', model: '', custom_endpoint: '' }
  modalError.value = ''
  showModalKey.value = false
  modalFetchedModels.value = null
  showModal.value = true
  fetchModalModels()
}

// Save key
async function saveKey() {
  if (!modalForm.value.api_key) {
    modalError.value = 'La API key es requerida'
    return
  }
  savingKey.value = true
  modalError.value = ''
  try {
    await api.post('/settings/ai-keys', {
      label: modalForm.value.label || `${modalForm.value.provider} key`,
      provider: modalForm.value.provider,
      api_key: modalForm.value.api_key,
      model: modalForm.value.model || (fallbackModels[modalForm.value.provider]?.[0] || 'gpt-4o-mini'),
      custom_endpoint: modalForm.value.custom_endpoint
    })
    showModal.value = false
    await fetchKeys()
  } catch (e) {
    modalError.value = e.response?.data?.error || 'Error al guardar'
  } finally {
    savingKey.value = false
  }
}

// Activate key
async function activateKey(id) {
  try {
    await api.put(`/settings/ai-keys/${id}/activate`)
    await fetchKeys()
  } catch (e) {
    alert('Error al activar llave')
  }
}

// Test key
async function testKey(key) {
  testingKeyId.value = key.id
  testResultMsg.value = ''
  try {
    const { data } = await api.post('/settings/test-ai', {
      provider: key.provider,
      model: key.model
    })
    testResultSuccess.value = true
    testResultMsg.value = `${key.label}: Conexion exitosa (${data.response_time_ms}ms)`
  } catch (e) {
    testResultSuccess.value = false
    testResultMsg.value = `${key.label}: ${e.response?.data?.error || 'Error de conexion'}`
  } finally {
    testingKeyId.value = null
    setTimeout(() => testResultMsg.value = '', 5000)
  }
}

// Delete
function confirmDelete(key) {
  deleteTarget.value = key
  showDeleteModal.value = true
}

async function deleteKey() {
  if (!deleteTarget.value) return
  deletingKey.value = true
  try {
    await api.delete(`/settings/ai-keys/${deleteTarget.value.id}`)
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchKeys()
  } catch (e) {
    alert('Error al eliminar llave')
  } finally {
    deletingKey.value = false
  }
}

onMounted(() => {
  fetchKeys()
})
</script>
