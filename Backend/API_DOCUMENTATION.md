# Movie Recommendation API Documentation

## Teljes API Áttekintés

Ez a dokumentáció tartalmazza a teljes film ajánló rendszer API endpoint-jait. A rendszer Netflix-style Tinder funkcionalitással rendelkezik, TMDB integrációval és intelligens ajánló algoritmussal.

## Alapvető Konfiguráció

### Environment Variables
```bash
# .env fájl
TMDB_API_KEY=your_tmdb_api_key_here
DB_HOST=localhost
DB_PORT=3306
DB_NAME=movie_app
DB_USER=root
DB_PASS=password
JWT_SECRET=your_jwt_secret
```

### Base URL
```
http://localhost:3000/api
```

### Authentication
Minden endpoint JWT token alapú autentikációt igényel:
```javascript
Headers: {
  "Authorization": "Bearer your_jwt_token_here"
}
```

---

## 1. User Preferences API

### GET /preferences/:userId
Felhasználó film preferenciáinak lekérése.

**Response:**
```javascript
{
  "success": true,
  "message": "Preferences retrieved successfully",
  "data": {
    "user_id": 123,
    "genre_action": 1,        // 1=kedveli, 0=nem kedveli, null=nincs vélemény
    "genre_comedy": 0,
    "genre_drama": null,
    // ... 18 műfaj
    "min_year": 2000,
    "max_year": 2024,
    "min_rating": 7.0,
    "runtime_preference": "medium", // short/medium/long/any
    "preferred_languages": ["en", "hu"]
  }
}
```

### POST /preferences
Preferenciák beállítása vagy teljes frissítés.

**Request:**
```javascript
{
  "userId": 123,
  "genre_action": 1,
  "genre_comedy": 0,
  "min_year": 2000,
  "max_year": 2024,
  "min_rating": 7.0,
  "runtime_preference": "medium"
}
```

### PUT /preferences/:userId
Részleges preferencia frissítés.

### DELETE /preferences/:userId
Preferenciák törlése (reset alapértelmezettre).

---

## 2. Movies API

### GET /movies/search
Filmek keresése címszó alapján.

**Query params:**
- `query` (kötelező): keresett szöveg
- `page`: oldal szám (default: 1)
- `year`: szűrés évre

**Response:**
```javascript
{
  "success": true,
  "data": {
    "movies": [
      {
        "id": 1,
        "tmdb_id": 550,
        "title": "Fight Club",
        "overview": "Film leírása...",
        "poster_url": "https://image.tmdb.org/t/p/w500/poster.jpg",
        "backdrop_url": "https://image.tmdb.org/t/p/w500/backdrop.jpg",
        "vote_average": 8.8,
        "release_date": "1999-10-15"
      }
    ],
    "totalResults": 1000,
    "currentPage": 1,
    "totalPages": 50
  }
}
```

### GET /movies/discover
Filmek felfedezése preferenciák alapján.

**Query params:**
- `userId` (kötelező): felhasználó ID
- `page`: oldal szám

### GET /movies/:movieId
Film részletes adatai.

### GET /movies/popular
Népszerű filmek.

### GET /movies/trending
Trending filmek.

**Query params:**
- `timeWindow`: 'day' vagy 'week'

---

## 3. Interactions API (Swipe Functionality)

### POST /interactions
Film értékelése Tinder-style (LIKE/DISLIKE).

**Request:**
```javascript
{
  "userId": 123,
  "movieId": 550,           // TMDB ID
  "interactionType": "LIKE" // vagy "DISLIKE"
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Movie liked successfully",
  "data": {
    "interaction": {
      "id": 456,
      "user_id": 123,
      "movie_id": 1,
      "interaction_type": "LIKE",
      "interaction_date": "2024-01-15T10:30:00Z"
    },
    "movie": {
      "tmdb_id": 550,
      "title": "Fight Club"
    },
    "addedToWatchlist": true  // Automatikus watchlist hozzáadás
  }
}
```

### GET /interactions/:userId
Felhasználó összes swipe interakciója.

**Query params:**
- `page`: oldal szám
- `limit`: elemszám per oldal (max 50)
- `interactionType`: 'LIKE' vagy 'DISLIKE' szűrés

### GET /interactions/:userId/stats
Interakciós statisztikák.

**Response:**
```javascript
{
  "success": true,
  "data": {
    "total": 150,
    "likes": 90,
    "dislikes": 60,
    "likeRatio": 60.0,        // százalék
    "recent": {               // utolsó 7 nap
      "total": 15,
      "likes": 10,
      "dislikes": 5
    }
  }
}
```

### DELETE /interactions/:userId/:movieId
Swipe művelet visszavonása.

---

## 4. Watchlist API

### GET /watchlist/:userId
Felhasználó watchlist-je.

