<template>
  <div class="preferences-view">
    <!-- Animált háttér -->
    <AnimatedBackground />
    
    <PageHeader
      :title="$t('title')"
      :subtitle="$t('subtitle')"
    />
    
    <div class="preferences-container">
      <!-- Loading State -->
      <!-- Main Content -->
      <div class="preferences-content">
        
        <!-- Tip Section -->
        <div class="tip-section">
          <div class="tip-header">
            <h3>{{ $t('tip.title') }}</h3>
          </div>
          <p class="tip-description">{{ $t('tip.description') }}</p>
        </div>

        <!-- Genre Preferences -->
        <div class="section genre-section">
          <h3 class="section-title">
            {{ $t('sections.genres.title') }}
          </h3>
          <p class="section-description">
            {{ $t('sections.genres.description') }}
          </p>
          
          <div class="genre-tags">
            <button 
              v-for="genre in localizedGenreList" 
              :key="genre.key"
              class="genre-tag"
              :class="{ active: preferences[genre.key] === 1 }"
              @click="toggleGenre(genre.key)"
            >
              {{ genre.localizedName }}
            </button>
          </div>
        </div>

        <!-- Year Range -->
        <div class="section year-section">
          <h3 class="section-title">
            {{ $t('sections.year_range.title') }}
          </h3>
          <p class="section-description">
            {{ $t('sections.year_range.description') }}
          </p>
          
          <div class="year-controls">
            <div class="year-input-group">
              <label for="min-year">{{ $t('sections.year_range.from') }}</label>
              <input
                id="min-year"
                v-model.number="preferences.min_year"
                type="number"
                :min="1900"
                :max="currentYear"
                class="year-input"
              />
            </div>
            
            <div class="year-separator">—</div>
            
            <div class="year-input-group">
              <label for="max-year">{{ $t('sections.year_range.to') }}</label>
              <input
                id="max-year"
                v-model.number="preferences.max_year"
                type="number"
                :min="1900"
                :max="currentYear + 5"
                class="year-input"
              />
            </div>
          </div>
          
          <div class="year-presets">
            <button 
              v-for="preset in yearPresets"
              :key="preset.name"
              class="preset-btn"
              @click="setYearPreset(preset)"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>

        <!-- Rating -->
        <div class="section rating-section">
          <h3 class="section-title">
            {{ $t('sections.rating.title') }}
          </h3>
          <p class="section-description">
            {{ $t('sections.rating.description') }}
          </p>
          
          <div class="rating-control">
            <input
              v-model.number="preferences.min_rating"
              type="range"
              min="0"
              max="8.5"
              step="0.5"
              class="rating-slider"
            />
            <div class="rating-display">
              <span class="rating-value">{{ preferences.min_rating }}</span>
              <span class="rating-stars">{{ getRatingStars(preferences.min_rating) }}</span>
            </div>
          </div>
          
          <div class="rating-labels">
            <span>{{ $t('sections.rating.any_rating') }}</span>
            <span>{{ $t('sections.rating.excellent_only') }}</span>
          </div>
        </div>

        <!-- Runtime Preference -->
        <div class="section runtime-section">
          <h3 class="section-title">
            {{ $t('sections.runtime.title') }}
          </h3>
          <p class="section-description">
            {{ $t('sections.runtime.description') }}
          </p>
          
          <div class="runtime-options">
            <div 
              v-for="option in runtimeOptions"
              :key="option.value"
              class="runtime-option"
              :class="{ active: preferences.runtime_preference === option.value }"
              @click="preferences.runtime_preference = option.value"
            >
              <div class="runtime-label">{{ $t(`sections.runtime.options.${option.value}.label`) }}</div>
              <div class="runtime-description">{{ $t(`sections.runtime.options.${option.value}.description`) }}</div>
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
            {{ $t('actions.reset') }}
          </button>
          
          <button 
            class="action-btn primary"
            @click="savePreferences"
            :disabled="saving || !hasChanges"
          >
            <span v-if="saving">{{ $t('saving') }}</span>
            <span v-else>{{ $t('actions.save') }}</span>
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
import AnimatedBackground from '../../components/ui/AnimatedBackground.vue';
import { preferencesService } from '../../services/preferences.js';
import { useAuth } from '../../composables/useAuth.js';

