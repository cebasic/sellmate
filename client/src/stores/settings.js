import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../lib/api'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(null)
  const whatsappStatus = ref('disconnected')
  const qrCode = ref('')
  const waError = ref('')
  const onlineStatus = ref(true)

  async function fetchSettings() {
    const { data } = await api.get('/settings')
    settings.value = data.settings
    if (data.settings) {
      onlineStatus.value = !!data.settings.online_status
    }
  }

  async function updateSettings(payload) {
    const { data } = await api.put('/settings', payload)
    settings.value = data.settings
  }

  async function toggleOnlineStatus() {
    const newStatus = !onlineStatus.value
    await api.put('/settings/online-status', { online_status: newStatus })
    onlineStatus.value = newStatus
  }

  return { settings, whatsappStatus, qrCode, waError, onlineStatus, fetchSettings, updateSettings, toggleOnlineStatus }
})
