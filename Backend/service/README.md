# Service (Szolgáltatások)

## Mappa struktúra:

```
service/
├── business/          # Üzleti logika (fő szakácsok)
│   └── user.service.js
├── helpers/           # Segédfunkciók (konyhai eszközök)
│   ├── email.helper.js
│   ├── messages.helper.js  
│   ├── security.helper.js
│   └── api-response.helper.js
└── middlewares/       # Köztes szűrők (minőség-ellenőrök)
    ├── async-handler.middleware.js
    └── request-validation.middleware.js
```

## Async/Await - miért kell és hogyan működik?

### A probléma:

Képzeld el, hogy süteményt készítesz:
1. Beteszed a sütőbe (40 perc)
2. Közben **NEM ülsz tétlenül** - mosogatsz, takarítasz
3. Amikor kész, kiveszed

A számítógépnél is hasonló:
1. Adatbázisból lekérdezés (2-3 másodperc)
2. Közben **más kéréseket is kiszolgálhat**
3. Amikor kész az adat, feldolgozza

### Async/Await magyarázat:

```javascript
// ROSSZ - blokkoló (mindenki várakozik):
function bejelentkezes(username) {
  const user = adatbazisKerdezes(username); // 3 másodperc alatt
  // Itt MINDEN MÁS LEÁLL 3 másodpercre!
  return user;
}

// JÓ - nem blokkoló:
async function bejelentkezes(username) {
  const user = await adatbazisKerdezes(username); // 3 másodperc alatt
  // Más kérések közben is dolgozhatnak!
  return user;
}
```


## Business Layer

### UserService példa - bejelentkezés:

```javascript
async login(username, password) {
  // 1. Megkeresi a felhasználót az adatbázisban
  const user = await this.User.findOne({ where: { login_name: username } });
  
  // 2. Ha nincs ilyen felhasználó:
  if (!user) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }
  
  // 3. Ellenőrzi a jelszót (security helper-rel):
  const isValid = await verifyPassword(password, user.password_hash);
  
  // 4. Ha nem jó a jelszó:
  if (!isValid) {
    return { success: false, error: 'INVALID_CREDENTIALS' };
  }
  
  // 5. Ha minden rendben, visszaadja a felhasználó adatait:
  return { 
    success: true, 
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  };
}
```

- **Controller** meghívja: `userController.login(username, password)`
- **UserService** elvégzi a munkát
- **Security helper**-t használja jelszó ellenőrzéshez
- **User model**-t használja adatbázis lekérdezéshez

## Helpers - segédfunkciók:

### security.helper.js - biztonság

**Mit csinál:**
- Jelszavakat titkosít (bcrypt)
- Tokeneket generál (crypto)
- Lejárati időket kezel

```javascript
// Jelszó titkosítás:
const hash = await encryptPassword("titkosJelszo123");
// Eredmény: "$2b$10$8K9B2..." (soha nem visszafejthető)

// Jelszó ellenőrzés:
const helyes = await verifyPassword("titkosJelszo123", hash);
// Eredmény: true vagy false
```

**Hogy használja:**
- **UserService** meghívja jelszó titkosításkor és ellenőrzéskor
- **Token generálást** használja jelszó-visszaállításkor

### email.helper.js - email küldés

**Mit csinál:**
- SMTP szerveren keresztül emailt küld
- Fejlesztői módban csak console-ra írja

```javascript
const result = await sendMail(
  "user@example.com",          // Címzett
  "Jelszó visszaállítás",      // Tárgy
  "Szöveges tartalom",         // Sima szöveg
  "<h1>HTML tartalom</h1>"     // HTML verzió
);
```

**Hogy használja:**
- **UserService** meghívja `forgotPassword` metódusban
- Email template-et kap a frontend-től
- Link-et generál a backend URL-jével

### messages.helper.js - többnyelvűség

