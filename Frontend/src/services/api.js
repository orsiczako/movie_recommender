import axios from 'axios'

// API base URL - development módban explicit backend URL, production-ben abszolút
const BASE_URL = import.meta.env.DEV ? 'http://localhost:3000' : import.meta.env.VITE_API_BASE_URL

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    
    // Token hozzáadása az Authorization header-höz
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`API Error: ${error.response?.status || 'Network Error'} ${error.config?.url}`)
    return Promise.reject(error)
  }
)

export const authService = {
  async login(username, password) {
    try {
      const response = await apiClient.post('/api/user/login', {
        username,
        password
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login error'
      }
    }
  },

  async register(username, password, email, fullName) {
    try {
      const response = await apiClient.post('/api/user/register', {
        username,
        password,
        email,
        fullName
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration error'
      }
    }
  },

  async forgotPassword(email, emailTemplate) {
    try {
      const response = await apiClient.post('/api/user/forgot-password', {
        email,
        emailTemplate
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password recovery error'
      }
    }
  },

  async resetPassword(token, password) {
    try {
      const response = await apiClient.post('/api/user/reset-password', {
        token,
        password
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset error'
      }
    }
  }
}

export const settingsService = {
  async getLanguage() {
    try {
      const response = await apiClient.get('/api/settings')
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Settings error'
      }
    }
  },

  async setLanguage(language) {
    try {
      const response = await apiClient.post('/api/settings', { language })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Settings error'
      }
    }
  }
}

export const interactionsService = {
  async swipeMovie(userId, movieId, interactionType) {
    try {
      const response = await apiClient.post('/api/interactions', {
        userId,
        movieId,
        interactionType
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to save movie interaction'
      }
    }
  },

  async getFavoriteMovies(userId, page = 1, limit = 100, extraParams = {}) {
    try {
      // EGYSZERŰSÍTETT CACHE-BUSTING - csak URL params
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      
      const response = await apiClient.get(`/api/interactions/${userId}`, {
        params: {
          interactionType: 'LIKE',
          page,
          limit,
          _t: timestamp,
          _r: randomId,
          _cb: `favorites_${timestamp}`,
          _nocache: 'true',
          _force_refresh: Date.now(),
          ...extraParams // Extra paraméterek külső forrásból
        }
        // Eltávolítottam a headers-öket amíg a CORS nem rendben van
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load favorite movies'
      }
    }
  },

  async getUserInteractionStats(userId) {
    try {
      const response = await apiClient.get(`/api/interactions/${userId}/stats`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to load interaction stats'
      }
    }
  },

  async removeInteraction(userId, movieId) {
    try {
      const response = await apiClient.delete(`/api/interactions/${userId}/${movieId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to remove interaction'
      }
    }
  },

  async clearAllFavorites(userId) {
    try {
      const response = await apiClient.delete(`/api/interactions/${userId}/favorites`)
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to clear favorites'
      }
    }
  }
}

export default apiClient

// Export as 'api' for convenience
export { apiClient as api }

