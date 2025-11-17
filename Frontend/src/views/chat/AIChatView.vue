<template>
  <DashboardLayout 
    :title="$t('ai_chat.title')" 
    :show-back-button="true"
    class="ai-chat-page"
  >
    <div class="chat-container">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="ai-info">
          <h3 class="ai-name">{{ $t('ai_chat.assistant_name') }}</h3>
          <p class="ai-status">{{ $t('ai_chat.status_online') }}</p>
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="chat-messages" ref="chatMessages">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
        >
          <div class="message-avatar">
            <div v-if="!message.isUser" class="ai-avatar">AI</div>
            <div v-else class="user-avatar">{{ userName.charAt(0).toUpperCase() }}</div>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              {{ message.text }}
            </div>
            
            <!-- Movie Recommendations -->
            <div v-if="message.movieRecommendations && message.movieRecommendations.length > 0" class="movie-recommendations">
              <MovieRecommendationCard
                v-for="movie in message.movieRecommendations"
                :key="movie.id"
                :movie="movie"
                @favoriteToggled="handleFavoriteToggled"
              />
            </div>
            
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="message ai-message">
          <div class="message-avatar">
            <div class="ai-avatar">AI</div>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input-container">
        <form @submit.prevent="sendMessage" class="chat-input-form">
          <input
            v-model="currentMessage"
            type="text"
            class="chat-input"
            :placeholder="$t('ai_chat.input_placeholder')"
            :disabled="isTyping"
          />
          <button 
            type="submit" 
            class="send-button"
            :disabled="!currentMessage.trim() || isTyping"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import MovieRecommendationCard from '@/components/ui/MovieRecommendationCard.vue'
import { useAuth } from '@/composables/useAuth'
import aiService from '@/services/aiService'
import { movieService } from '@/services/movie'

