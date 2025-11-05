import { ref, computed } from 'vue'
import { authService } from '@/services/api.js'
import { useRouter } from 'vue-router'
import { themeService } from '@/services/theme.js'
import { useLocale } from '@/composables/useLocale.js'

// Globális state a token és user adatoknak
const token = ref(localStorage.getItem('authToken') || null)
const user = ref(JSON.parse(localStorage.getItem('authUser') || 'null'))

export function useAuth() {
  const router = useRouter()
  const { loadLocaleFromServer } = useLocale()

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
          
          console.log('Login successful, loading user settings...')
          
          // Beállítások betöltése a szerverről
          await loadUserSettings()
          
          return { success: true }
        }
      }
      
      return { success: false, message: result.message }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed' }
    }
  }

  // Beállítások betöltése bejelentkezés után
  const loadUserSettings = async () => {
    try {
      // Téma betöltése
      await themeService.loadThemeFromServer()
      
      // Nyelv betöltése
      await loadLocaleFromServer()
      
      console.log('User settings loaded successfully')
    } catch (error) {
      console.error('Failed to load user settings:', error)
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

  // Update user data
  const updateUser = (updatedUserData) => {
    user.value = { ...user.value, ...updatedUserData }
    localStorage.setItem('authUser', JSON.stringify(user.value))
    console.log('User data updated in auth state:', user.value)
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
    initAuth,
    updateUser
  }
}
