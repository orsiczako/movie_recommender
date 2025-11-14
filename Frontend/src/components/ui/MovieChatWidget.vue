<template>
  <div class="chat-widget" :class="{ 'expanded': isExpanded }">
    <!-- Chat toggle button with preview bubble -->
    <div v-if="!isExpanded" class="chat-toggle-container">
      <!-- Preview bubble -->
      <div v-if="greetingMessage && !hasInteracted" class="greeting-bubble">
        <button @click="dismissGreeting" class="dismiss-btn" title="Dismiss">×</button>
        <div class="greeting-content">{{ greetingMessage }}</div>
      </div>
      
      <!-- Chat button -->
      <button 
        @click="toggleChat" 
        class="chat-toggle-btn"
        :title="$t('chat.openChat')"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2M20 16H5.2L4 17.2V4H20V16Z"/>
        </svg>
      </button>
    </div>

    <!-- Chat window -->
    <div v-if="isExpanded" class="chat-window">
      <!-- Header -->
      <div class="chat-header">
        <h3>{{ characterName || $t('chat.title') }}</h3>
        <button @click="toggleChat" class="close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
          <div class="message-content">{{ msg.content }}</div>
        </div>
        <div v-if="isLoading" class="message assistant">
          <div class="message-content typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-input">
        <input 
          v-model="userInput" 
          @keydown.enter="sendMessage"
          :placeholder="$t('chat.placeholder')"
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading || !userInput.trim()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue'
import api from '@/services/api'
import { useLocale } from '@/composables/useLocale'

export default {
  name: 'MovieChatWidget',
  props: {
    movieTitle: {
      type: String,
      required: true
    },
    movieYear: {
      type: [String, Number],
      default: null
    },
    movieOverview: {
      type: String,
      default: ''
    }
  },
  
  setup(props) {
    const { currentLocale } = useLocale()
    const isExpanded = ref(false)
    const userInput = ref('')
    const messages = ref([])
    const isLoading = ref(false)
    const messagesContainer = ref(null)
    const greetingMessage = ref('')
    const hasInteracted = ref(false)
    const characterName = ref('')
    
    // Load greeting message when component mounts
    const loadGreeting = async () => {
      try {
        const response = await api.post('/api/chat/movie', {
          movieTitle: props.movieTitle,
          movieYear: props.movieYear,
          movieOverview: props.movieOverview,
          question: 'Hello!',
          conversationHistory: [],
          language: currentLocale.value
        })
        
        if (response.data.success) {
          greetingMessage.value = response.data.answer
          if (response.data.characterName) {
            characterName.value = response.data.characterName
          }
        }
      } catch (error) {
        console.error('Failed to load greeting:', error)
        greetingMessage.value = currentLocale.value === 'hu' 
          ? `Szia! Én egy karakter vagyok a "${props.movieTitle}" című filmből. Kérdezz bármit erről a filmről!`
          : `Hi! I'm a character from "${props.movieTitle}". Ask me anything about this movie!`
      }
    }
    
    // Load greeting on mount
    loadGreeting()
    
    const dismissGreeting = () => {
      hasInteracted.value = true
    }
    
    const toggleChat = async () => {
      isExpanded.value = !isExpanded.value
      hasInteracted.value = true
      
      if (isExpanded.value && messages.value.length === 0) {
        // Use the pre-loaded greeting or fetch it
        if (greetingMessage.value) {
          messages.value.push({
            role: 'assistant',
            content: greetingMessage.value
          })
        } else {
          // Fetch greeting if not loaded yet
          isLoading.value = true
          
          try {
            const response = await api.post('/api/chat/movie', {
              movieTitle: props.movieTitle,
              movieYear: props.movieYear,
              movieOverview: props.movieOverview,
              question: 'Hello!',
              conversationHistory: [],
              language: currentLocale.value
            })
            
            if (response.data.success) {
              messages.value.push({
                role: 'assistant',
                content: response.data.answer
              })
              if (response.data.characterName) {
                characterName.value = response.data.characterName
              }
            }
          } catch (error) {
            console.error('Initial greeting error:', error)
            messages.value.push({
              role: 'assistant',
              content: `Hi! I'm a character from "${props.movieTitle}". Ask me anything about this movie!`
            })
          } finally {
            isLoading.value = false
          }
        }
      }
    }
    
    const sendMessage = async () => {
      if (!userInput.value.trim() || isLoading.value) return
      
      const userMessage = userInput.value.trim()
      messages.value.push({
        role: 'user',
        content: userMessage
      })
      
      userInput.value = ''
      isLoading.value = true
      
      // Scroll to bottom
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
      
      try {
        const response = await api.post('/api/chat/movie', {
          movieTitle: props.movieTitle,
          movieYear: props.movieYear,
          movieOverview: props.movieOverview,
          question: userMessage,
          conversationHistory: messages.value.slice(-6), // Last 3 exchanges
          language: currentLocale.value
        })
        
        if (response.data.success) {
          messages.value.push({
            role: 'assistant',
            content: response.data.answer
          })
        } else {
          throw new Error('Failed to get response')
        }
      } catch (error) {
        console.error('Chat error:', error)
        messages.value.push({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        })
      } finally {
        isLoading.value = false
        await nextTick()
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      }
    }
    
    return {
      isExpanded,
      userInput,
      messages,
      isLoading,
      messagesContainer,
      greetingMessage,
      hasInteracted,
      characterName,
      toggleChat,
      sendMessage,
      dismissGreeting
    }
  }
}
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  pointer-events: none;
}

