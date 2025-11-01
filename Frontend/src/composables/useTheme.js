import { ref, watch } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    applyTheme()
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  const applyTheme = () => {
    document.documentElement.classList.remove('theme-light', 'theme-dark')
    document.documentElement.classList.add(`theme-${theme.value}`)
  }

  const initTheme = () => {
    applyTheme()
  }

  // Watch for theme changes
  watch(theme, () => {
    applyTheme()
  })

  return {
    theme: theme,
    toggleTheme,
    setTheme,
    initTheme,
    isDark: () => theme.value === 'dark'
  }
}

