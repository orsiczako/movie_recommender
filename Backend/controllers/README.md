# Controllers (Vezérlők)

## Mi ez és mit csinál?

A **Controller** olyan, mint egy projekt manager vagy koordinátor. Nem ő végzi el a tényleges munkát, hanem megmondja, hogy mit kell csinálni és koordinálja a folyamatokat.

### Hasonlat:
Mint egy étteremben a **főpincér**:
- A pincér (router) hozza a rendelést
- A főpincér (controller) megnézi mit kell csinálni
- Utasítja a szakácsot (service), hogy készítse el
- Visszaviszi az ételt a pincérnek

## Fájlok:

```
controllers/
├── user.controller.js         # Felhasználói műveletek koordinátora
├── preferences.controller.js  # Film preferenciák kezelése
├── movie.controller.js        # TMDB film adatok kezelése
├── interaction.controller.js  # Film swipe műveletek (LIKE/DISLIKE)
├── watchlist.controller.js    # Felhasználói film watchlist kezelése
└── recommendation.controller.js # Intelligens film ajánló algoritmus
```

## UserController - mit csinál pontosan?

### Konstruktor:
```javascript
constructor(User) {
  this.userService = new UserService(User); // "Felveszi" a szakácsot
}
```

### Metódusok:

#### 1. login(username, password)
**Mit csinál:**
- Meghívja a UserService login metódusát
- Visszaadja az eredményt

```javascript
async login(username, password) {
  return await this.userService.login(username, password);
}
```

**Hogy kapcsolódik:**
1. **Router** meghívja: `userController.login("john", "pass123")`
2. **Controller** továbbítja: `userService.login("john", "pass123")`
3. **Service** elvégzi a munkát (adatbázis, jelszó ellenőrzés)
4. **Controller** visszaadja az eredményt
5. **Router** elküldi a frontend-nek

#### 2. register(userData)
**Mit csinál:**
- Új felhasználó regisztrációját koordinálja

```javascript
async register(userData) {
  return await this.userService.register(userData);
}
```

**userData tartalma:**
```javascript
{
  username: "john_doe",
  password: "titkosJelszo123",
  email: "john@example.com", 
  fullName: "John Doe"
}
```

#### 3. forgotPassword(email, emailTemplate)
**Mit csinál:**
- Jelszó-visszaállítási folyamatot indít el

```javascript
async forgotPassword(email, emailTemplate) {
  return await this.userService.forgotPassword(email, emailTemplate);
}
```

**Mi történik a háttérben:**
1. Service megkeresi a felhasználót email alapján
2. Generál egy titkos tokent
3. Elmenti a tokenbe az adatbázisba
4. Email helper-rel küld emailt a tokennel

#### 4. resetPassword(token, newPassword)
**Mit csinál:**
- Új jelszót állít be token alapján

```javascript
async resetPassword(token, newPassword) {
  return await this.userService.resetPassword(token, newPassword);
}
```

## Visszatérési értékek:

### Sikeres művelet:
```javascript
{
  success: true,
  user: {
    id: 123,
    username: "john_doe",
    email: "john@example.com",
    fullName: "John Doe"
  }
}
```

### Hiba esetén:
```javascript
{
  success: false,
  error: "INVALID_CREDENTIALS" // vagy más hibakód
}
```

### Hibakódok magyarázata:

- **INVALID_CREDENTIALS** - Rossz felhasználónév vagy jelszó
- **USERNAME_TAKEN** - A felhasználónév már foglalt
- **EMAIL_TAKEN** - Az email cím már használatban van  
- **EMAIL_FAILED** - Email küldési hiba
- **INVALID_TOKEN** - Érvénytelen visszaállítási token
- **TOKEN_EXPIRED** - Lejárt visszaállítási token

## Miért van szükség Controller-re?

### 1. **Elválasztja a felelősségeket:**
- **Router:** csak HTTP kérések kezelése
- **Controller:** koordináció, flow control
- **Service:** tényleges üzleti logika

### 2. **Könnyű tesztelni:**
```javascript
// Tesztelés:
const controller = new UserController(mockUser);
const result = await controller.login("test", "pass");
// Nem kell HTTP kérést küldeni!
```

### 3. **Rugalmas:**
Ha változik az üzleti logika, csak a Service-t kell módosítani, a Controller ugyanaz marad.

## Hogyan kapcsolódik az egész?

