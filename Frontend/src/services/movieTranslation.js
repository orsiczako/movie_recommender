// Common movie translation service following DRY principles
// Shared between MovieBrowsingView and FavoriteMoviesView

// TMDB genre mapping to Hungarian names (moved from movie.js for reusability)
const GENRE_MAP = {
  28: 'Akció',
  12: 'Kaland',
  16: 'Animáció', 
  35: 'Vígjáték',
  80: 'Krimi',
  99: 'Dokumentum',
  18: 'Dráma',
  10751: 'Családi',
  14: 'Fantasy',
  36: 'Történelmi',
  27: 'Horror',
  10402: 'Zene',
  9648: 'Rejtély',
  10749: 'Romantikus',
  878: 'Sci-Fi',
  10770: 'TV film',
  53: 'Thriller',
  10752: 'Háborús',
  37: 'Western'
};

/**
 * Translate movie data to Hungarian based on current locale
 * @param {Object} movie - Movie data to translate
 * @param {string} currentLocale - Current locale (hu/en)
 * @returns {Object} Translated movie data
 */
export function translateMovieData(movie, currentLocale = 'hu') {
  if (!movie || currentLocale !== 'hu') {
    return movie; // Return original if not Hungarian locale
  }

  // Clone the movie object to avoid mutations
  const translatedMovie = { ...movie };

  // Translate genres if they exist
  if (movie.genres && Array.isArray(movie.genres)) {
    translatedMovie.genres = movie.genres.map(genre => {
      if (typeof genre === 'object' && genre.id) {
        // TMDB format with id and name
        return {
          ...genre,
          name: GENRE_MAP[genre.id] || genre.name
        };
      } else if (typeof genre === 'number') {
        // Just genre ID
        return {
          id: genre,
          name: GENRE_MAP[genre] || `Genre ${genre}`
        };
      } else if (typeof genre === 'string') {
        // Try to find Hungarian translation by English name
        const englishToHungarian = {
          'Action': 'Akció',
          'Adventure': 'Kaland',
          'Animation': 'Animáció',
          'Comedy': 'Vígjáték',
          'Crime': 'Krimi',
          'Documentary': 'Dokumentum',
          'Drama': 'Dráma',
          'Family': 'Családi',
          'Fantasy': 'Fantasy',
          'History': 'Történelmi',
          'Horror': 'Horror',
          'Music': 'Zene',
          'Mystery': 'Rejtély',
          'Romance': 'Romantikus',
          'Science Fiction': 'Sci-Fi',
          'TV Movie': 'TV film',
          'Thriller': 'Thriller',
          'War': 'Háborús',
          'Western': 'Western'
        };
        
        return englishToHungarian[genre] || genre;
      }
      return genre;
    });
  }

  return translatedMovie;
}

/**
 * Translate array of movies to Hungarian based on current locale
 * @param {Array} movies - Array of movie data to translate
 * @param {string} currentLocale - Current locale (hu/en)
 * @returns {Array} Array of translated movie data
 */
export function translateMoviesArray(movies, currentLocale = 'hu') {
  if (!Array.isArray(movies) || currentLocale !== 'hu') {
    return movies;
  }

  return movies.map(movie => translateMovieData(movie, currentLocale));
}

/**
 * Get Hungarian genre name by ID
 * @param {number} genreId - TMDB genre ID
 * @returns {string} Hungarian genre name
 */
export function getHungarianGenreName(genreId) {
  return GENRE_MAP[genreId] || `Genre ${genreId}`;
}

/**
 * Process genres from various formats and translate to Hungarian
 * @param {*} genres - Genres in various formats (array, string, etc.)
 * @param {string} currentLocale - Current locale (hu/en)
 * @returns {Array} Processed and translated genres array
 */
export function processAndTranslateGenres(genres, currentLocale = 'hu') {
  let processedGenres = [];

  console.log('Processing genres:', genres, 'locale:', currentLocale)

  if (!genres) {
    return processedGenres;
  }

  // Handle different genre formats
  if (Array.isArray(genres)) {
    processedGenres = genres;
  } else if (typeof genres === 'string') {
    try {
      // Try to parse as JSON first
      processedGenres = JSON.parse(genres);
      console.log('Successfully parsed JSON genres:', processedGenres)
    } catch (e) {
      // If parsing fails, treat as comma-separated string
      console.log('JSON parse failed, treating as string:', genres)
      if (genres.includes(',')) {
        processedGenres = genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
      } else if (genres.length > 0) {
        processedGenres = [genres];
      }
    }
  }

  // Translate to Hungarian if needed
  if (currentLocale === 'hu') {
    processedGenres = processedGenres.map(genre => {
      if (typeof genre === 'object' && genre.id) {
        return {
          ...genre,
          name: GENRE_MAP[genre.id] || genre.name
        };
      } else if (typeof genre === 'number') {
        return {
          id: genre,
          name: GENRE_MAP[genre] || `Genre ${genre}`
        };
      } else if (typeof genre === 'string') {
        // Try to find Hungarian translation by English name
        const englishToHungarian = {
          'Action': 'Akció',
          'Adventure': 'Kaland',
          'Animation': 'Animáció',
          'Comedy': 'Vígjáték',
          'Crime': 'Krimi',
          'Documentary': 'Dokumentum',
          'Drama': 'Dráma',
          'Family': 'Családi',
          'Fantasy': 'Fantasy',
          'History': 'Történelmi',
          'Horror': 'Horror',
          'Music': 'Zene',
          'Mystery': 'Rejtély',
          'Romance': 'Romantikus',
          'Science Fiction': 'Sci-Fi',
          'TV Movie': 'TV film',
          'Thriller': 'Thriller',
          'War': 'Háborús',
          'Western': 'Western'
        };
        
        return englishToHungarian[genre] || genre;
      }
      return genre;
    });
  }

  console.log('Final processed genres:', processedGenres)
  return processedGenres;
}

export { GENRE_MAP };
