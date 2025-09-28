// Theme management service
export class ThemeService {
  constructor() {
    this.currentTheme = 'light'
    this.listeners = []
  }

  init() {
    this.currentTheme = this.getInitialTheme()
    this.applyTheme(this.currentTheme)
    this.setupSystemThemeListener()
  }

  getInitialTheme() {
    // Ellenőrizzük a localStorage-t
    const savedTheme = localStorage.getItem('selected-theme')
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme
    }
    
    // Ha nincs mentett téma, használjuk a rendszer preferenciát
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  }

  setTheme(theme) {
    if (!['light', 'dark'].includes(theme)) {
      console.error('Invalid theme:', theme)
      return
    }

    this.currentTheme = theme
    localStorage.setItem('selected-theme', theme)
    this.applyTheme(theme)
    this.notifyListeners(theme)
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

