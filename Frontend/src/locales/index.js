import common from './common.js'
import auth from './auth.js'
import dashboard from './dashboard.js'
import profile from './profile.js'
import settings from './settings.js'
import preferences from './preferences.js'
import movies from './movies.js'
import favoriteMovies from './favoriteMovies.js'

// Összevonjuk az összes fordítást
function mergeTranslations(...sources) {
  const result = { hu: {}, en: {} }
  
  sources.forEach(source => {
    if (source.hu) {
      Object.assign(result.hu, source.hu)
    }
    if (source.en) {
      Object.assign(result.en, source.en)
    }
  })
  
  return result
}

export default mergeTranslations(
  common,
  auth,
  dashboard,
  profile,
  settings,
  preferences,
  movies,
  favoriteMovies
)