.chat-widget > * {
  pointer-events: auto;
}

.chat-toggle-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.greeting-bubble {
  position: relative;
  max-width: 280px;
  padding: 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.greeting-bubble::after {
  content: '';
  position: absolute;
  right: 20px;
  bottom: -8px;
  width: 0;
  height: 0;
  border-top: 8px solid white;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
}

.dismiss-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.dismiss-btn:hover {
  opacity: 1;
}

.greeting-content {
  color: #333;
  font-size: 0.9rem;
  line-height: 1.4;
  padding-right: 1.5rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.chat-toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(229, 9, 20, 0.5);
}

.chat-window {
  width: 350px;
  height: 500px;
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  bottom: 2rem;
  right: 2rem;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--primary);
  color: white;
}

.chat-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.message.user .message-content {
  background: var(--primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.typing {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  padding: 0.5rem 1rem !important;
}

.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: typing 1.4s infinite;
}

.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-primary);
}

.chat-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.chat-input input:focus {
  outline: none;
  border-color: var(--primary);
}

.chat-input button {
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.chat-input button:hover:not(:disabled) {
  background: var(--primary-hover);
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .chat-widget {
    position: fixed !important;
    bottom: 60px !important;
    right: 16px !important;
    left: auto !important;
    transform: none !important;
  }
  
  .chat-toggle-btn {
    width: 50px !important;
    height: 50px !important;
  }
  
  .chat-window {
    position: fixed !important;
    width: calc(100vw - 32px) !important;
    max-width: 350px !important;
    height: calc(100vh - 140px) !important;
    max-height: 450px !important;
    bottom: 60px !important;
    right: 16px !important;
    left: 16px !important;
    margin: 0 auto !important;
    transform: none !important;
  }
  
  .greeting-bubble {
    max-width: 240px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .chat-widget {
    bottom: 50px !important;
    right: 12px !important;
  }
  
  .chat-toggle-btn {
    width: 48px !important;
    height: 48px !important;
  }
  
  .chat-toggle-btn svg {
    width: 20px;
    height: 20px;
  }
  
  .chat-window {
    height: calc(100vh - 120px) !important;
    max-height: 400px !important;
    bottom: 50px !important;
    width: calc(100vw - 24px) !important;
    left: 12px !important;
    right: 12px !important;
  }
  
  .greeting-bubble {
    max-width: 200px;
  }
}
</style>