### Példa - bejelentkezés folyamata:

```
1. Frontend →  POST /api/users/login { username, password }
2. Router →    validateRequired middleware
3. Router →    userController.login(username, password)
4. Controller → userService.login(username, password)  
5. Service →   User.findOne() // adatbázis lekérdezés
6. Service →   verifyPassword() // jelszó ellenőrzés  
7. Service →   return { success: true, user: {...} }
8. Controller → return result (same)
9. Router →    ApiResponse.success() 
10. Frontend ← { success: true, message: "Sikeres bejelentkezés", user: {...} }
```

Minden réteg csak a saját feladatát végzi, így tiszta és karbantartható a kód!

## Kommunikációs Folyamat
```
HTTP Útvonal → Vezérlő Metódus → Adatbázis Modell
     ↓              ↓                ↓
Útvonal Kezelő → Üzleti Logika → Adat Perzisztencia
```

## UserController Osztály

### Konstruktor
- `constructor(User)` - Fogadja a User modell példányt adatbázis műveletekhez

### Metódusok

#### Hitelesítés
- `login(username, password)` - Felhasználói hitelesítő adatok validálása
  - Visszatérés: `{success: boolean, user?: object, error?: string}`
  - Hibák: `USER_NOT_FOUND`, `INVALID_PASSWORD`

#### Regisztráció
- `register(userData)` - Új felhasználói fiók létrehozása
  - Paraméterek: `{username, password, email, fullName}`
  - Visszatérés: `{success: boolean, user?: object, error?: string}`
  - Hibák: `USERNAME_TAKEN`, `EMAIL_TAKEN`

#### Jelszó Visszaállítás
- `forgotPassword(email, emailTemplate, req)` - Jelszó visszaállítás folyamat kezdeményezése
  - Paraméterek: Email cím, sablon objektum, Express kérés objektum
  - Visszatérés: `{success: boolean, error?: string}`
  - Hibák: `EMAIL_FAILED`
  - Biztonság: Mindig sikert ad vissza email felsorolás megelőzéséhez

- `resetPassword(token, newPassword)` - Jelszó visszaállítás befejezése
  - Paraméterek: Visszaállítási token, új jelszó
  - Visszatérés: `{success: boolean, error?: string}`
  - Hibák: `INVALID_TOKEN`, `TOKEN_EXPIRED`

## Hibakezelés
A vezérlők szabványosított hiba objektumokat adnak vissza:
- `success: false`
- `error: ERROR_CODE` (string konstans)

Sikeres válaszok tartalmazzák:
- `success: true`
- `user: object` (tisztított felhasználói adatok amikor alkalmazható)

## Biztonsági Megfontolások
- Jelszó titkosítás biztonsági segédek által kezelve
- Token generálás és validálás visszaállítási segédekre delegálva
- Email felsorolás megelőzése az elfelejtett jelszó folyamatban
- Bemenet tisztítás az útvonal rétegből várható

## PreferencesController Osztály

### Konstruktor
- `constructor(models)` - Fogadja a modellek objektumot (UserPreferences, User)

### Metódusok

#### Preferenciák Lekérése
- `getPreferences(req, res)` - Felhasználó film preferenciáinak lekérése
  - Útvonal: `GET /api/preferences/:userId`
  - Ha nincs beállítva, alapértelmezett értékeket ad vissza
  - Tartalmaz: műfaj preferenciák (18 műfaj), év tartomány, rating, nyelv stb.

#### Preferenciák Beállítása
- `setPreferences(req, res)` - Új preferenciák létrehozása vagy teljes frissítés
  - Útvonal: `POST /api/preferences`
  - Upsert művelet (create or update)
  - Teljes validáció minden mezőre

#### Preferenciák Frissítése
- `updatePreferences(req, res)` - Részleges preferencia frissítés
  - Útvonal: `PUT /api/preferences/:userId`
  - Csak a küldött mezőket frissíti
  - Meglévő preferenciák szükségesek

#### Preferenciák Törlése
- `deletePreferences(req, res)` - Preferenciák visszaállítása alapértelmezettre
  - Útvonal: `DELETE /api/preferences/:userId`
  - Törli a rekordot az adatbázisból