export default {
  name: 'AIChatView',
  components: {
    DashboardLayout,
    MovieRecommendationCard
  },
  setup() {
    const { user } = useAuth()
    return {
      user
    }
  },
  data() {
    return {
      messages: [
        {
          id: 1,
          text: this.$t('ai_chat.welcome_message'),
          isUser: false,
          timestamp: new Date()
        }
      ],
      currentMessage: '',
      isTyping: false,
      nextMessageId: 2
    }
  },
  computed: {
    userName() {
      return this.user?.fullName || this.user?.full_name || this.user?.name || 'User'
    }
  },
  methods: {
    async sendMessage() {
      if (!this.currentMessage.trim()) return

      // Add user message
      const userMessage = {
        id: this.nextMessageId++,
        text: this.currentMessage.trim(),
        isUser: true,
        timestamp: new Date()
      }
      this.messages.push(userMessage)
      this.saveMessagesToSession()
      const messageText = this.currentMessage.trim()
      this.currentMessage = ''

      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom()
      })

      // Show typing indicator
      this.isTyping = true

      try {
        // Call real AI API
        const aiResponse = await this.callAIAPI(messageText)
        this.isTyping = false

        const aiMessage = {
          id: this.nextMessageId++,
          text: typeof aiResponse === 'string' ? aiResponse : aiResponse.text,
          movieRecommendations: typeof aiResponse === 'object' ? aiResponse.movieRecommendations : null,
          isUser: false,
          timestamp: new Date()
        }
        this.messages.push(aiMessage)
        this.saveMessagesToSession()

        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        this.isTyping = false
        console.error('Error calling AI API:', error)
      }
    },

    saveMessagesToSession() {
      // Mentés sessionStorage-be (id, text, isUser, timestamp, movieRecommendations)
      const toSave = this.messages.map(m => ({
        id: m.id,
        text: m.text,
        isUser: m.isUser,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
        movieRecommendations: m.movieRecommendations || null
      }))
      sessionStorage.setItem('aiChatMessages', JSON.stringify(toSave))
    },

    loadMessagesFromSession() {
      const raw = sessionStorage.getItem('aiChatMessages')
      if (raw) {
        try {
          const arr = JSON.parse(raw)
          if (Array.isArray(arr) && arr.length > 0) {
            this.messages = arr.map(m => ({
              ...m,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            }))
            this.nextMessageId = Math.max(...this.messages.map(m => m.id)) + 1
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    },

    async callAIAPI(userMessage) {
      // Validate message first
      if (!aiService.validateMessage(userMessage)) {
        return this.$i18n.locale === 'hu' 
          ? 'Kérlek, írj egy érvényes üzenetet!'
          : 'Please write a valid message!'
      }

      try {
        const aiResponse = await aiService.getMoodBasedRecommendation(userMessage, this.$i18n.locale)
        return await this.processMovieRecommendations(aiResponse)
      } catch (error) {
        console.error('AI Service Error:', error)
        return aiService.getFallbackMessage(error, this.$i18n.locale)
      }
    },

    async processMovieRecommendations(aiResponse) {
      // Extract movie recommendations from AI response
      const moviePattern = /\[MOVIE:([^\]]+)\]/g
      const movieMatches = [...aiResponse.matchAll(moviePattern)]
      
      if (movieMatches.length === 0) {
        return aiResponse // No movies to process
      }
      
      let processedResponse = aiResponse
      const movieCards = []
      
      for (const match of movieMatches) {
        const movieTitle = match[1].trim()
        
        try {
          // Search for the movie using TMDB API
          const searchResult = await movieService.searchMovies(movieTitle, { page: 1 })
          
          if (searchResult.success && searchResult.movies.length > 0) {
            const movie = searchResult.movies[0] // Take the first match
            movieCards.push(movie)
            
            // Remove the [MOVIE:title] tag from the response
            processedResponse = processedResponse.replace(match[0], `"${movie.title}"`)
          } else {
            // If movie not found, just replace with the title
            processedResponse = processedResponse.replace(match[0], `"${movieTitle}"`)
          }
        } catch (error) {
          console.error('Error searching for movie:', movieTitle, error)
          processedResponse = processedResponse.replace(match[0], `"${movieTitle}"`)
        }
      }
      
      return {
        text: processedResponse,
        movieRecommendations: movieCards
      }
    },

    formatTime(timestamp) {
      return new Intl.DateTimeFormat(this.$i18n.locale, {
        hour: '2-digit',
        minute: '2-digit'
      }).format(timestamp)
    },

    scrollToBottom() {
      const chatMessages = this.$refs.chatMessages
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight
      }
    },

    handleFavoriteToggled(event) {
      // Handle favorite toggle event from movie cards
      console.log('Movie favorite toggled:', event)
      
      // You could emit an event here or update a global favorites count
      this.$emit('movieFavoriteToggled', event)
    }
  },

  mounted() {
    // Load from sessionStorage if available
    this.loadMessagesFromSession()
    // Replace welcome message with localized version if üres vagy csak 1 elem van
    if (this.messages.length === 0) {
      this.messages = [{
        id: 1,
        text: this.$t('ai_chat.welcome_message'),
        isUser: false,
        timestamp: new Date()
      }]
      this.nextMessageId = 2
      this.saveMessagesToSession()
    } else if (this.messages.length === 1) {
      this.messages[0].text = this.$t('ai_chat.welcome_message')
      this.saveMessagesToSession()
    }
    // Auto scroll to bottom
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  }
}
</script>

<style scoped>
.ai-chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-primary);
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-primary);
}

.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
}

.ai-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.ai-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--success-color);
}

/* Chat Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 70%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-message {
  align-self: flex-start;
}

.message-avatar svg {
  color: #8b5cf6;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
}

.message-content {
  flex: 1;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  line-height: 1.4;
}

.ai-message .message-bubble {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.user-message .message-bubble {
  background: var(--primary);
  color: white;
}

.message-time {
  font-size: 0.7rem;
  color: var(--text-tertiary);
  margin-top: 4px;
  text-align: right;
}

.user-message .message-time {
  text-align: left;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-tertiary);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* Movie Recommendations */
.movie-recommendations {
  margin-top: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-secondary);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  max-width: 100%;
}

@media (max-width: 768px) {
  .movie-recommendations {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}

/* Chat Input */
.chat-input-container {
  padding: 16px 20px;
  background: var(--card-bg);
  border-top: 1px solid var(--border-primary);
}

.chat-input-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-lg);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: border-color 0.2s ease;
}

.chat-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.send-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 100px);
  }
  
  .message {
    max-width: 85%;
  }
  
  .chat-messages {
    padding: 16px;
  }
  
  .chat-input-container {
    padding: 12px 16px;
  }
}

/* Custom scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--border-primary);
}
</style>