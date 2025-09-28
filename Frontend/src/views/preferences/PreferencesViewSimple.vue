<template>
  <div class="preferences-view">
    <PageHeader
      title="Film Preferenciáid"
      subtitle="Állítsd be milyen filmeket szeretsz!"
    />
    
    <div class="preferences-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
      </div>

      <!-- Main Content -->
      <div v-else class="preferences-content">
        
        <!-- Progress Indicator -->
        <div class="progress-section">
          <div class="progress-header">
            <h3>Profil teljesség</h3>
            <span class="progress-percentage">{{ completeness }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: completeness + '%' }"
            ></div>
          </div>
        </div>

        <!-- Genre Preferences -->
        <div class="section genre-section">
          <h3 class="section-title">
            Műfaj Preferenciák
          </h3>
          <p class="section-description">
            Válaszd ki a kedvenc műfajaidat
          </p>
          
          <div class="genre-tags">
            <div 
              v-for="genre in genreList" 
              :key="genre.key"
              :class="['genre-tag', { 'active': preferences[genre.key] === 1 }]"
              @click="toggleGenre(genre.key)"
            >
              {{ getGenreTranslation(genre.key.replace('genre_', '')) }}
            </div>
          </div>
        </div>

        <!-- Year Range -->
        <div class="section year-section">
          <h3 class="section-title">
            Év Tartomány
          </h3>
          <p class="section-description">
            Milyen időszakból szeretsz filmeket?
          </p>
          
          <div class="year-controls">
            <div class="year-input-group">
              <label>Ettől</label>
              <input
                v-model.number="preferences.min_year"
                type="number"
                :min="1900"
                :max="currentYear"
                class="year-input"
              />
            </div>
            
            <span class="year-separator">—</span>
            
            <div class="year-input-group">
              <label>Eddig</label>
              <input
                v-model.number="preferences.max_year"
                type="number"
                :min="1900"
                :max="currentYear"
                class="year-input"
              />
            </div>
          </div>
          
          <div class="year-presets">
            <button 
              v-for="preset in yearPresets"
              :key="preset.key"
              class="preset-btn"
              @click="setYearPreset(preset)"
            >
              {{ getYearPresetTranslation(preset.key) }}
            </button>
          </div>
        </div>

        <!-- Rating -->
        <div class="section rating-section">
          <h3 class="section-title">
            Minimum Értékelés
          </h3>
          <p class="section-description">
            Milyen értékeléstől ajánljunk filmeket?
          </p>
          
          <div class="rating-control">
            <input
              v-model.number="preferences.min_rating"
              type="range"
              min="0"
              max="10"
              step="0.5"
              class="rating-slider"
            />
            <div class="rating-display">
              <span class="rating-value">{{ preferences.min_rating || 0 }}</span>
              <span class="rating-stars">{{ getRatingStars(preferences.min_rating || 0) }}</span>
            </div>
          </div>
          
          <div class="rating-labels">
            <span>Bármilyen</span>
            <span>Csak kiváló</span>
          </div>
        </div>

        <!-- Runtime Preference -->
        <div class="section runtime-section">
          <h3 class="section-title">
            Film Hosszúság
          </h3>
          <p class="section-description">
            Milyen hosszú filmeket szeretsz?
          </p>
          
          <div class="runtime-options">
            <div 
              v-for="option in runtimeOptions"
              :key="option.value"
              class="runtime-option"
              :class="{ active: preferences.runtime_preference === option.value }"
              @click="preferences.runtime_preference = option.value"
            >
              <div class="runtime-label">{{ option.label }}</div>
              <div class="runtime-description">{{ option.description }}</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="actions-section">
          <button 
            class="action-btn secondary"
            @click="resetPreferences"
            :disabled="saving"
          >
            Alapértelmezett
          </button>
          
          <button 
            class="action-btn primary"
            @click="savePreferences"
            :disabled="saving || !hasChanges"
          >
            <span v-if="saving">Mentés...</span>
            <span v-else>Mentés</span>
          </button>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="message" class="message" :class="messageType">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import PageHeader from '../../components/ui/PageHeader.vue';
import { preferencesService } from '../../services/preferences.js';
import { useAuth } from '../../composables/useAuth.js';

