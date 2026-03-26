<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div v-if="auth.isLoggedIn && !route.meta.public" class="flex h-screen">
      <Sidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <router-view />
        </main>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import { useSettingsStore } from './stores/settings'
import { useSocket } from './composables/useSocket'
import Sidebar from './components/Sidebar.vue'
import TopBar from './components/TopBar.vue'

const route = useRoute()

const auth = useAuthStore()
const theme = useThemeStore()
const settingsStore = useSettingsStore()
const { connect } = useSocket()

onMounted(() => {
  if (auth.isLoggedIn) {
    connect()
    settingsStore.fetchSettings().catch(() => {})
    settingsStore.fetchBusinessInfo()
  }
})
</script>
