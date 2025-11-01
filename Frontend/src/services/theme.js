import { settingsService } from './settings.js'

// Theme management service
export class ThemeService {
  constructor() {
    this.currentTheme = 'light'
    this.listeners = []
  }

  init() {
    this.currentTheme = this.getInitialTheme()
    console.log('ThemeService initialized with theme:', this.currentTheme)
    this.applyTheme(this.currentTheme)
    this.setupSystemThemeListener()
  }

  getInitialTheme() {
    // Ellenőrizzük a localStorage-t
    const savedTheme = localStorage.getItem('selected-theme')
    console.log('Saved theme from localStorage:', savedTheme)
    
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme
    }
    
    // Ha nincs mentett téma, használjuk a rendszer preferenciát
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('Using system dark theme preference')
      return 'dark'
    }
    
    console.log('Using default light theme')
    return 'light'
  }

  setTheme(theme, saveToServer = true) {
    if (!['light', 'dark'].includes(theme)) {
      console.error('Invalid theme:', theme)
      return
    }

    console.log('Setting theme to:', theme, 'saveToServer:', saveToServer)
    this.currentTheme = theme
    localStorage.setItem('selected-theme', theme)
    this.applyTheme(theme)
    this.notifyListeners(theme)

    // Mentés a szerverre ha van token
    if (saveToServer && this.hasAuthToken()) {
      this.saveThemeToServer(theme)
    }
  }

  async saveThemeToServer(theme) {
    try {
      console.log('Saving theme to server:', theme)
      const result = await settingsService.updateTheme(theme)
      console.log('Theme saved to server successfully:', result)
    } catch (error) {
      console.error('Failed to save theme to server:', error)
    }
  }

  hasAuthToken() {
    return !!localStorage.getItem('authToken')
  }

  getTheme() {
    return this.currentTheme
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.className = `theme-${theme}`
  }

  // Event listener rendszer
  addThemeChangeListener(callback) {
    this.listeners.push(callback)
  }

  removeThemeChangeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback)
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  // Régi függvények kompatibilitáshoz
  addListener(callback) {
    this.addThemeChangeListener(callback)
  }

  removeListener(callback) {
    this.removeThemeChangeListener(callback)
  }

  notifyListeners(theme) {
    this.listeners.forEach(callback => callback(theme))
  }

  // Rendszer téma változás figyelése
  setupSystemThemeListener() {
    this.watchSystemTheme()
  }

  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addListener((e) => {
        // Csak akkor változtatunk, ha nincs manuálisan beállított téma
        if (!localStorage.getItem('selected-theme')) {
          this.setTheme(e.matches ? 'dark' : 'light')
        }
      })
    }
  }

  // Beállítások betöltése a szerverről
  async loadThemeFromServer() {
    if (!this.hasAuthToken()) return

    try {
      console.log('Loading theme from server...')
      const settings = await settingsService.getSettings()
      console.log('Server settings for theme:', settings)
      
      if (settings.theme && settings.theme !== this.currentTheme) {
        console.log('Applying theme from server:', settings.theme)
        this.setTheme(settings.theme, false) // Ne mentse vissza a szerverre
      } else {
        console.log('No theme change needed. Current:', this.currentTheme, 'Server:', settings.theme)
      }
    } catch (error) {
      console.error('Failed to load theme from server:', error)
    }
  }
}

// Singleton példány
export const themeService = new ThemeService()

// Vue plugin
export default {
  install(app) {
    app.config.globalProperties.$theme = themeService
    app.provide('theme', themeService)
    
    // Indításkor figyelni kezdjük a rendszer témát
    themeService.watchSystemTheme()
  }
}

