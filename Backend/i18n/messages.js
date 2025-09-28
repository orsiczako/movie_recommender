/**
 * Internationalization messages for the movie recommender API
 * Supports Hungarian (hu) and English (en) languages
 */

const DEFAULT_LOCALE = 'hu';

const messages = {
  hu: {
    // Általános üzenetek
    success: 'Sikeres művelet',
    error: 'Hiba történt',
    notFound: 'Nem található',
    unauthorized: 'Nincs jogosultság',
    forbidden: 'Hozzáférés megtagadva',
    validation: 'Érvénytelen adatok',
    
    // Felhasználó üzenetek
    user: {
      loginSuccess: 'Sikeres bejelentkezés',
      loginFailed: 'Hibás felhasználónév vagy jelszó',
      registerSuccess: 'Sikeres regisztráció',
      userNotFound: 'Felhasználó nem található',
      emailTaken: 'Ez az email cím már használatban van',
      usernameTaken: 'Ez a felhasználónév már foglalt',
      profileUpdated: 'Profil frissítve',
      passwordResetSent: 'Jelszó visszaállítási email elküldve',
      passwordResetSuccess: 'Jelszó sikeresen megváltoztatva',
      invalidToken: 'Érvénytelen token',
      tokenExpired: 'Lejárt token'
    },
    
    // Film üzenetek
    movie: {
      found: 'Filmek megtalálva',
      notFound: 'Nem található film',
      addedToWatchlist: 'Film hozzáadva a watchlisthoz',
      removedFromWatchlist: 'Film eltávolítva a watchlistből',
      alreadyInWatchlist: 'A film már a watchlisten van',
      liked: 'Film kedvelve',
      disliked: 'Film nem kedvelve',
      interactionRemoved: 'Értékelés visszavonva'
    },
    
    // Preferenciák üzenetek
    preferences: {
      retrieved: 'Preferenciák lekérve',
      updated: 'Preferenciák frissítve',
      created: 'Preferenciák létrehozva',
      reset: 'Preferenciák visszaállítva',
      invalid: 'Érvénytelen preferencia érték'
    },
    
    // Ajánlások üzenetek
    recommendations: {
      generated: 'Személyre szabott ajánlások generálva',
      similarMovies: 'Hasonló filmek találva',
      trendingMovies: 'Trending filmek lekérve',
      discoveryMovies: 'Új műfajok felfedezése',
      noRecommendations: 'Nincs ajánlás. Először értékelj néhány filmet!'
    },
    
    // Watchlist üzenetek
    watchlist: {
      retrieved: 'Watchlist lekérve',
      empty: 'A watchlist üres',
      stats: 'Watchlist statisztikák'
    },
    
    // Interakciók üzenetek
    interactions: {
      recorded: 'Értékelés rögzítve',
      stats: 'Értékelési statisztikák',
      history: 'Értékelési előzmények'
    },
    
    // Email üzenetek
    email: {
      sent: 'Email elküldve',
      failed: 'Email küldése sikertelen',
      invalidAddress: 'Érvénytelen email cím'
    },
    
    // Adatbázis üzenetek
    database: {
      connected: 'Adatbázis kapcsolat létrehozva',
      error: 'Adatbázis hiba',
      syncSuccess: 'Adatbázis modellek szinkronizálva'
    }
  },
  
  en: {
    // General messages
    success: 'Operation successful',
    error: 'An error occurred',
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    forbidden: 'Access denied',
    validation: 'Invalid data',
    
    // User messages
    user: {
      loginSuccess: 'Login successful',
      loginFailed: 'Invalid username or password',
      registerSuccess: 'Registration successful',
      userNotFound: 'User not found',
      emailTaken: 'This email is already taken',
      usernameTaken: 'This username is already taken',
      profileUpdated: 'Profile updated',
      passwordResetSent: 'Password reset email sent',
      passwordResetSuccess: 'Password changed successfully',
      invalidToken: 'Invalid token',
      tokenExpired: 'Token expired'
    },
    
    // Movie messages
    movie: {
      found: 'Movies found',
      notFound: 'Movie not found',
      addedToWatchlist: 'Movie added to watchlist',
      removedFromWatchlist: 'Movie removed from watchlist',
      alreadyInWatchlist: 'Movie already in watchlist',
      liked: 'Movie liked',
      disliked: 'Movie disliked',
      interactionRemoved: 'Rating removed'
    },
    
    // Preferences messages
    preferences: {
      retrieved: 'Preferences retrieved',
      updated: 'Preferences updated',
      created: 'Preferences created',
      reset: 'Preferences reset',
      invalid: 'Invalid preference value'
    },
    
    // Recommendations messages
    recommendations: {
      generated: 'Personalized recommendations generated',
      similarMovies: 'Similar movies found',
      trendingMovies: 'Trending movies retrieved',
      discoveryMovies: 'Discover new genres',
      noRecommendations: 'No recommendations. Please rate some movies first!'
    },
    
    // Watchlist messages
    watchlist: {
      retrieved: 'Watchlist retrieved',
      empty: 'Watchlist is empty',
      stats: 'Watchlist statistics'
    },
    
    // Interactions messages
    interactions: {
      recorded: 'Rating recorded',
      stats: 'Rating statistics',
      history: 'Rating history'
    },
    
    // Email messages
    email: {
      sent: 'Email sent',
      failed: 'Email sending failed',
      invalidAddress: 'Invalid email address'
    },
    
    // Database messages
    database: {
      connected: 'Database connection established',
      error: 'Database error',
      syncSuccess: 'Database models synchronized'
    }
  }
};

module.exports = { messages, DEFAULT_LOCALE };