export default {
  name: 'PreferencesView',
  components: {
    PageHeader,
    AnimatedBackground
  },
  setup() {

    const router = useRouter();
    const { user } = useAuth();
    const { t } = useI18n();
    const i18n = useI18n();
    
    // Reactive state
    const loading = ref(true);
    const saving = ref(false);
    const message = ref('');
    const messageType = ref('success');
    
    const preferences = reactive({});
    const originalPreferences = ref({});
    
    // Computed properties
    const currentYear = computed(() => new Date().getFullYear());
    
    const hasChanges = computed(() => {
      return JSON.stringify(preferences) !== JSON.stringify(originalPreferences.value);
    });
    
    // Lokalizált genre lista
    const genreTranslations = {
      'Action': 'Akció',
      'Adventure': 'Kaland', 
      'Animation': 'Animáció',
      'Comedy': 'Vígjáték',
      'Crime': 'Krimi',
      'Documentary': 'Dokumentumfilm',
      'Drama': 'Dráma',
      'Family': 'Családi',
      'Fantasy': 'Fantasy',
      'History': 'Történelmi',
      'Horror': 'Horror',
      'Music': 'Zenés',
      'Mystery': 'Rejtély',
      'Romance': 'Romantikus',
      'Science Fiction': 'Sci-Fi',
      'Thriller': 'Thriller',
      'War': 'Háborús',
      'Western': 'Western',
      'Anime': 'Anime'
    };
    
    const localizedGenreList = computed(() => {
      const isHungarian = i18n.locale.value === 'hu';
      return genreList.map(genre => ({
        ...genre,
        localizedName: isHungarian ? genreTranslations[genre.name] || genre.name : genre.name
      }));
    });
    
    // Data from service
    const genreList = preferencesService.getGenreList();
    const runtimeOptions = preferencesService.getRuntimeOptions();
    
    const yearPresets = computed(() => [
      { name: t('sections.year_range.presets.all_time'), min_year: 1900, max_year: currentYear.value },
      { name: t('sections.year_range.presets.modern'), min_year: 2000, max_year: currentYear.value },
      { name: t('sections.year_range.presets.recent'), min_year: 2015, max_year: currentYear.value },
      { name: t('sections.year_range.presets.latest'), min_year: 2020, max_year: currentYear.value },
      { name: t('sections.year_range.presets.classics'), min_year: 1970, max_year: 1999 }
    ]);
    
    // Methods
    const loadPreferences = async () => {
      try {
        loading.value = true;
        // Using test user ID 1 for now - this should be replaced with actual user ID from auth
        const userId = user.value?.id || 1;

        const result = await preferencesService.getPreferences(userId);

        // A preferences service már feldolgozta a response-t
        Object.assign(preferences, result);
        originalPreferences.value = { ...result };




      } catch (error) {
        showMessage('Failed to load preferences', 'error');
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
        
        // Debug: log what we're sending
        console.log('Saving preferences data:', JSON.stringify(preferences, null, 2));
        
        // Save to backend
        // Using test user ID 3 for now - this should be replaced with actual user ID from auth
        const userId = user.value?.id || 3;
        const result = await preferencesService.savePreferences({
          userId: userId,
          ...preferences
        });
        
        console.log('Save result:', JSON.stringify(result, null, 2));
        
        // Update preferences with the saved data from backend
        if (result.success) {
          // Backend returns preferences data directly in the response object
          const { success, message, ...savedPreferences } = result;
          Object.assign(preferences, savedPreferences);
        }
        
        // Update original for change detection
        originalPreferences.value = { ...preferences };
        
        showMessage('Preferences saved successfully!', 'success');
        
      } catch (error) {
        showMessage('Failed to save preferences', 'error');
        console.error('Error saving preferences:', error);
      } finally {
        saving.value = false;
      }
    };
    
    const resetPreferences = async () => {
      if (confirm('Are you sure you want to reset all preferences to defaults?')) {
        try {
          // Using test user ID 1 for now - this should be replaced with actual user ID from auth
          const userId = user.value?.id || 3;
          await preferencesService.deletePreferences(userId);
          await loadPreferences();
          showMessage('Preferences reset to defaults', 'success');
        } catch (error) {
          showMessage('Failed to reset preferences', 'error');
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

      // NEM mentjük automatikusan - csak jelezzük hogy van változás

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
    
    // Auto-save on certain changes (debounced)
    let saveTimeout;
    watch(preferences, () => {
      if (hasChanges.value && !saving.value) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          // Auto-save after 2 seconds of no changes
          // savePreferences();
        }, 2000);
      }
    }, { deep: true });
    
    // Lifecycle
    onMounted(() => {

      // Temporarily skip user authentication check for testing
      // if (!user.value) {
      //   router.push('/login');
      //   return;
      // }

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
      hasChanges,
      
      // Data
      genreList,
      localizedGenreList,
      runtimeOptions,
      yearPresets,
      
      // Methods
      savePreferences,
      resetPreferences,
      toggleGenre,
      setYearPreset,
      getRatingStars,
      
      // Utils
      t
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
  border: 4px solid var(--border-secondary);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tip-section {
  background: var(--bg-accent);
  border: 1px solid var(--primary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.tip-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1rem;
}

.tip-header h3 {
  color: var(--primary);
  margin: 0;
  font-weight: 600;
}

.tip-description {
  color: var(--text-primary);
  margin: 0;
  line-height: 1.6;
  font-weight: 500;
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
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  font-size: 1.3rem;
  filter: grayscale(1) brightness(0.8);
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
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  user-select: none;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  box-shadow: var(--shadow-sm);
}

.genre-tag:hover {
  background: var(--bg-secondary);
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.genre-tag.active {
  background: linear-gradient(135deg, var(--primary) 0%, #b91c1c 100%);
  border-color: var(--primary);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
}

.genre-tag.active:hover {
  background: linear-gradient(135deg, var(--primary-hover) 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(229, 9, 20, 0.5);
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
  color: var(--text-primary);
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
  transition: all var(--transition-normal);
}

.year-input::-webkit-outer-spin-button,
.year-input::-webkit-inner-spin-button {
  -webkit-appearance: inner-spin-button;
  opacity: 1;
}

.year-input:focus {
  outline: none;
  border-color: var(--input-focus-border);
  background: var(--input-bg);
  box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.2);
}

.year-separator {
  color: var(--text-primary);
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
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;
}

.preset-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
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
  background: var(--bg-secondary);
  border-radius: 3px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.rating-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, var(--primary) 0%, #b91c1c 100%);
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
  color: var(--primary);
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
  transition: all var(--transition-normal);
  text-align: center;
}

.runtime-option:hover {
  background: var(--bg-secondary);
  border-color: var(--primary);
}

.runtime-option.active {
  background: linear-gradient(135deg, var(--primary) 0%, #b91c1c 100%);
  border-color: var(--primary);
  color: #ffffff;
}

.runtime-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.runtime-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Action Buttons */
.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-secondary);
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
  background: linear-gradient(135deg, var(--primary) 0%, #b91c1c 100%);
  color: #ffffff;
}

.action-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-hover) 0%, #991b1b 100%);
  box-shadow: 0 4px 16px rgba(229, 9, 20, 0.4);
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: var(--input-bg);
  border-color: var(--border-secondary);
  color: var(--text-primary);
}

.action-btn.secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--border-primary);
  color: var(--text-primary);
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
  background: var(--bg-accent);
  border: 1px solid var(--success);
  color: var(--success);
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  color: var(--error);
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
