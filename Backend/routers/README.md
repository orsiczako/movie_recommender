# Routers (Útvonalak)


## A router:

1. **Figyeli a bejövő kéréseket** (GET, POST, PUT, DELETE)
2. **Ellenőrzi az útvonalat** (`/login`, `/register`, stb.)
3. **Meghívja a megfelelő controller-t**
4. **Visszaküldi a választ** a felhasználónak

- **async**: Megjelöli a függvényt, hogy várnia kell dolgokra
- **await**: "Várj meg, amíg ez befejeződik, de közben mást is csinálhatsz"

```javascript
async function example() {
  console.log("1. Indulás");
  
  const result = await slowDatabaseQuery(); // Ez 2 másodpercig tart
  
  console.log("2. Database kész:", result);
  console.log("3. Folytatjuk");
}
```

## Mappa struktúra:

```
routers/
├── index.js              # Fő router - mindent összeköt
├── client.router.js      # Statikus fájlok kiszolgálása (HTML, CSS, JS)
└── api/
    ├── index.js          # API routerek gyűjtője
    ├── user/
    │   └── index.js     # Felhasználói műveletek (/login, /register)
    └── settings/
        └── index.js     # Beállítások (/language)
```

## Összefüggések:

1. **index.js** (fő router) fogadja a kérést
2. Ha `/api/`-val kezdődik → **api/index.js**-nek adja át
3. Ha `/api/users/`-vel kezdődik → **api/user/index.js**-nek adja át
4. A **user router** meghívja a **user controller**-t
5. A **controller** meghívja a **user service**-t
6. A **service** használja a **helpers**-t (email, security, stb.)

## API végpontok részletesen:

### POST /api/users/login
```javascript
router.post('/login', async (req, res) => {
  // 1. Validáció: van-e username és password?
  // 2. Controller meghívása: userController.login()
  // 3. Ha sikeres: { success: true, user: {...} }
  // 4. Ha hiba: { success: false, error: "INVALID_CREDENTIALS" }
});
```

### POST /api/users/register
```javascript
router.post('/register', async (req, res) => {
  // 1. Validáció: van-e minden kötelező mező?
  // 2. Controller meghívása: userController.register()
  // 3. Hiba esetén: "USERNAME_TAKEN" vagy "EMAIL_TAKEN"
});
```

### POST /api/users/forgot-password
```javascript
router.post('/forgot-password', async (req, res) => {
  // 1. Email cím ellenőrzése
  // 2. Email template validálása
  // 3. Controller meghívása → service → email küldés
  // 4. Biztonsági okokból mindig "sikeres" választ ad
});
```

## Hibakezelés:

Minden router ugyanazt a pattern-t követi:
```javascript
try {
  const result = await controller.method();
  if (result.success) {
    res.json({ success: true, ... });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
} catch (error) {
  res.status(500).json({ success: false, message: "Szerverhiba" });
}
```

## Middleware-ek (köztes szűrők):

Ezek minden kérés előtt lefutnak:
- **validateRequired**: Ellenőrzi, hogy a kötelező mezők megvannak-e
- **asyncHandler**: Automatikusan elkapja a hibákat
- **ApiResponse**: Egységes válasz formátumot biztosít

## Fő Router (`index.js`)
Gyár függvény amely adatbázis modelleket fogad és a teljes routing struktúrát létrehozza.

### Exportok
- `function(models)` - Gyár függvény amely `{User, Settings}` modelleket fogad
- Konfigurált Express router példányt ad vissza

### Útvonal Regisztráció
- `/api` - Delegálja az API router gyárhoz
- Statikus fájl kiszolgálás a client router által kezelve

## API Router (`api/index.js`)
Aggregálja az összes API végpontot `/api` prefix alatt.

### Al-routerek
- `/users` - Felhasználó kezelési műveletek
- `/settings` - Felhasználói preferencia kezelés

## User Router (`api/user/index.js`)
Felhasználói fiók műveleteket és hitelesítést kezeli.

### Végpontok
- `POST /login` - Felhasználó hitelesítés
  - Body: `{username, password}`
  - Válasz: `{success, message, redirect?, user?}`
  - Státusz: 200 (siker), 400 (hiányzó mezők), 401 (érvénytelen adatok), 500 (hiba)

- `POST /register` - Felhasználó regisztráció
  - Body: `{username, password, email, fullName}`
  - Válasz: `{success, message, user?}`
  - Státusz: 200 (siker), 400 (hiányzó mezők), 409 (konfliktus), 500 (hiba)

- `POST /forgot-password` - Jelszó visszaállítás kezdeményezése
  - Body: `{email, emailTemplate}`
  - Válasz: `{success, message}`
  - Státusz: 200 (mindig biztonságért), 400 (hiányzó mezők), 500 (email hiba)

- `POST /reset-password` - Jelszó visszaállítás befejezése
  - Body: `{token, password}`
  - Válasz: `{success, message}`
  - Státusz: 200 (siker), 400 (érvénytelen/lejárt token), 500 (hiba)

### Kérés Kezelési Folyamat
1. Locale felismerés fejlécekből
2. Bemenet validálás (kötelező mezők)
3. Vezérlő metódus meghívása
4. Hiba leképezés honosított üzenetekre
5. HTTP válasz megfelelő státusz kóddal

## Settings Router (`api/settings/index.js`)
Felhasználói preferenciákat és konfigurációt kezeli.

### Végpontok
- `GET /` - Felhasználó nyelvi preferencia lekérdezése
  - Válasz: `{language}`
  - Státusz: 200 (siker), 500 (hiba)

- `POST /` - Felhasználó nyelvi preferencia frissítése
  - Body: `{language}`
  - Válasz: `{success, language, message}`
  - Státusz: 200 (siker), 400 (érvénytelen nyelv), 500 (hiba)

### Támogatott Nyelvek
- `hu` - Magyar (alapértelmezett)
- `en` - Angol

## Client Router (`client.router.js`)
Statikus fájl kiszolgálást és Single Page Application routing-ot kezeli.

### SPA Útvonalak
- `/`, `/login`, `/register`, `/dummy` - Fő HTML fájl kiszolgálása
- Statikus fájl kiszolgálás Frontend könyvtárból
- Fallback routing kliens oldali navigációhoz

## Hibakezelés
Minden router konzisztens hibakezelést implementál:
- Honosított hibaüzenetek i18n segédek használatával
- Megfelelő HTTP státusz kódok
- Hiba naplózás hibakereséshez
- Kecses fallback válaszok

## Válasz Formátum
Szabványosított JSON válasz struktúra:
```javascript
{
  success: boolean,
  message: string,        // Honosított üzenet
  data?: object,          // További válasz adatok
  error?: string          // Fejlesztői hiba részletek
}
```


