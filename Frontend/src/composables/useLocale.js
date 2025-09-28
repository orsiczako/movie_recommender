import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const currentLocale = ref(localStorage.getItem('selectedLanguage') || 'hu')

export function useLocale() {
  const { locale, t } = useI18n()

  const setLocale = (newLocale) => {
    currentLocale.value = newLocale
    locale.value = newLocale
    localStorage.setItem('selectedLanguage', newLocale)
  }

  const toggleLocale = () => {
    const newLocale = currentLocale.value === 'hu' ? 'en' : 'hu'
    setLocale(newLocale)
  }

  const initLocale = () => {
    locale.value = currentLocale.value
  }

  return {
    currentLocale,
    setLocale,
    toggleLocale,
    initLocale,
    t
  }
}