export default {
  name: 'PreferencesViewSimple',
  components: {
    PageHeader
  },
  setup() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useI18n();
    
    // Reactive state
    const loading = ref(true);
    const saving = ref(false);
    const message = ref('');
    const messageType = ref('success');
    
    const preferences = reactive({
      min_year: 1990,
      max_year: new Date().getFullYear(),
      min_rating: 6.0,
      runtime_preference: 'any'
    });
    const originalPreferences = ref({});
    
    // Translations
    const translations = computed(() => ({
      title: t('preferences.title'),
      subtitle: t('preferences.subtitle'),
      loading: t('preferences.loading'),
      saving: t('preferences.saving'),
      profile_completeness: t('preferences.profile_completeness'),
      sections: {
        genres: {
          title: t('preferences.sections.genres.title'),
          description: t('preferences.sections.genres.description')
        },
        year_range: {
          title: t('preferences.sections.year_range.title'),
          description: t('preferences.sections.year_range.description'),
          from: t('preferences.sections.year_range.from'),
          to: t('preferences.sections.year_range.to'),
          presets: {
            all_time: t('preferences.sections.year_range.presets.all_time'),
            modern: t('preferences.sections.year_range.presets.modern'),
            recent: t('preferences.sections.year_range.presets.recent'),
            latest: t('preferences.sections.year_range.presets.latest'),
            classics: t('preferences.sections.year_range.presets.classics')
          }
        },
        rating: {
          title: t('preferences.sections.rating.title'),
          description: t('preferences.sections.rating.description'),
          any_rating: t('preferences.sections.rating.any_rating'),
          excellent_only: t('preferences.sections.rating.excellent_only')
        },
        runtime: {
          title: t('preferences.sections.runtime.title'),
          description: t('preferences.sections.runtime.description')
        }
      },
      actions: {
        save: t('preferences.actions.save'),
        reset: t('preferences.actions.reset'),
        reset_confirm: t('preferences.actions.reset_confirm')
      },
      messages: {
        save_success: t('preferences.messages.save_success'),
        save_error: t('preferences.messages.save_error'),
        load_error: t('preferences.messages.load_error'),
        reset_success: t('preferences.messages.reset_success'),
        reset_error: t('preferences.messages.reset_error')
      }
    }));
    
    // Computed properties
    const currentYear = computed(() => new Date().getFullYear());
    
    const completeness = computed(() => {
      return preferencesService.calculateCompleteness(preferences);
    });
    
    const hasChanges = computed(() => {
      return JSON.stringify(preferences) !== JSON.stringify(originalPreferences.value);
    });
    
    // Data from service
    const genreList = preferencesService.getGenreList();
    const runtimeOptions = preferencesService.getRuntimeOptions();
    
    const yearPresets = ref([
      { key: 'all_time', min_year: 1900, max_year: currentYear.value },
      { key: 'modern', min_year: 2000, max_year: currentYear.value },
      { key: 'recent', min_year: 2015, max_year: currentYear.value },
      { key: 'latest', min_year: 2020, max_year: currentYear.value },
      { key: 'classics', min_year: 1970, max_year: 1999 }
    ]);
    
    // Methods
    const loadPreferences = async () => {
      try {
        loading.value = true;
        
        // Mock user - később javítom
        const mockUserId = 1;
        const result = await preferencesService.getPreferences(mockUserId);
        
        // Copy preferences to reactive object
        Object.assign(preferences, result.data);
        originalPreferences.value = { ...result.data };
        
      } catch (error) {
        showMessage('Hiba a preferenciák betöltésekor', 'error');
        console.error('Error loading preferences:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const savePreferences = async () => {
      try {
        saving.value = true;
        
        // Validate preferences
        const validation = preferencesService.validatePreferences(preferences);
        if (!validation.isValid) {
          showMessage(validation.errors[0], 'error');
          return;
        }
        
        // Save to backend
        await preferencesService.savePreferences({
          userId: 3, // Mock user ID
          ...preferences
        });
        
        // Update original for change detection
        originalPreferences.value = { ...preferences };
        
        showMessage(translations.value.messages.save_success, 'success');
        
      } catch (error) {
        showMessage(translations.value.messages.save_error, 'error');
        console.error('Error saving preferences:', error);
      } finally {
        saving.value = false;
      }
    };
    
    const resetPreferences = async () => {
      if (confirm(translations.value.actions.reset_confirm)) {
        try {
          await preferencesService.deletePreferences(1); // Mock user ID
          await loadPreferences();
          showMessage(translations.value.messages.reset_success, 'success');
        } catch (error) {
          showMessage(translations.value.messages.reset_error, 'error');
        }
      }
    };
    
    const toggleGenre = (genreKey) => {
      // Ha nincs beállítva vagy null, akkor like (1)
      // Ha like (1), akkor váltás null-ra (semleges/kiválasztva)
      const currentValue = preferences[genreKey];
      
      if (currentValue === 1) {
        preferences[genreKey] = null; // Unselect
      } else {
        preferences[genreKey] = 1; // Select
      }
    };

    const setYearPreset = (preset) => {
      preferences.min_year = preset.min_year;
      preferences.max_year = preset.max_year;
    };
    
    const getRatingStars = (rating) => {
      const stars = Math.floor(rating / 2);
      return '*'.repeat(stars) + '-'.repeat(5 - stars);
    };
    
    const showMessage = (text, type = 'success') => {
      message.value = text;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 5000);
    };
    
    // Lifecycle
    onMounted(() => {
      loadPreferences();
    });
    
    return {
      // State
      loading,
      saving,
      message,
      messageType,
      preferences,
      
      // Computed
      currentYear,
      completeness,
      hasChanges,
      translations,
      
      // Data
      genreList,
      runtimeOptions,
      yearPresets,
      
      // Methods
      savePreferences,
      resetPreferences,
      toggleGenre,
      setYearPreset,
      getRatingStars,
      getGenreTranslation: (genre) => t(`preferences.genres.${genre}`),
      getYearPresetTranslation: (preset) => translations.value.sections.year_range.presets[preset],
      getRuntimeTranslation: (runtime) => t(`preferences.sections.runtime.options.${runtime}.label`)
    };
  }
};
</script>

