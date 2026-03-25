import { io } from 'socket.io-client'
import { useConversationsStore } from '../stores/conversations'
import { useSettingsStore } from '../stores/settings'

let socket = null

export function useSocket() {
  const convStore = useConversationsStore()
  const settingsStore = useSettingsStore()

  function connect() {
    const token = localStorage.getItem('token')
    if (!token) return
    if (socket?.connected) return

    // Disconnect old socket if exists
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
    }

    // Connect through Vite proxy in dev, or same origin in production
    socket = io('', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    })

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected')
    })

    socket.on('connect_error', (err) => {
      console.error('❌ Socket.IO connect error:', err.message)
    })

    socket.on('message:new', (data) => {
      convStore.addMessage(data)
    })

    socket.on('conversation:updated', (conv) => {
      convStore.updateConversation(conv)
    })

    socket.on('whatsapp:qr', (qr) => {
      console.log('📱 QR code received, length:', qr?.length)
      settingsStore.qrCode = qr
      settingsStore.waError = ''
    })

    socket.on('whatsapp:status', (status) => {
      console.log('📡 WhatsApp status:', status)
      settingsStore.whatsappStatus = status
      if (status === 'connected') {
        settingsStore.qrCode = ''
        settingsStore.waError = ''
      }
      if (status === 'disconnected') {
        settingsStore.qrCode = ''
      }
    })

    socket.on('whatsapp:error', (errMsg) => {
      console.error('❌ WhatsApp error:', errMsg)
      settingsStore.waError = errMsg
    })

    socket.on('settings:online_status', (status) => {
      settingsStore.onlineStatus = !!status
    })

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason)
    })
  }

  function disconnect() {
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }
  }

  function emit(event, data) {
    if (socket?.connected) {
      socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit:', event)
    }
  }

  function isConnected() {
    return socket?.connected || false
  }

  return { connect, disconnect, emit, isConnected }
}