### Validáció
- **Műfaj preferenciák:** null, 0, vagy 1 értékek (nem beállított, nem kedveli, kedveli)
- **Év validáció:** 1900 és jelenlegi év között
- **Rating validáció:** 0.0-10.0 között
- **Runtime validáció:** 'short', 'medium', 'long', 'any'
- **Nyelv validáció:** null vagy ISO nyelv kódok tömbje

## MovieController Osztály

### Konstruktor
- `constructor(models)` - Fogadja a modellek objektumot és inicializálja a TMDB API konfigurációt

### TMDB Integráció
- **API Base URL:** `https://api.themoviedb.org/3`
- **Kép Base URL:** `https://image.tmdb.org/t/p/w500`
- **API Key:** Environment változóból (`TMDB_API_KEY`)

### Metódusok

#### Film Keresés és Felfedezés
- `searchMovies(req, res)` - Filmek keresése címszó alapján
  - Útvonal: `GET /api/movies/search?query=...&page=1&year=2023`
  - TMDB search/movie endpoint használata
  - Automatikus cache-elés a helyi adatbázisban

- `discoverMovies(req, res)` - Filmek felfedezése felhasználói preferenciák alapján
  - Útvonal: `GET /api/movies/discover?userId=123&page=1`
  - Preferenciák alapján TMDB discover endpoint hívása
  - Intelligens műfaj, év, rating és runtime szűrés

#### Film Adatok
- `getMovieDetails(req, res)` - Részletes film információk
  - Útvonal: `GET /api/movies/:movieId`
  - Cache-first stratégia (helyi DB → TMDB)
  - Kibővített adatok: credits, videos

- `getPopularMovies(req, res)` - Népszerű filmek listája
  - Útvonal: `GET /api/movies/popular?page=1`
  - TMDB popular endpoint

- `getTrendingMovies(req, res)` - Trending filmek
  - Útvonal: `GET /api/movies/trending?timeWindow=week`
  - Támogatott időablakok: 'day', 'week'

### Cache Stratégia
- **Automatikus cache:** Minden film adat mentése a helyi `movies` táblába
- **Performance optimalizáció:** Ismételt API hívások elkerülése
- **Kép URL generálás:** Automatikus poster és backdrop URL-ek

### Műfaj Mapping
18 műfaj támogatása a TMDB műfaj ID-kkel:
- Action (28), Comedy (35), Drama (18), Horror (27), stb.
- Preferenciák alapján intelligens szűrés

### Hibakezelés
- TMDB API hibák kezelése (401 Unauthorized, 404 Not Found)
- Environment konfiguráció ellenőrzés
- Hálózati hibák graceful kezelése

## InteractionController Osztály

### Konstruktor
- `constructor(models)` - Fogadja a modellek objektumot (UserMovieInteraction, UserWatchlist, Movie, User)

### Metódusok

#### Swipe Műveletek
- `swipeMovie(req, res)` - Tinder-style film értékelés
  - Útvonal: `POST /api/interactions`
  - Paraméterek: `{userId, movieId, interactionType}` 
  - Típusok: 'LIKE', 'DISLIKE'
  - Automatikus watchlist kezelés (LIKE → hozzáad, DISLIKE → eltávolít)

#### Interakció Lekérdezések
- `getUserInteractions(req, res)` - Felhasználó összes swipe művelete
  - Útvonal: `GET /api/interactions/:userId?page=1&limit=20&interactionType=LIKE`
  - Paginálás és szűrés támogatása
  - Film adatokkal együtt visszaadva

- `getUserInteractionStats(req, res)` - Interakciós statisztikák
  - Útvonal: `GET /api/interactions/:userId/stats`
  - Like/dislike arányok, utolsó 7 nap aktivitás
  - Összesített számok és trendek

#### Interakció Kezelés
- `removeInteraction(req, res)` - Swipe művelet visszavonása
  - Útvonal: `DELETE /api/interactions/:userId/:movieId`
  - Automatikus watchlist cleanup

### Automatizmus
- **LIKE → Watchlist:** Minden liked film automatikusan watchlist-re kerül
- **DISLIKE → Cleanup:** Disliked filmek eltávolítása watchlist-ről
- **Duplikáció védelem:** Meglévő interakciók frissítése törlés helyett

## WatchlistController Osztály

### Konstruktor
- `constructor(models)` - Fogadja a modellek objektumot

### Metódusok