<style scoped>
.preferences-view {
  min-height: calc(100vh - 80px);
  background: var(--bg-primary);
  padding: 2rem;
  color: var(--text-primary);
}

.preferences-container {
  max-width: 900px;
  margin: 0 auto;
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: var(--card-shadow);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid #e50914;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-section {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-percentage {
  font-weight: 600;
  color: #e50914;
}

.progress-bar {
  height: 8px;
  background: var(--border-primary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e50914, #ff6b6b);
  transition: width 0.3s ease;
}

.section {
  margin-bottom: 3rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.section:hover {
  box-shadow: var(--card-hover-shadow);
  border-color: var(--primary);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Genre Tags */
.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 1.5rem;
}

.genre-tag {
  padding: 10px 16px;
  background: var(--card-bg);
  border: 2px solid var(--border-primary);
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.genre-tag:hover {
  background: var(--bg-accent);
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.genre-tag.active {
  background: linear-gradient(135deg, #e50914 0%, #b91c1c 100%);
  border-color: #e50914;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
}

/* Year Controls */
.year-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.year-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.year-input-group label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.year-input {
  padding: 0.75rem 1rem;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  width: 100px;
  transition: all 0.3s ease;
}

.year-input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--input-bg);
  box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.2);
}

.year-separator {
  color: var(--text-secondary);
  font-size: 1.2rem;
  font-weight: 600;
}

.year-presets {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 0.5rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.preset-btn:hover {
  background: var(--bg-accent);
  border-color: var(--primary);
  color: var(--primary);
}

/* Rating Controls */
.rating-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.rating-slider {
  flex: 1;
  height: 6px;
  background: var(--border-primary);
  border-radius: 3px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.rating-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #e50914 0%, #b91c1c 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(229, 9, 20, 0.4);
}

.rating-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.rating-value {
  color: #e50914;
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
}

.rating-stars {
  color: #fbbf24;
  font-size: 1rem;
}

.rating-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

/* Runtime Selection */
.runtime-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.runtime-option {
  padding: 1rem;
  background: var(--card-bg);
  border: 2px solid var(--border-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.runtime-option:hover {
  background: var(--bg-accent);
  border-color: var(--primary);
}

.runtime-option.active {
  background: linear-gradient(135deg, #e50914 0%, #b91c1c 100%);
  border-color: #e50914;
  color: #ffffff;
}

.runtime-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.runtime-description {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.runtime-option.active .runtime-description {
  color: rgba(255, 255, 255, 0.8);
}

/* Action Buttons */
.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  min-width: 140px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #e50914 0%, #b91c1c 100%);
  color: #ffffff;
}

.action-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #cc0812 0%, #991b1b 100%);
  box-shadow: 0 4px 16px rgba(229, 9, 20, 0.4);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: var(--card-bg);
  border-color: var(--border-secondary);
  color: var(--text-secondary);
}

.action-btn.secondary:hover {
  background: var(--bg-accent);
  border-color: var(--primary);
  color: var(--primary);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Message */
.message {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-weight: 500;
  text-align: center;
}

.message.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Responsive */
@media (max-width: 768px) {
  .preferences-view {
    padding: 1rem;
  }
  
  .preferences-container {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .year-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .genre-tags {
    gap: 8px;
  }
  
  .actions-section {
    flex-direction: column;
  }
  
  .runtime-options {
    grid-template-columns: 1fr;
  }
}
</style>