**Mit csinál:**
- Hibaüzeneteket fordít (magyar/angol)
- Böngésző nyelvét érzékeli

```javascript
const locale = detectLocale(req.headers); // "hu" vagy "en"
const uzenet = t(locale, 'user.errors.invalid_credentials');
// Magyar: "Hibás belépési adatok"
// Angol: "Invalid credentials"
```

**Hogy használja:**
- **Router**-ek meghívják minden válasznál
- **ApiResponse helper** használja egységes válaszokhoz

### api-response.helper.js - egységes válaszok

**Mit csinál:**
- Minden API választ ugyanabban a formátumban küld
- Automatikusan kezeli a nyelvet és hibakódokat

```javascript
// Siker:
ApiResponse.success(res, 'user.success.login_success', { user: userData });

// Hiba:
ApiResponse.error(res, 'user.errors.invalid_credentials', 401);
```

**Hogy használja:**
- **Router**-ek meghívják minden válasznál
- Egységes formátumot biztosít: `{ success: true/false, message: "...", ... }`

## Middlewares - köztes szűrők:

### async-handler.middleware.js

**Mit csinál:**
Automatikusan elkapja az async függvényekben keletkező hibákat.

```javascript
// Nélküle:
router.post('/login', async (req, res) => {
  try {
    const result = await userController.login(...);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Vele:
router.post('/login', asyncHandler(async (req, res) => {
  const result = await userController.login(...);
  res.json(result); // Ha hiba van, automatikusan elkapja
}));
```

### request-validation.middleware.js

**Mit csinál:**
Ellenőrzi, hogy a kötelező mezők megvannak-e.

```javascript
// Használat:
router.post('/login', 
  validateRequired('username', 'password'), // Ellenőrzi, hogy megvannak
  async (req, res) => {
    // Itt már biztos, hogy username és password létezik
  }
);
```

## Hogy függ össze az egész?

### Bejelentkezés példa:

1. **Frontend** küld POST kérést `/api/users/login`-ra
2. **User Router** fogadja → `validateRequired` middleware ellenőrzi
3. **AsyncHandler** becsomagolja → **User Controller** meghívása
4. **User Controller** → **User Service** meghívása
5. **User Service** → **Security Helper** jelszó ellenőrzés
6. **User Service** → **User Model** adatbázis lekérdezés
7. **User Controller** → **ApiResponse Helper** válasz formázás
8. **Router** visszaküldi a frontend-nek

Minden rész csak a saját dolgát csinálja, így könnyű megérteni és módosítani!

## Segéd Modulok

### Email Helper (`email.helper.js`)
Email küldési funkcionalitást kezeli SMTP használatával.

#### Függvények
- `initMail()` - Nodemailer transporter inicializálása környezeti konfigurációval
- `sendMail(to, subject, text, html)` - Email küldése szöveges és HTML tartalommal
  - Paraméterek: Címzett, tárgy, sima szöveg, HTML tartalom
  - Visszatérés: `{success: boolean, messageId?: string, error?: string}`
  - Fejlesztői mód: Email tartalom naplózása küldés helyett

#### Konfiguráció
Környezeti változókat használ:
- `EMAIL_HOST` - SMTP szerver hostname
- `EMAIL_PORT` - SMTP szerver port
- `EMAIL_USER` - SMTP hitelesítési felhasználónév
- `EMAIL_PASS` - SMTP hitelesítési jelszó

### Messages Helper (`messages.helper.js`)
Nemzetköziesítési támogatást biztosít felhasználó felé irányuló üzenetekhez.

#### Függvények
- `t(locale, key)` - Üzenet kulcs fordítása honosított stringre
  - Paraméterek: Nyelvi kód ('hu'/'en'), üzenet kulcs (pont jelölés)
  - Visszatérés: Honosított string vagy kulcs ha fordítás hiányzik
  - Fallback: Magyar ha a locale nem támogatott