#### Watchlist Kezelés
- `getUserWatchlist(req, res)` - Felhasználó watchlist-je
  - Útvonal: `GET /api/watchlist/:userId?page=1&sortBy=added_date&sortOrder=DESC`
  - Rendezési opciók: added_date, title, release_date, vote_average
  - Teljes film adatokkal és kép URL-ekkel

- `addToWatchlist(req, res)` - Film hozzáadása watchlist-hez
  - Útvonal: `POST /api/watchlist`
  - Automatikus LIKE interakció létrehozása
  - Duplikáció védelem

- `removeFromWatchlist(req, res)` - Film eltávolítása
  - Útvonal: `DELETE /api/watchlist/:userId/:movieId`
  - Csak watchlist-ből távolít el, interakció megmarad

#### Statisztikák
- `getWatchlistStats(req, res)` - Részletes watchlist elemzés
  - Útvonal: `GET /api/watchlist/:userId/stats`
  - Műfaj eloszlás, átlag rating és runtime
  - Évtized szerinti bontás, hozzáadási trendek

### Funkcionalitások
- **Intelligens rendezés:** Többféle rendezési opció
- **Műfaj elemzés:** Automatikus műfaj felismerés és statisztika
- **Trend követés:** Hozzáadási időpontok alapján aktivitás mérés

## RecommendationController Osztály

### Konstruktor
- `constructor(models)` - Fogadja a modellek objektumot és TMDB API konfigurációt

### Intelligens Ajánló Algoritmus

#### Fő Ajánlási Endpoint
- `getPersonalizedRecommendations(req, res)` - Többrétegű személyre szabott ajánlás
  - Útvonal: `GET /api/recommendations/:userId?limit=20&excludeWatched=true`
  - **40% Preferencia alapú:** Explicit felhasználói beállítások
  - **30% Ízlés alapú:** Liked filmek alapján hasonló tartalmak
  - **20% Népszerűség alapú:** Trending filmek személyre szabva  
  - **10% Felfedezés:** Új műfajok felderítése

#### Specialized Recommendations
- `getSimilarMovies(req, res)` - Adott filmhez hasonló tartalmak
  - Útvonal: `GET /api/recommendations/:userId/similar/:movieId?limit=10`
  - TMDB similar movies API + felhasználói szűrés

- `getPersonalizedTrending(req, res)` - Trending filmek ranking személyre szabva
  - Útvonal: `GET /api/recommendations/:userId/trending?timeWindow=week&limit=20`
  - Felhasználói scoring alkalmazása trending listákra

- `getDiscoveryRecommendations(req, res)` - Új műfajok felfedezése
  - Útvonal: `GET /api/recommendations/:userId/discovery?limit=15`
  - Még nem kedvelt/feltárt műfajok ajánlása

### Felhasználói Profil Elemzés

#### Machine Learning Jellegű Funkciók
- **getUserProfile()** - Komplex felhasználói viselkedés elemzés
  - Műfaj preferenciák extraction liked filmekből
  - Év preferencia pattern recognition
  - Like ratio és rating átlag számítása
  - Interakciós history mining

#### Scoring Algorithm
- **scoreMoviesForUser()** - Multi-factor film pontozási rendszer
  - TMDB rating baseline (x10 weight)
  - Műfaj egyezések (+20 points/match)
  - Év preferencia proximity scoring
  - Népszerűség boost (x0.1 weight)

### Recommendation Engine Stratégiák

#### Preference-Based Engine
- Explicit felhasználói preferenciák (18 műfaj binary)
- Év tartomány és rating szűrés
- Runtime preferenciák alkalmazása
- TMDB discover API optimalizált query-k

#### Taste-Based Engine  
- Top 3 liked film alapján recommendations API hívás
- Collaborative filtering alapú TMDB adatok
- User behavior pattern matching

#### Discovery Engine
- Unexplored genre identification
- High-quality content filtering (7.0+ rating, 100+ votes)
- Comfort zone expansion algorithm

### Advanced Features

#### Smart Filtering
- **applyUserFilters()** - Már látott tartalmak kiszűrése
- Interaction history overlap detection
- Duplicate content elimination across sources

#### Data Processing
- **processAndCacheMovies()** - Intelligent caching strategy
- TMDB API response optimization  
- Image URL automatic generation
- Genre ID array parsing and processing

### Performance Optimizations
- Multi-source recommendation aggregation
- Weighted scoring system för relevance
- Pagination aware result limiting
- Cache-first strategy implementáció