**Query params:**
- `page`: oldal szám
- `limit`: elemszám per oldal
- `sortBy`: 'added_date', 'title', 'release_date', 'vote_average'
- `sortOrder`: 'ASC' vagy 'DESC'

**Response:**
```javascript
{
  "success": true,
  "data": {
    "watchlist": [
      {
        "id": 789,
        "user_id": 123,
        "movie_id": 1,
        "added_date": "2024-01-15T10:30:00Z",
        "movie": {
          "tmdb_id": 550,
          "title": "Fight Club",
          "poster_url": "https://...",
          "vote_average": 8.8,
          "genres": [18, 53]      // Parsed genre IDs
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```

### POST /watchlist
Film hozzáadása watchlist-hez.

**Request:**
```javascript
{
  "userId": 123,
  "movieId": 550    // TMDB ID
}
```

### DELETE /watchlist/:userId/:movieId
Film eltávolítása watchlist-ből.

### GET /watchlist/:userId/stats
Watchlist statisztikák.

**Response:**
```javascript
{
  "success": true,
  "data": {
    "totalMovies": 45,
    "averageRating": 7.8,
    "averageRuntime": 118,    // percben
    "genres": {
      "Action": 15,
      "Drama": 12,
      "Comedy": 8
    },
    "decadeDistribution": {
      "2020": 20,
      "2010": 15,
      "2000": 10
    },
    "addedThisWeek": 5,
    "addedThisMonth": 12
  }
}
```

---

## 5. Recommendations API (Intelligens Ajánló)

### GET /recommendations/:userId
Főoldal személyre szabott ajánlások.

**Query params:**
- `limit`: ajánlások száma (default: 20)
- `excludeWatched`: 'true'/'false' (default: true)

**Response:**
```javascript
{
  "success": true,
  "message": "Personalized recommendations generated",
  "data": {
    "recommendations": [
      {
        "tmdb_id": 680,
        "title": "Pulp Fiction",
        "poster_url": "https://...",
        "vote_average": 8.9,
        "userScore": 85,        // Személyre szabott pontszám
        "genres": [80, 18]
      }
    ],
    "userProfile": {
      "totalInteractions": 150,
      "likeRatio": 60.0,
      "topGenres": [18, 28, 35],
      "hasPreferences": true
    }
  }
}
```

**Ajánlási stratégiák:**
- **40%** Preferencia alapú (explicit beállítások)
- **30%** Ízlés alapú (liked filmek alapján)
- **20%** Népszerű filmek (személyre szabva)
- **10%** Felfedezés (új műfajok)

### GET /recommendations/:userId/similar/:movieId
Adott filmhez hasonló filmek.

**Query params:**
- `limit`: eredmények száma (default: 10)

### GET /recommendations/:userId/trending
Személyre szabott trending filmek.

**Query params:**
- `timeWindow`: 'day' vagy 'week'
- `limit`: eredmények száma

### GET /recommendations/:userId/discovery
Új műfajok felfedezése.

**Query params:**
- `limit`: eredmények száma (default: 15)

**Response:**
```javascript
{
  "success": true,
  "data": {
    "movies": [...],
    "discoveryGenres": ["Documentary", "Western", "Animation"],
    "message": "Explore new genres you might enjoy"
  }
}
```

---

## Hibakezelés

### Általános hibakódok:
- `400 Bad Request`: Hiányzó vagy érvénytelen paraméterek
- `401 Unauthorized`: Hiányzó vagy érvénytelen JWT token
- `404 Not Found`: Nem található erőforrás
- `409 Conflict`: Duplikált rekord (pl. film már watchlist-en)
- `500 Internal Server Error`: Szerver hiba

### Hiba válasz formátum:
```javascript
{
  "success": false,
  "error": "User not found",
  "code": 404
}
```

---

## Rate Limiting és Best Practices

### TMDB API limits:
- **40 kérés/10 másodperc**
- Cache-elés automatikus a helyi adatbázisban
- Batch műveletek optimalizálva

### Ajánlott workflow:

1. **Új felhasználó:**
   ```
   POST /preferences → GET /movies/popular → POST /interactions (több film)
   ```

2. **Visszatérő felhasználó:**
   ```
   GET /recommendations/:userId → POST /interactions → GET /watchlist/:userId
   ```

3. **Film felfedezés:**
   ```
   GET /movies/discover → GET /recommendations/:userId/discovery
   ```

### Performance tips:
- Használj paginálást nagy listák esetén
- Cache-eld a felhasználói profilt frontend-en
- Batch-eld a swipe műveleteket offline módban

---

## WebSocket Integration (Future)

Tervezett real-time funkciók:
- Live recommendation updates
- Social features (friends' activities)
- Real-time trending changes

## Analytics Integration (Future)

Tervezett métrikai események:
- User engagement tracking
- Recommendation effectiveness
- Genre preference evolution