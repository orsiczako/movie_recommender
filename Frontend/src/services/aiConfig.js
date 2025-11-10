// AI Service Configuration
export const AI_CONFIG = {
  // Google Generative AI Configuration  
  GEMINI: {
    API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
    MODEL: 'gemini-flash-lite-latest',
    ENDPOINT: '/models/gemini-flash-lite-latest:generateContent'
  },
  
  // Response Configuration
  RESPONSE: {
    MAX_RETRIES: parseInt(import.meta.env.VITE_AI_MAX_RETRIES) || 3,
    TIMEOUT: parseInt(import.meta.env.VITE_AI_TIMEOUT) || 10000, // 10 seconds
    FALLBACK_DELAY: 1000 // 1 second delay before showing fallback
  },
  
  // UI Configuration
  UI: {
    TYPING_DELAY_MIN: 800,
    TYPING_DELAY_MAX: 2000,
    MAX_MESSAGE_LENGTH: parseInt(import.meta.env.VITE_AI_MAX_MESSAGE_LENGTH) || 500
  }
}

// Helper function to get full API URL
export const getGeminiURL = () => {
  if (!AI_CONFIG.GEMINI.API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY environment variable is not set')
  }
  return `${AI_CONFIG.GEMINI.BASE_URL}${AI_CONFIG.GEMINI.ENDPOINT}`
}

// Helper function to list available models (for debugging)
export const getListModelsURL = () => {
  if (!AI_CONFIG.GEMINI.API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY environment variable is not set')
  }
  return `${AI_CONFIG.GEMINI.BASE_URL}/models`
}

// Validate configuration on load
export const validateConfig = () => {
  const issues = []
  
  if (!AI_CONFIG.GEMINI.API_KEY) {
    issues.push('VITE_GEMINI_API_KEY is missing')
  }
  
  if (AI_CONFIG.RESPONSE.MAX_RETRIES < 1 || AI_CONFIG.RESPONSE.MAX_RETRIES > 10) {
    issues.push('VITE_AI_MAX_RETRIES should be between 1 and 10')
  }
  
  if (AI_CONFIG.RESPONSE.TIMEOUT < 1000 || AI_CONFIG.RESPONSE.TIMEOUT > 30000) {
    issues.push('VITE_AI_TIMEOUT should be between 1000 and 30000ms')
  }
  
  if (issues.length > 0) {
    console.warn('AI Configuration Issues:', issues)
  }
  
  return issues.length === 0
}

// Available backup models in order of preference
export const BACKUP_MODELS = [
  'gemini-pro-latest',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-2.5-pro'
]

// Fallback messages
export const FALLBACK_MESSAGES = {
  hu: {
    error: 'Sajnálom, jelenleg nem tudok válaszolni. Próbáld újra később!',
    network: 'Hálózati hiba történt. Ellenőrizd az internetkapcsolatot!',
    timeout: 'A válasz túl sokáig tartott. Próbáld újra!',
    overloaded: 'Az AI modell túlterhelt. Próbálok egy másik modellt használni...'
  },
  en: {
    error: 'Sorry, I cannot respond right now. Please try again later!',
    network: 'Network error occurred. Please check your internet connection!',
    timeout: 'Response took too long. Please try again!',
    overloaded: 'The AI model is overloaded. Trying a different model...'
  }
}