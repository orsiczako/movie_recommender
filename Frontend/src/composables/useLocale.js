import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { settingsService } from '@/services/settings.js'

const currentLocale = ref(localStorage.getItem('selectedLanguage') || 'hu')

export function useLocale() {
  const { locale, t } = useI18n()

  const setLocale = async (newLocale, saveToServer = true) => {
    currentLocale.value = newLocale
    locale.value = newLocale
    localStorage.setItem('selectedLanguage', newLocale)

    // Mentés a szerverre ha van token
    if (saveToServer && hasAuthToken()) {
      await saveLanguageToServer(newLocale)
    }
  }

  const saveLanguageToServer = async (language) => {
    try {
      await settingsService.updateLanguage(language)
      console.log('Language saved to server:', language)
    } catch (error) {
      console.error('Failed to save language to server:', error)
    }
  }

  const hasAuthToken = () => {
    return !!localStorage.getItem('authToken')
  }

  const toggleLocale = async () => {
    const newLocale = currentLocale.value === 'hu' ? 'en' : 'hu'
    await setLocale(newLocale)
  }

  const initLocale = () => {
    locale.value = currentLocale.value
  }

  // Beállítások betöltése a szerverről
  const loadLocaleFromServer = async () => {
    if (!hasAuthToken()) return

    try {
      const settings = await settingsService.getSettings()
      if (settings.language && settings.language !== currentLocale.value) {
        await setLocale(settings.language, false) // Ne mentse vissza a szerverre
      }
    } catch (error) {
      console.error('Failed to load language from server:', error)
    }
  }

  return {
    currentLocale,
    setLocale,
    toggleLocale,
    initLocale,
    loadLocaleFromServer,
    t
  }
}

