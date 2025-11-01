/**
 * Year Range Helper - Év tartomány beállítás
 */

const { UserPreferences } = require('../../dbo');

class YearRangeHelper {
  
  // Preferált év tartomány beállítása
  static async setYearRange(userId, fromYear, toYear, preset = null) {
    try {
  console.log(`Setting year range for user ${userId}: ${fromYear} - ${toYear} (preset: ${preset})`);

      // Preset alapján év tartomány beállítása
      let minYear = fromYear;
      let maxYear = toYear;

      if (preset) {
        switch (preset) {
          case 'all_time':
            minYear = null;
            maxYear = null;
            break;
          case 'modern':
            minYear = 2000;
            maxYear = null;
            break;
          case 'recent':
            minYear = 2015;
            maxYear = null;
            break;
          case 'latest':
            minYear = 2020;
            maxYear = null;
            break;
          case 'classics':
            minYear = 1970;
            maxYear = 1999;
            break;
          default:
            // Egyéni tartomány esetén az eredeti értékeket használjuk
            break;
        }
  console.log(`Applied preset '${preset}': ${minYear} - ${maxYear}`);
      }

      // Preferenciák frissítése
      await UserPreferences.update({
        min_year: minYear,
        max_year: maxYear
      }, {
        where: { user_id: userId }
      });

  console.log(`Year range updated for user ${userId}: ${minYear} - ${maxYear}`);
      
      return {
        success: true,
        minYear: minYear,
        maxYear: maxYear,
        preset: preset
      };

    } catch (error) {
  console.error(`Error setting year range:`, error.message);
      throw error;
    }
  }

  // Év szűrés paraméterek TMDB API-hoz
  static getYearFilters(userPreferences) {
    const filters = {};
    
    if (userPreferences && userPreferences.min_year) {
      filters['primary_release_date.gte'] = `${userPreferences.min_year}-01-01`;
  console.log(`Min year filter: ${userPreferences.min_year}`);
    }
    
    if (userPreferences && userPreferences.max_year) {
      filters['primary_release_date.lte'] = `${userPreferences.max_year}-12-31`;
  console.log(`Max year filter: ${userPreferences.max_year}`);
    }
    
    return filters;
  }
}

module.exports = YearRangeHelper;