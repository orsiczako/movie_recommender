import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'

// Router - új struktúra
import router from '@/router'

// CSS importálása - új egyszerűsített struktúra
import './assets/design-system.css' // Fő design rendszer
import './assets/components.css'    // Komponens stílusok

// I18n nyelvi fájlok
import messages from './locales/index.js'

// Composables
import { useTheme } from '@/composables/useTheme.js'

// Router beállítás már a router/index.js-ben van

// I18n beállítás
const i18n = createI18n({
  legacy: false, // Composition API mode
  locale: localStorage.getItem('selectedLanguage') || 'hu',
  fallbackLocale: 'hu',
  messages
})

// Téma inicializálása
try {
  const { initTheme } = useTheme()
  initTheme()
} catch (error) {
  console.error('Theme initialization failed:', error)
}

// Vue alkalmazás létrehozása
const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')

