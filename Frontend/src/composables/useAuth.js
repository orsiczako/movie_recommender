import { ref, computed } from 'vue'
import { authService } from '@/services/api.js'
import { useRouter } from 'vue-router'

// Globális state a token és user adatoknak
const token = ref(localStorage.getItem('authToken') || null)
const user = ref(JSON.parse(localStorage.getItem('authUser') || 'null'))

export function useAuth() {
  const router = useRouter()

  // Computed értékek
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  // Login funkció
  const login = async (username, password) => {
    try {
      const result = await authService.login(username, password)
      
      if (result.success && result.data) {
        // Token és user adatok mentése
        const { token: authToken, user: userData } = result.data
        
        if (authToken) {
          token.value = authToken
          user.value = userData
          
          // Mentés localStorage-ba
          localStorage.setItem('authToken', authToken)
          localStorage.setItem('authUser', JSON.stringify(userData))
          
          return { success: true }
        }
      }
      
      return { success: false, message: result.message }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed' }
    }
  }

  // Logout funkció
  const logout = () => {
    token.value = null
    user.value = null
    
    // Törlés localStorage-ből
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    
    // Redirect login oldalra
    router.push('/login')
  }

  // Token validálás
  const validateToken = () => {
    if (!token.value) {
      return false
    }
    
    try {
      // JWT token dekódolása és lejárat ellenőrzése
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const now = Date.now() / 1000
      
      if (payload.exp && payload.exp < now) {
        // Token lejárt
        logout()
        return false
      }
      
      return true
    } catch (error) {
      // Hibás token formátum
      logout()
      return false
    }
  }

  // Automatikus token validálás app indításkor
  const initAuth = () => {
    if (token.value && !validateToken()) {
      logout()
    }
  }

  return {
    // State
    token: computed(() => token.value),
    user: currentUser,
    isAuthenticated,
    
    // Methods
    login,
    logout,
    validateToken,
    initAuth
  }
}
