const ApiResponse = require('../service/helpers/api-response.helper');

class PreferencesController {
  constructor(models) {
    this.UserPreferences = models.UserPreferences;
    this.User = models.User;
  }

  // GET /api/preferences/:userId - Felhasználó preferenciáinak lekérése
  async getPreferences(req, res) {
    try {
      const { userId } = req.params;
      console.log('Getting preferences for user:', userId);

      const preferences = await this.UserPreferences.findOne({
        where: { user_id: userId }
      });
      
      console.log('Found preferences:', preferences ? 'yes' : 'no');

      if (!preferences) {
        // Ha még nincs preferencia, visszaadjuk az alapértelmezett értékeket
        const defaultPreferences = {
          user_id: userId,
          // Eredeti műfajok - mind null (nincs beállítva)
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
          // Alapértékek
          min_year: 1900,
          max_year: new Date().getFullYear(),
          min_rating: 0.0,
          runtime_preference: 'any',
          preferred_languages: null,
          prefer_classic: 0,
          prefer_modern: 1,
          prefer_recent: 1,
          child_mode: 0
        };
        
        return ApiResponse.success(res, 'user.success.data_retrieved', defaultPreferences);
      }

      return ApiResponse.success(res, 'user.success.data_retrieved', preferences.toJSON());
    } catch (error) {
      console.error('Error getting preferences:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  // POST /api/preferences - Preferenciák létrehozása vagy frissítése
  async setPreferences(req, res) {
    try {
      const { userId } = req.body;
      console.log('Setting preferences for user:', userId);
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      if (!userId) {
        return ApiResponse.error(res, 'user.errors.missing_fields', 400);
      }

      // Ellenőrizzük hogy létezik-e a felhasználó
      const user = await this.User.findOne({
        where: { account_id: userId }
      });
      if (!user) {
        return ApiResponse.error(res, 'user.errors.user_not_found', 404);
      }

      // Preferenciák adatok validálása és tisztítása
      const preferencesData = this.validatePreferencesData(req.body);
      
      if (preferencesData.error) {
        return ApiResponse.error(res, 'user.errors.validation_failed', 400);
      }

      // Upsert (create or update)
      const [preferences, created] = await this.UserPreferences.upsert({
        user_id: userId,
        ...preferencesData.data
      });

      const message = created ? 'user.success.data_created' : 'user.success.data_updated';
      return ApiResponse.success(res, message, preferences.toJSON());
    } catch (error) {
      console.error('Error setting preferences:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  // PUT /api/preferences/:userId - Preferenciák frissítése (részleges)
  async updatePreferences(req, res) {
    try {
      const { userId } = req.params;

      // Ellenőrizzük hogy léteznek-e már preferenciák
      const existingPreferences = await this.UserPreferences.findOne({
        where: { user_id: userId }
      });

      // Csak a küldött mezőket validáljuk és frissítjük
      const updateData = this.validatePartialPreferencesData(req.body);
      
      if (updateData.error) {
        return ApiResponse.error(res, 'user.errors.validation_failed', 400);
      }

      let updatedPreferences;

      if (!existingPreferences) {
        // Ha nincs preferences, hozzunk létre újat a beállított értékekkel
        console.log('🆕 Creating new preferences for user:', userId);
        const newPreferencesData = {
          user_id: userId,
          ...updateData.data
        };
        updatedPreferences = await this.UserPreferences.create(newPreferencesData);
      } else {
        // Ha van, frissítsük
        console.log('🔄 Updating existing preferences for user:', userId);
        await this.UserPreferences.update(updateData.data, {
          where: { user_id: userId }
        });

        // Frissített adatok lekérése
        updatedPreferences = await this.UserPreferences.findOne({
          where: { user_id: userId }
        });
      }

      return ApiResponse.success(res, 'user.success.data_updated', updatedPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  // DELETE /api/preferences/:userId - Preferenciák törlése (reset to defaults)
  async deletePreferences(req, res) {
    try {
      const { userId } = req.params;

      const deleted = await this.UserPreferences.destroy({
        where: { user_id: userId }
      });

      // Ha nincs mit törölni, az is sikeres "reset"
      return ApiResponse.success(res, 'user.success.data_deleted', { 
        deleted: deleted > 0 ? true : false,
        message: deleted > 0 ? 'Preferences deleted' : 'No preferences to delete (already at defaults)'
      });
    } catch (error) {
      console.error('Error deleting preferences:', error);
      return ApiResponse.serverError(res, error);
    }
  }

  // Teljes preferenciák validáció
  validatePreferencesData(data) {
    const result = { data: {}, error: null };

    // Műfaj preferenciák (binary: 0, 1, vagy null)
    const genres = [
      'genre_action', 'genre_adventure', 'genre_animation', 'genre_comedy', 'genre_crime',
      'genre_documentary', 'genre_drama', 'genre_family', 'genre_fantasy', 'genre_history',
      'genre_horror', 'genre_music', 'genre_mystery', 'genre_romance', 'genre_science_fiction',
      'genre_thriller', 'genre_war', 'genre_western',
      // Új műfajok
      'genre_anime'
    ];

    // Műfajok validálása
    genres.forEach(genre => {
      if (data[genre] !== undefined) {
        if (data[genre] === null || data[genre] === 0 || data[genre] === 1) {
          result.data[genre] = data[genre];
        } else {
          result.error = `${genre} must be null, 0, or 1`;
          return;
        }
      }
    });

    // Év validáció
    if (data.min_year !== undefined) {
      const minYear = parseInt(data.min_year);
      if (isNaN(minYear) || minYear < 1900 || minYear > new Date().getFullYear()) {
        result.error = 'min_year must be between 1900 and current year';
        return result;
      }
      result.data.min_year = minYear;
    }

    if (data.max_year !== undefined) {
      const maxYear = parseInt(data.max_year);
      if (isNaN(maxYear) || maxYear < 1900 || maxYear > new Date().getFullYear() + 5) {
        result.error = 'max_year must be between 1900 and current year + 5';
        return result;
      }
      result.data.max_year = maxYear;
    }

    // Rating validáció
    if (data.min_rating !== undefined) {
      const minRating = parseFloat(data.min_rating);
      if (isNaN(minRating) || minRating < 0 || minRating > 10) {
        result.error = 'min_rating must be between 0.0 and 10.0';
        return result;
      }
      result.data.min_rating = minRating;
    }

    // Runtime preference validáció
    if (data.runtime_preference !== undefined) {
      const validRuntimes = ['short', 'medium', 'long', 'any'];
      if (!validRuntimes.includes(data.runtime_preference)) {
        result.error = 'runtime_preference must be one of: short, medium, long, any';
        return result;
      }
      result.data.runtime_preference = data.runtime_preference;
    }

    // Nyelvi preferenciák validáció (JSON array)
    if (data.preferred_languages !== undefined) {
      if (data.preferred_languages === null || Array.isArray(data.preferred_languages)) {
        result.data.preferred_languages = data.preferred_languages;
      } else {
        result.error = 'preferred_languages must be null or an array of language codes';
        return result;
      }
    }

    // Boolean preferenciák
    const booleanPrefs = ['prefer_classic', 'prefer_modern', 'prefer_recent', 'child_mode'];
    booleanPrefs.forEach(pref => {
      if (data[pref] !== undefined) {
        if (data[pref] === 0 || data[pref] === 1 || data[pref] === true || data[pref] === false) {
          result.data[pref] = data[pref] ? 1 : 0;
        } else {
          result.error = `${pref} must be boolean or 0/1`;
          return;
        }
      }
    });

    return result;
  }

  // Részleges frissítés validáció (ugyanaz mint a teljes, de nem kötelező mezők)
  validatePartialPreferencesData(data) {
    return this.validatePreferencesData(data);
  }
}

module.exports = PreferencesController;