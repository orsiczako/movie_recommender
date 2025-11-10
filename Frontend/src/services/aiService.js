import { getMoodBasedMoviePrompt } from './aiPrompts'
import { getGeminiURL, getListModelsURL, FALLBACK_MESSAGES, BACKUP_MODELS, AI_CONFIG, validateConfig } from './aiConfig'

/**
 * AI Service for handling movie recommendations
 */
class AIService {
  constructor() {
    // Validate configuration on initialization
    this.isConfigValid = validateConfig()
    if (!this.isConfigValid) {
      console.error('AI Service initialized with invalid configuration')
    }
    
    // Auto-list available models on init for debugging
    this.listAvailableModels().then(() => {
      console.log('AI Service initialized with model listing complete')
    }).catch(err => {
      console.error('Failed to list models on init:', err)
    })
  }
  /**
   * Send a message to the AI and get a mood-based movie recommendation
   * @param {string} userMessage - The user's message
   * @param {string} locale - The user's locale (hu/en)
   * @returns {Promise<string>} - The AI's response
   */
  async getMoodBasedRecommendation(userMessage, locale = 'en') {
    // Check if configuration is valid
    if (!this.isConfigValid) {
      const fallbackMessages = FALLBACK_MESSAGES[locale] || FALLBACK_MESSAGES.en
      return fallbackMessages.error
    }
    let retries = 0
    
    while (retries < AI_CONFIG.RESPONSE.MAX_RETRIES) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.RESPONSE.TIMEOUT)
        
        const url = getGeminiURL()
        // Check if using text-bison model (different format)
        const isTextBison = AI_CONFIG.GEMINI.MODEL.includes('text-bison')
        
        const requestBody = isTextBison ? {
          prompt: {
            text: getMoodBasedMoviePrompt(userMessage, locale)
          }
        } : {
          contents: [{
            parts: [{
              text: getMoodBasedMoviePrompt(userMessage, locale)
            }]
          }]
        }
        
        // console.log('AI API Request URL:', url)
        // console.log('AI API Request Body:', requestBody)
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': AI_CONFIG.GEMINI.API_KEY
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        
        // console.log('AI API Response Status:', response.status)
        // console.log('AI API Response Headers:', response.headers)
        
        if (!response.ok) {
          const errorText = await response.text()
          // console.log('AI API Error Response:', errorText)
          throw new Error(`API responded with status: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()
        // console.log('AI API Response Data:', data)
        
        // Handle different response formats
        const isTextBisonResponse = AI_CONFIG.GEMINI.MODEL.includes('text-bison')
        
        if (isTextBisonResponse) {
          if (data.candidates && data.candidates[0] && data.candidates[0].output) {
            return data.candidates[0].output
          } else {
            throw new Error('Invalid text-bison API response structure')
          }
        } else {
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const rawText = data.candidates[0].content.parts[0].text
            return this.cleanMarkdown(rawText)
          } else {
            throw new Error('Invalid Gemini API response structure')
          }
        }
      } catch (error) {
        retries++
        console.error(`AI API Error (attempt ${retries}):`, error)
        
        if (retries >= AI_CONFIG.RESPONSE.MAX_RETRIES) {
          // If main model is overloaded (503), try backup models
          if (error.message.includes('503')) {
            console.log('Primary model overloaded, trying backup models...')
            return await this.tryBackupModels(userMessage, locale)
          }
          return this.getFallbackMessage(error, locale)
        }
        
        // Wait before retry
        await this.delay(AI_CONFIG.RESPONSE.FALLBACK_DELAY * retries)
      }
    }
  }

  /**
   * Try backup models if primary model fails
   * @param {string} userMessage - The user's message
   * @param {string} locale - The user's locale
   * @returns {Promise<string>} - The AI's response
   */
  async tryBackupModels(userMessage, locale) {
    for (const model of BACKUP_MODELS) {
      try {
        console.log(`Trying backup model: ${model}`)
        
        const url = `${AI_CONFIG.GEMINI.BASE_URL}/models/${model}:generateContent`
        const requestBody = {
          contents: [{
            parts: [{
              text: getMoodBasedMoviePrompt(userMessage, locale)
            }]
          }]
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': AI_CONFIG.GEMINI.API_KEY
          },
          body: JSON.stringify(requestBody)
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            console.log(`Success with backup model: ${model}`)
            const rawText = data.candidates[0].content.parts[0].text
            return this.cleanMarkdown(rawText)
          }
        } else if (response.status === 503) {
          console.log(`Model ${model} is also overloaded, trying next...`)
          continue
        }
      } catch (error) {
        console.log(`Backup model ${model} failed:`, error.message)
        continue
      }
    }
    
    // If all backup models fail
    const fallbackMessages = FALLBACK_MESSAGES[locale] || FALLBACK_MESSAGES.en
    return fallbackMessages.error
  }

  /**
   * Get appropriate fallback message based on error type
   * @param {Error} error - The error that occurred
   * @param {string} locale - The user's locale
   * @returns {string} - Appropriate fallback message
   */
  getFallbackMessage(error, locale) {
    const fallbackMessages = FALLBACK_MESSAGES[locale] || FALLBACK_MESSAGES.en
    
    if (error.name === 'AbortError') {
      return fallbackMessages.timeout
    } else if (error.message.includes('503')) {
      return fallbackMessages.overloaded
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      return fallbackMessages.network
    } else {
      return fallbackMessages.error
    }
  }

  /**
   * Clean markdown formatting from AI response
   * @param {string} text - The AI response text
   * @returns {string} - Cleaned text without markdown
   */
  cleanMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
      .replace(/#{1,6}\s/g, '')        // Remove headers # ## ###
      .replace(/^\s*[-*+]\s/gm, '')    // Remove bullet points
      .replace(/^\s*\d+\.\s/gm, '')    // Remove numbered lists
      .replace(/`([^`]+)`/g, '$1')     // Remove inline code `text`
      .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
      // PRESERVE [MOVIE:...] tags - they are NOT links!
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // If it's a MOVIE tag, keep it intact
        if (text.startsWith('MOVIE:')) {
          return `[${text}]`
        }
        // Otherwise remove link formatting
        return text
      })
      .trim()
  }

  /**
   * Utility function for delays
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Validate message length
   * @param {string} message - The message to validate
   * @returns {boolean} - Whether the message is valid
   */
  validateMessage(message) {
    return message && 
           message.trim().length > 0 && 
           message.length <= AI_CONFIG.UI.MAX_MESSAGE_LENGTH
  }

  /**
   * Debug function to list available models
   * @returns {Promise<Array>} - List of available models
   */
  async listAvailableModels() {
    try {
      const response = await fetch(getListModelsURL(), {
        method: 'GET',
        headers: {
          'x-goog-api-key': AI_CONFIG.GEMINI.API_KEY
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Available Gemini Models:', data.models)
        return data.models
      } else {
        console.error('Failed to fetch models:', response.status)
        return []
      }
    } catch (error) {
      console.error('Error fetching models:', error)
      return []
    }
  }
}

// Export singleton instance
export const aiService = new AIService()
export default aiService