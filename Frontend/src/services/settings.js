import { authService } from './api.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class SettingsService {
  async getSettings() {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        return await response.json()
      } else {
        throw new Error('Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      return {
        language: 'hu',
        theme: 'light',
        auto_save_interval: 60,
        results_per_page: 25,
        animation_speed: 'normal'
      }
    }
  }

  async updateSettings(settings) {
    try {
      const token = localStorage.getItem('authToken')
      console.log('Updating settings:', settings)
      console.log('Using token:', token ? 'Present' : 'Missing')
      
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      const result = await response.json()
      console.log('Settings update response:', result)

      if (response.ok) {
        return result
      } else {
        throw new Error(result.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  }

  async updateLanguage(language) {
    return this.updateSettings({ language })
  }

  async updateTheme(theme) {
    return this.updateSettings({ theme })
  }
}

export const settingsService = new SettingsService()