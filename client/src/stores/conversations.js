import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../lib/api'

export const useConversationsStore = defineStore('conversations', () => {
  const conversations = ref([])
  const currentConversation = ref(null)
  const currentMessages = ref([])

  async function fetchConversations(status = '') {
    const params = status ? { status } : {}
    const { data } = await api.get('/conversations', { params })
    conversations.value = data.conversations
  }

  async function fetchConversation(id) {
    const { data } = await api.get(`/conversations/${id}`)
    currentConversation.value = data.conversation
    currentMessages.value = data.messages
  }

  async function changeStatus(id, status) {
    const { data } = await api.put(`/conversations/${id}/status`, { status })
    currentConversation.value = data.conversation
    // Update in list
    const idx = conversations.value.findIndex(c => c.id === id)
    if (idx !== -1) conversations.value[idx] = data.conversation
  }

  function addMessage(convData) {
    const { conversation, message } = convData
    // Update messages if viewing this conversation
    if (currentConversation.value?.id === conversation.id) {
      const exists = currentMessages.value.find(m => m.id === message.id)
      if (!exists) currentMessages.value.push(message)
    }
    // Update conversation list
    const idx = conversations.value.findIndex(c => c.id === conversation.id)
    if (idx !== -1) {
      conversations.value[idx] = conversation
    } else {
      conversations.value.unshift(conversation)
    }
    // Sort by last message
    conversations.value.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
  }

  function updateConversation(conv) {
    const idx = conversations.value.findIndex(c => c.id === conv.id)
    if (idx !== -1) conversations.value[idx] = conv
    if (currentConversation.value?.id === conv.id) {
      currentConversation.value = conv
    }
  }

  return {
    conversations, currentConversation, currentMessages,
    fetchConversations, fetchConversation, changeStatus,
    addMessage, updateConversation
  }
})
