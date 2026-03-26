import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCounts = ref({
    conversations: 0,
    orders: 0,
    appointments: 0
  })
  const showPanel = ref(false)

  const totalUnread = computed(() =>
    unreadCounts.value.conversations + unreadCounts.value.orders + unreadCounts.value.appointments
  )

  function addNotification({ type, title, message, link }) {
    const notif = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      link,
      read: false,
      createdAt: new Date()
    }
    notifications.value.unshift(notif)
    // Keep max 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
    unreadCounts.value[type] = (unreadCounts.value[type] || 0) + 1
  }

  function markSectionRead(section) {
    unreadCounts.value[section] = 0
    notifications.value.forEach(n => {
      if (n.type === section) n.read = true
    })
  }

  function markAllRead() {
    unreadCounts.value.conversations = 0
    unreadCounts.value.orders = 0
    unreadCounts.value.appointments = 0
    notifications.value.forEach(n => { n.read = true })
  }

  function markOneRead(id) {
    const n = notifications.value.find(n => n.id === id)
    if (n && !n.read) {
      n.read = true
      if (unreadCounts.value[n.type] > 0) {
        unreadCounts.value[n.type]--
      }
    }
  }

  function togglePanel() {
    showPanel.value = !showPanel.value
  }

  function closePanel() {
    showPanel.value = false
  }

  return {
    notifications,
    unreadCounts,
    showPanel,
    totalUnread,
    addNotification,
    markSectionRead,
    markAllRead,
    markOneRead,
    togglePanel,
    closePanel
  }
})
