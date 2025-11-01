export default {
  hu: {
    title: 'Film felfedezés',
    subtitle: 'Swipe-olj jobbra ha tetszik, balra ha nem!',
    loading: 'Filmek betöltése...',
    
    // Swipe indicators
    indicators: {
      like: 'TETSZIK',
      dislike: 'NEM',
      super_like: 'SZUPER'
    },
    
    // Movie details
    details: {
      no_description: 'Nincs elérhető leírás ehhez a filmhez.',
      genres: 'Műfajok',
      basic_info: 'Alapadatok',
      release_date: 'Megjelenés',
      original_title: 'Eredeti cím',
      language: 'Nyelv',
      age_rating: 'Korhatár',
      runtime: 'Időtartam',
      statistics: 'Statisztikák',
      quality_indicators: 'Minőségi mutatók',
      fun_facts: 'Érdekességek',
      detailed_description: 'Részletes leírás'
    },
    
    // Runtime values
    runtime: {
      no_data: 'Nincs adat',
      unknown: 'Ismeretlen',
      minutes: 'perc',
      short: 'Rövid film (<90 perc)',
      medium: 'Közepes hosszúságú (90-150 perc)',
      long: 'Hosszú film (>150 perc)'
    },
    
    // Age ratings
    age_rating: {
      all_ages: 'Minden korosztály',
      adults_only: '18+'
    },
    
    // Language fallback
    language: {
      unknown: 'Ismeretlen'
    },
    
    // Rating categories
    rating_categories: {
      excellent: 'Kiváló',
      very_good: 'Nagyon jó',
      good: 'Jó',
      average: 'Átlagos',
      poor: 'Gyenge'
    },
    
    // Popularity texts
    popularity: {
      very_popular: 'Rendkívül népszerű',
      popular: 'Népszerű',
      moderately_popular: 'Közepesen népszerű',
      less_known: 'Kevésbé ismert'
    },
    
    // Rating quality texts
    rating_quality: {
      excellent: 'Kiváló értékelés',
      very_good: 'Nagyon jó értékelés',
      good: 'Jó értékelés',
      average: 'Átlagos értékelés',
      poor: 'Alacsony értékelés'
    },
    
    // Vote count texts
    vote_count: {
      many: 'Sok vélemény',
      enough: 'Elég vélemény',
      moderate: 'Közepes vélemény',
      few: 'Kevés vélemény'
    },
    
    // Recency texts
    recency: {
      very_recent: 'Új film',
      recent: 'Friss film',
      modern: 'Modern film',
      older: 'Régebbi film',
      unknown: 'Ismeretlen'
    },
    
    // Fun facts
    fun_facts: {
      decade_movie: '%{decade} évtized filmje',
      highly_rated: 'Magasan értékelt film',
      currently_trending: 'Jelenleg trending',
      classic_film: 'Klasszikus film',
      horror_classic: 'Horror klasszikus',
      scifi_masterpiece: 'Sci-Fi mestermű',
      animation_gem: 'Animációs gyöngyszem',
      comedy_special: 'Vígjáték különlegesség',
      drama_excellence: 'Dráma remek'
    },
    
    // Empty state
    no_movies: {
      title: 'Elfogytak a filmek!',
      description: 'Minden filmet megnéztél ebben a kategóriában',
      reload: 'Újraindítás'
    },
    
    // Statistics labels
    stats: {
      imdb_rating: 'IMDb értékelés',
      votes: 'Szavazatok',
      popularity: 'Népszerűség',
      category: 'Kategória'
    },
    
    // Genre names (mapping from English to Hungarian)
    genres: {
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
      'Sci-Fi': 'Sci-Fi',
      'Thriller': 'Thriller',
      'War': 'Háborús',
      'Western': 'Western',
      'Anime': 'Anime',
      // Also keep the old numeric mapping for backward compatibility
      28: 'Akció',
      12: 'Kaland', 
      16: 'Animáció',
      35: 'Vígjáték',
      80: 'Krimi',
      99: 'Dokumentumfilm',
      18: 'Dráma',
      10751: 'Családi',
      14: 'Fantasy',
      36: 'Történelmi',
      27: 'Horror',
      10402: 'Zenés',
      9648: 'Rejtély',
      10749: 'Romantikus',
      878: 'Sci-Fi',
      53: 'Thriller',
      10752: 'Háborús',
      37: 'Western',
      unknown: 'Műfaj'
    }
  },
  
  en: {
    title: 'Movie Discovery',
    subtitle: 'Swipe right if you like it, left if you don\'t!',
    loading: 'Loading movies...',
    
    // Swipe indicators
    indicators: {
      like: 'LIKE',
      dislike: 'NOPE',
      super_like: 'SUPER'
    },
    
    // Movie details
    details: {
      no_description: 'No description available for this movie.',
      genres: 'Genres',
      basic_info: 'Basic Information',
      release_date: 'Release Date',
      original_title: 'Original Title',
      language: 'Language',
      age_rating: 'Age Rating',
      runtime: 'Runtime',
      statistics: 'Statistics',
      quality_indicators: 'Quality Indicators',
      fun_facts: 'Fun Facts',
      detailed_description: 'Detailed Description'
    },
    
    // Runtime values
    runtime: {
      no_data: 'No data',
      unknown: 'Unknown',
      minutes: 'min',
      short: 'Short film (<90 min)',
      medium: 'Medium length (90-150 min)',
      long: 'Long film (>150 min)'
    },
    
    // Age ratings
    age_rating: {
      all_ages: 'All Ages',
      adults_only: '18+'
    },
    
    // Language fallback
    language: {
      unknown: 'Unknown'
    },
    
    // Rating categories
    rating_categories: {
      excellent: 'Excellent',
      very_good: 'Very Good',
      good: 'Good',
      average: 'Average',
      poor: 'Poor'
    },
    
    // Popularity texts
    popularity: {
      very_popular: 'Extremely Popular',
      popular: 'Popular',
      moderately_popular: 'Moderately Popular',
      less_known: 'Less Known'
    },
    
    // Rating quality texts
    rating_quality: {
      excellent: 'Excellent Rating',
      very_good: 'Very Good Rating',
      good: 'Good Rating',
      average: 'Average Rating',
      poor: 'Low Rating'
    },
    
    // Vote count texts
    vote_count: {
      many: 'Many Reviews',
      enough: 'Enough Reviews',
      moderate: 'Moderate Reviews',
      few: 'Few Reviews'
    },
    
    // Recency texts
    recency: {
      very_recent: 'New Movie',
      recent: 'Recent Movie',
      modern: 'Modern Movie',
      older: 'Older Movie',
      unknown: 'Unknown'
    },
    
    // Fun facts
    fun_facts: {
      decade_movie: '%{decade} movie',
      highly_rated: 'Highly Rated Movie',
      currently_trending: 'Currently Trending',
      classic_film: 'Classic Film',
      horror_classic: 'Horror Classic',
      scifi_masterpiece: 'Sci-Fi Masterpiece',
      animation_gem: 'Animation Gem',
      comedy_special: 'Comedy Special',
      drama_excellence: 'Drama Excellence'
    },
    
    // Empty state
    no_movies: {
      title: 'No More Movies!',
      description: 'You\'ve seen all movies in this category',
      reload: 'Reload'
    },
    
    // Statistics labels
    stats: {
      imdb_rating: 'IMDb Rating',
      votes: 'Votes',
      popularity: 'Popularity',
      category: 'Category'
    },
    
    // Genre names (keeping English names in English locale)
    genres: {
      'Action': 'Action',
      'Adventure': 'Adventure', 
      'Animation': 'Animation',
      'Comedy': 'Comedy',
      'Crime': 'Crime',
      'Documentary': 'Documentary',
      'Drama': 'Drama',
      'Family': 'Family',
      'Fantasy': 'Fantasy',
      'History': 'History',
      'Horror': 'Horror',
      'Music': 'Music',
      'Mystery': 'Mystery',
      'Romance': 'Romance',
      'Science Fiction': 'Science Fiction',
      'Sci-Fi': 'Science Fiction',
      'Thriller': 'Thriller',
      'War': 'War',
      'Western': 'Western',
      'Anime': 'Anime',
      // Also keep the old numeric mapping for backward compatibility
      28: 'Action',
      12: 'Adventure', 
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      53: 'Thriller',
      10752: 'War',
      37: 'Western',
      unknown: 'Genre'
    }
  }
}
