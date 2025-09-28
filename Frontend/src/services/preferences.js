import { api } from './api.js';

/**
 * Film preferenciák API szolgáltatás
 * Backend preferences endpoints kezelése
 */
class PreferencesService {
  
  /**
   * Felhasználó preferenciáinak lekérése
   * @param {number} userId - Felhasználó ID
   * @returns {Promise<Object>} Preferenciák objektum
   */
  async getPreferences(userId = 3) {
    try {
      const response = await api.get(`/api/preferences/${userId}`);

      // A backend response struktúrája: { success, message, ...preferenceFields }
      // Kivesszük a success és message mezőket, a maradék a preferences data
      const { success, message, ...preferencesData } = response.data;
      
      return preferencesData;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      
      // Ha nincs beállítva preferencia, alapértelmezett értékeket adunk vissza
      if (error.response?.status === 404) {
        return this.getDefaultPreferences(userId);
      }
      
      throw new Error('Failed to fetch preferences');
    }
  }

  /**
   * Preferenciák mentése (teljes frissítés)
   * @param {Object} preferences - Preferenciák objektum
   * @returns {Promise<Object>} Mentés eredménye
   */
  async savePreferences(preferences) {
    try {
      // Adjunk hozzá userId-t ha nincs benne
      if (!preferences.userId && !preferences.user_id) {
        preferences.userId = 3; // Alapértelmezett user ID
      }
      
      const response = await api.post('/api/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }

  /**
   * Preferenciák részleges frissítése
   * @param {number} userId - Felhasználó ID
   * @param {Object} updates - Frissítendő mezők
   * @returns {Promise<Object>} Frissítés eredménye
   */
  async updatePreferences(userId, updates) {
    try {
      const response = await api.put(`/api/preferences/${userId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Preferenciák törlése (reset)
   * @param {number} userId - Felhasználó ID
   * @returns {Promise<Object>} Törlés eredménye
   */
  async deletePreferences(userId) {
    try {
      const response = await api.delete(`/api/preferences/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting preferences:', error);
      throw new Error('Failed to delete preferences');
    }
  }

  /**
   * Alapértelmezett preferenciák objektum
   * @param {number} userId - Felhasználó ID
   * @returns {Object} Alapértelmezett preferenciák
   */
  getDefaultPreferences(userId) {
    return {
      data: {
        user_id: userId,
        // Műfaj preferenciák (null = nincs beállítva)
        genre_action: null,
        genre_adventure: null,
        genre_animation: null,
        genre_comedy: null,
        genre_crime: null,
        genre_documentary: null,
        genre_drama: null,
        genre_family: null,
        genre_fantasy: null,
        genre_history: null,
        genre_horror: null,
        genre_music: null,
        genre_mystery: null,
        genre_romance: null,
        genre_science_fiction: null,
        genre_thriller: null,
        genre_war: null,
        genre_western: null,
        // Új műfajok
        genre_anime: null,
        // Év és rating beállítások
        min_year: 1990,
        max_year: new Date().getFullYear(),
        min_rating: 6.0, // Max 8.5-ig mehet
        // Egyéb preferenciák
        runtime_preference: 'any',
        preferred_languages: null,
        prefer_classic: 0,
        prefer_modern: 1,
        prefer_recent: 1
      }
    };
  }

  /**
   * Műfaj lista lekérése UI számára
   * @returns {Array} Műfajok objektum tömbje
   */
  getGenreList() {
    return [
      // Eredeti műfajok
      { key: 'genre_action', name: 'Action', tmdbId: 28 },
      { key: 'genre_adventure', name: 'Adventure', tmdbId: 12 },
      { key: 'genre_animation', name: 'Animation', tmdbId: 16 },
      { key: 'genre_comedy', name: 'Comedy', tmdbId: 35 },
      { key: 'genre_crime', name: 'Crime', tmdbId: 80 },
      { key: 'genre_documentary', name: 'Documentary', tmdbId: 99 },
      { key: 'genre_drama', name: 'Drama', tmdbId: 18 },
      { key: 'genre_family', name: 'Family', tmdbId: 10751 },
      { key: 'genre_fantasy', name: 'Fantasy', tmdbId: 14 },
      { key: 'genre_history', name: 'History', tmdbId: 36 },
      { key: 'genre_horror', name: 'Horror', tmdbId: 27 },
      { key: 'genre_music', name: 'Music', tmdbId: 10402 },
      { key: 'genre_mystery', name: 'Mystery', tmdbId: 9648 },
      { key: 'genre_romance', name: 'Romance', tmdbId: 10749 },
      { key: 'genre_science_fiction', name: 'Science Fiction', tmdbId: 878 },
      { key: 'genre_thriller', name: 'Thriller', tmdbId: 53 },
      { key: 'genre_war', name: 'War', tmdbId: 10752 },
      { key: 'genre_western', name: 'Western', tmdbId: 37 },
      // Új műfajok
      { key: 'genre_anime', name: 'Anime', tmdbId: null } // Custom kategória
    ];
  }

  /**
   * Runtime preferenciák lista
   * @returns {Array} Runtime opciók
   */
  getRuntimeOptions() {
    return [
      { value: 'any', label: 'Any Length', description: 'No preference' },
      { value: 'short', label: 'Short (< 90 min)', description: 'Quick watch' },
      { value: 'medium', label: 'Medium (90-150 min)', description: 'Standard length' },
      { value: 'long', label: 'Long (> 150 min)', description: 'Epic movies' }
    ];
  }

  /**
   * Preferenciák validálása
   * @param {Object} preferences - Validálandó preferenciák
   * @returns {Object} Validáció eredménye
   */
  validatePreferences(preferences) {
    const errors = [];
    const currentYear = new Date().getFullYear();

    // Év validáció
    if (preferences.min_year && (preferences.min_year < 1900 || preferences.min_year > currentYear)) {
      errors.push('Minimum year must be between 1900 and current year');
    }

    if (preferences.max_year && (preferences.max_year < 1900 || preferences.max_year > currentYear + 5)) {
      errors.push('Maximum year must be between 1900 and current year + 5');
    }

    if (preferences.min_year && preferences.max_year && preferences.min_year > preferences.max_year) {
      errors.push('Minimum year cannot be greater than maximum year');
    }

    // Rating validáció
    if (preferences.min_rating && (preferences.min_rating < 0 || preferences.min_rating > 8.5)) {
      errors.push('Minimum rating must be between 0 and 8.5');
    }

    // Runtime validáció
    const validRuntimes = ['short', 'medium', 'long', 'any'];
    if (preferences.runtime_preference && !validRuntimes.includes(preferences.runtime_preference)) {
      errors.push('Invalid runtime preference');
    }

    // Műfaj validáció
    const genreKeys = this.getGenreList().map(g => g.key);
    genreKeys.forEach(key => {
      if (preferences[key] !== undefined && ![null, 0, 1].includes(preferences[key])) {
        errors.push(`Invalid value for ${key}. Must be null, 0, or 1`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Preferenciák összefoglaló készítése UI számára
   * @param {Object} preferences - Preferenciák objektum
   * @returns {Object} UI-barát összefoglaló
   */
  getPreferencesSummary(preferences) {
    const genreList = this.getGenreList();
    
    const likedGenres = genreList.filter(genre => 
      preferences[genre.key] === 1
    ).map(genre => genre.name);

    const dislikedGenres = genreList.filter(genre => 
      preferences[genre.key] === 0
    ).map(genre => genre.name);

    return {
      likedGenres: likedGenres,
      dislikedGenres: dislikedGenres,
      yearRange: `${preferences.min_year} - ${preferences.max_year}`,
      minRating: preferences.min_rating,
      runtimePreference: preferences.runtime_preference,
      hasPreferences: likedGenres.length > 0 || dislikedGenres.length > 0,
      completeness: this.calculateCompleteness(preferences)
    };
  }

  /**
   * Preferenciák teljességének számítása
   * @param {Object} preferences - Preferenciák objektum
   * @returns {number} Teljesség százalékban (0-100)
   */
  calculateCompleteness(preferences) {
    const genreList = this.getGenreList();
    let totalFields = genreList.length + 4; // műfajok + év + rating + runtime
    let completedFields = 0;

    // Műfaj mezők
    genreList.forEach(genre => {
      if (preferences[genre.key] !== null && preferences[genre.key] !== undefined) {
        completedFields++;
      }
    });

    // Egyéb mezők
    if (preferences.min_year) completedFields++;
    if (preferences.max_year) completedFields++;
    if (preferences.min_rating) completedFields++;
    if (preferences.runtime_preference && preferences.runtime_preference !== 'any') completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