- `detectLocale(headers)` - Nyelvi preferencia kinyerése HTTP fejlécekből
  - Paraméterek: Express kérés fejlécek objektum
  - Visszatérés: Nyelvi kód ('hu'/'en')
  - Alapértelmezett: 'hu' (magyar)

#### Üzenet Struktúra
Hierarchikus üzenet szervezés:
```javascript
{
  hu: {
    user: {
      errors: { /* hibaüzenetek */ },
      success: { /* siker üzenetek */ }
    },
    common: { /* megosztott üzenetek */ }
  },
  en: { /* angol fordítások */ }
}
```

### Recovery Helper (`recovery.helper.js`)
Jelszó visszaállítási token életciklus kezelést kezeli.

#### Függvények
- `generateRecoveryToken()` - Kriptográfiailag biztonságos token létrehozása
  - Visszatérés: 32 karakteres hexadecimális string
  - Node.js crypto.randomBytes-ot használ biztonságért

- `hashRecoveryToken(token)` - Token titkosítása adatbázis tároláshoz
  - Paraméterek: Sima szöveges token
  - Visszatérés: Promise amely bcrypt hash-re oldódik fel
  - Ugyanaz a biztonsági szint mint a jelszavaknál

- `verifyRecoveryToken(token, hash)` - Token validálása tárolt hash ellen
  - Paraméterek: Sima szöveges token, tárolt hash
  - Visszatérés: Promise amely boolean-ra oldódik fel
  - Konstans idejű összehasonlítás biztonságért

- `generateRecoveryExpiration()` - Token lejárati időbélyeg létrehozása
  - Visszatérés: Date objektum 24 órával mostantól
  - Fix lejárati ablak biztonságért

- `isRecoveryTokenExpired(expirationDate)` - Token érvényesség ellenőrzése
  - Paraméterek: Date objektum adatbázisból
  - Visszatérés: Boolean amely lejárati státuszt jelez

### Security Helper (`security.helper.js`)
Jelszó titkosítási és verifikációs szolgáltatásokat biztosít.

#### Függvények
- `encryptPassword(plainPassword)` - Jelszó hashelése tároláshoz
  - Paraméterek: Sima szöveges jelszó
  - Visszatérés: Promise amely bcrypt hash-re oldódik fel
  - Salt körök használata: 12 (biztonságos alapértelmezett)

- `verifyPassword(plainPassword, hashedPassword)` - Jelszó validálása
  - Paraméterek: Sima szöveges jelszó, tárolt hash
  - Visszatérés: Promise amely boolean-ra oldódik fel
  - Konstans idejű összehasonlítás timing támadások megelőzésére

### Password Helper (`password.helper.js`)
Örökölt modul amely elavult jelszó utilities-eket tartalmaz.
- Státusz: Elavult, funkcionalitás átköltözött security.helper.js-be
- Backward kompatibilitásért fenntartva
- Nem szabad új kódban használni

## Használati Minták

### Email Küldés
```javascript
const { sendMail } = require('./service/helpers/email.helper');
const result = await sendMail(email, subject, text, html);
```

### Nemzetköziesítés
```javascript
const { t, detectLocale } = require('./service/helpers/messages.helper');
const locale = detectLocale(req.headers);
const message = t(locale, 'user.errors.invalid_credentials');
```

### Nemzetköziesítés
```javascript
const { t, detectLocale } = require('./service/helpers/messages.helper');
const locale = detectLocale(req.headers);
const message = t(locale, 'user.errors.invalid_credentials');
```

#### Locale és T Funkció Részletes Magyarázat

##### Mi a `locale`?
A **locale** egy nyelvi azonosító kód (ISO 639-1 szabvány), amely meghatározza:
- **'hu'** - Magyar nyelv (alapértelmezett)
- **'en'** - Angol nyelv (másodlagos)
- Automatikusan detektálódik a böngésző `Accept-Language` fejléce alapján
- Fallback mechanizmus: ha ismeretlen locale érkezik, visszaesik magyarra

