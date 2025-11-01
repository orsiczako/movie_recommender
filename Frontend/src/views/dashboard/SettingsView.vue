<template>
  <DashboardLayout
    :title="$t('settings.title')"
    :show-back-button="true"
    back-route="/dashboard"
  >
    <!-- Settings container -->
    <div class="settings-container">
      
      <!-- Általános beállítások -->
      <div class="settings-section card">
        <h3 class="section-title">
          <i class="icon-general"></i>
          {{ $t('settings.general.title') }}
        </h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <label>{{ $t('settings.general.language') }}</label>
            <p>{{ $t('settings.general.language_desc') }}</p>
          </div>
          <div class="setting-control">
            <div class="setting-with-save">
              <select v-model="tempLanguage" class="language-select">
                <option value="hu">Magyar</option>
                <option value="en">English</option>
              </select>
              <BaseButton 
                @click="saveLanguage"
                variant="primary"
                size="small"
                :loading="savingLanguage"
              >
                {{ $t('settings.general.language_save') }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label>{{ $t('settings.general.theme') }}</label>
            <p>{{ $t('settings.general.theme_desc') }}</p>
          </div>
          <div class="setting-control">
            <div class="setting-with-save">
              <select v-model="tempTheme" class="theme-select">
                <option value="light">{{ $t('common.light') }}</option>
                <option value="dark">{{ $t('common.dark') }}</option>
              </select>
              <BaseButton 
                @click="saveTheme"
                variant="primary"
                size="small"
                :loading="savingTheme"
              >
                {{ $t('settings.general.theme_save') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Alkalmazás beállítások -->
      <div class="settings-section card">
        <h3 class="section-title">
          <i class="icon-app"></i>
          {{ $t('settings.app.title') }}
        </h3>

        <div class="setting-item">
          <div class="setting-info">
            <label>{{ $t('settings.app.clear_favorites') }}</label>
            <p>{{ $t('settings.app.clear_favorites_desc') }}</p>
          </div>
          <div class="setting-control">
            <BaseButton 
              :loading="loading"
              variant="danger"
              size="medium"
              @click="clearFavorites"
            >
              {{ $t('settings.app.clear_favorites_button') }}
            </BaseButton>
          </div>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { interactionsService } from '@/services/api.js'
import { settingsService } from '@/services/settings.js'
import { useAuth } from '@/composables/useAuth.js'
import { useNotification } from '@/composables/useNotification.js'
import { useLocale } from '@/composables/useLocale.js'
import { themeService } from '@/services/theme.js'

export default {
  name: 'SettingsView',
  components: {
    DashboardLayout,
    BaseButton
  },
  setup() {
    const { user } = useAuth()
    const { notify } = useNotification()
    const { currentLocale, setLocale } = useLocale()
    
    return {
      authUser: user,
      notify,
      currentLocale,
      setLocale
    }
  },
  data() {
    return {
      loading: false,
      savingLanguage: false,
      savingTheme: false,
      tempLanguage: this.currentLocale,
      tempTheme: themeService.getCurrentTheme(),
      currentSettings: null
    }
  },
  async mounted() {
    await this.loadCurrentSettings()
  },
  methods: {
    async loadCurrentSettings() {
      try {
        this.currentSettings = await settingsService.getSettings()
        this.tempLanguage = this.currentSettings.language || 'hu'
        this.tempTheme = this.currentSettings.theme || 'light'
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    },

    async saveLanguage() {
      try {
        this.savingLanguage = true
        console.log('Saving language:', this.tempLanguage)
        
        const result = await settingsService.updateLanguage(this.tempLanguage)
        console.log('Language save result:', result)
        
        // Azonnal alkalmazzuk a nyelvet
        await this.setLocale(this.tempLanguage, false) // Ne mentse újra a szerverre
        
        this.notify.success(this.$t('settings.general.language_saved'))
        
        // Frissítjük a jelenlegi beállításokat
        await this.loadCurrentSettings()
        
        // Opcionális: újraindítás a biztonság kedvéért
        setTimeout(() => {
          window.location.reload()
        }, 1500)
        
      } catch (error) {
        console.error('Failed to save language:', error)
        this.notify.error(this.$t('settings.general.language_save_failed'))
      } finally {
        this.savingLanguage = false
      }
    },

    async saveTheme() {
      try {
        this.savingTheme = true
        console.log('Saving theme:', this.tempTheme)
        
        const result = await settingsService.updateTheme(this.tempTheme)
        console.log('Theme save result:', result)
        
        // Azonnal alkalmazni a témát és menteni localStorage-ba is
        themeService.setTheme(this.tempTheme, true) // true = mentse localStorage-ba is
        
        this.notify.success(this.$t('settings.general.theme_saved'))
        
        // Frissítjük a jelenlegi beállításokat
        await this.loadCurrentSettings()
        
      } catch (error) {
        console.error('Failed to save theme:', error)
        this.notify.error(this.$t('settings.general.theme_save_failed'))
      } finally {
        this.savingTheme = false
      }
    },
    async clearFavorites() {
      try {
        this.loading = true;
        const userId = this.authUser?.account_id || 3; // Ugyanaz mint FavoriteMoviesView-ban

        // Call backend to clear all favorites for this user
        const result = await interactionsService.clearAllFavorites(userId);
        if (result.success) {
          this.notify.success(this.$t('settings.app.clear_favorites_success'));
          // Optionally, emit a global event to refresh favorites
          window.dispatchEvent(new CustomEvent('favorites-updated', { detail: { action: 'CLEAR_ALL' } }));
        } else {
          this.notify.error(this.$t('settings.app.clear_favorites_error'));
        }
      } catch (error) {
        this.notify.error(this.$t('settings.app.clear_favorites_error'));
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
/* Settings container */
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Settings sections */
.settings-section {
  padding: 25px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: var(--text-primary);
  font-weight: 600;
}

/* Setting items */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-primary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
  margin-right: 20px;
}

.setting-info label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: block;
  font-size: 0.95rem;
}

.setting-info p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.setting-control {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-secondary);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Select input */
.select-input, .language-select, .theme-select {
  padding: 8px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  min-width: 120px;
  margin-right: 8px;
}

.select-input:focus, .language-select:focus, .theme-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Save button styling */
.save-button {
  min-width: 80px;
  height: 36px;
  font-size: 0.85rem;
}

/* Button spacing */
.setting-buttons, .setting-with-save {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Advanced section */
.advanced-section {
  border: 1px solid #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.advanced-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Info section */
.info-section {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-item span {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
}

/* Icons */
.icon-general::before { content: ""; }
.icon-app::before { content: ""; }

@media (max-width: 768px) {
  .settings-container {
    gap: 20px;
  }

  .settings-section {
    padding: 20px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .setting-info {
    margin-right: 0;
  }
}
</style>