##### Mi a `t` funkció?
A **t** (translate) egy fordítási segédfunkció, amely:
- **Kulcs-alapú üzenet lekérést** biztosít (pl. 'user.errors.missing_fields')
- **Hierarchikus üzenet struktúrát** használ pont jelöléssel
- **Automatikus fallback-ot** nyújt (angol hiányában magyar)
- **Változó interpolációt** támogat {változó} formátumban

##### Működési Mechanizmus
```javascript
// 1. Nyelvdetektálás HTTP fejlécből
const locale = detectLocale(req.headers);
// req.headers['accept-language'] = 'hu-HU,hu;q=0.9,en;q=0.8'
// Eredmény: 'hu'

// 2. Üzenet lekérés hierarchikus kulccsal
const message = t('hu', 'user.errors.user_not_found');
// Belső működés:
// - messages['hu']['user']['errors']['user_not_found']
// - Ha nincs 'hu', akkor messages['hu'] (DEFAULT_LOCALE)
// Eredmény: "Nincs ilyen felhasználó."

// 3. Változó interpoláció támogatás
const greeting = t('hu', 'user.welcome', { name: 'János' });
// Ha messages.hu.user.welcome = "Üdvözöljük, {name}!"
// Eredmény: "Üdvözöljük, János!"
```

##### Gyakorlati Használati Példák

**Kontrollerben való használat:**
```javascript
// user.controller.js
async function login(req, res) {
    const locale = detectLocale(req.headers);
    
    try {
        // ... bejelentkezési logika
        const successMsg = t(locale, 'user.success.login_success');
        res.json({ 
            success: true, 
            message: successMsg // "Sikeres bejelentkezés." vagy "Login successful."
        });
    } catch (error) {
        const errorMsg = t(locale, 'user.errors.invalid_credentials');
        res.status(400).json({ 
            success: false, 
            message: errorMsg // "Hibás belépési adatok." vagy "Invalid credentials."
        });
    }
}
```

**Hibaüzenet kezelés middleware-ben:**
```javascript
// error.middleware.js
function errorHandler(err, req, res, next) {
    const locale = detectLocale(req.headers);
    const errorMsg = t(locale, 'common.errors.internal_server_error');
    
    res.status(500).json({
        success: false,
        message: errorMsg // "Belső szerver hiba." vagy "Internal server error."
    });
}
```

##### Üzenet Struktúra Hierarchia
```javascript
// i18n/messages.js struktúra
{
  hu: {
    user: {
      errors: {
        missing_fields: 'Hiányzó adatok.',
        user_not_found: 'Nincs ilyen felhasználó.',
        wrong_password: 'Hibás jelszó.'
      },
      success: {
        login_success: 'Sikeres bejelentkezés.',
        registered: 'Sikeres regisztráció.'
      }
    },
    common: {
      invalid_input: 'Érvénytelen adat.',
      unauthorized: 'Nincs jogosultságod.'
    }
  },
  en: { /* angol megfelelők */ }
}
```

##### Fallback Működés
1. **Elsődleges keresés:** `t('en', 'user.errors.missing_fields')`
2. **Ha nincs angol:** automatikusan magyar verzió keresése
3. **Ha nincs magyar sem:** visszaadja a kulcsot (`'user.errors.missing_fields'`)
4. **Biztonságos működés:** soha nem dob hibát, mindig ad vissza stringet

### Jelszó Biztonság
```javascript
const { encryptPassword, verifyPassword } = require('./service/helpers/security.helper');
const hash = await encryptPassword(password);
const isValid = await verifyPassword(password, hash);
```

### Visszaállítási Tokenek
```javascript
const { generateRecoveryToken, hashRecoveryToken } = require('./service/helpers/recovery.helper');
const token = generateRecoveryToken();
const hashedToken = await hashRecoveryToken(token);
```

