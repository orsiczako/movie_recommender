# DBO (Database Objects) - Adatbázis réteg

## Mi ez és mit csinál?

A **DBO** (Database Objects) olyan, mint egy **tolmács** a kód és az adatbázis között. Ahelyett, hogy SQL-t írna a programozó, egyszerű JavaScript-et használhat.

### Hasonlat:
Mint egy **fordító** egy idegen országban:
- Te beszélsz magyarul (JavaScript)
- A fordító (Sequelize ORM) lefordítja angolra (SQL)
- Az angol ember (MySQL adatbázis) megérti és válaszol
- A fordító visszafordítja neked magyarúl

## Mappa struktúra:

```
dbo/
├── index.js              # Adatbázis kapcsolat beállítása
├── user/
│   └── index.js         # User "tábla" definíciója  
└── settings/
    └── index.js         # Settings "tábla" definíciója
```

## Mi az az ORM és Sequelize?

### ORM = Object-Relational Mapping

**Régi módszer (SQL írás):**
```sql
SELECT * FROM account WHERE login_name = 'john_doe';
INSERT INTO account (login_name, email_address) VALUES ('jane', 'jane@mail.com');
```

**Modern módszer (JavaScript objektumok):**
```javascript
const user = await User.findOne({ where: { login_name: 'john_doe' } });
const newUser = await User.create({ login_name: 'jane', email_address: 'jane@mail.com' });
```

### Miért jobb?
- **Típusbiztos:** A JavaScript tudja, milyen mezők vannak
- **Olvashatóbb:** Mint a normál kód
- **Kevesebb hiba:** Nem kell SQL-t írni
- **Automatikus:** Kezeli a kapcsolatokat, validációt, stb.

## User Model részletesen:

### Mit tárol az adatbázisban:
```javascript
User modell → 'account' tábla az adatbázisban

Mezők:
- account_id: 123                    # Egyedi azonosító (automatikusan generált)
- login_name: "john_doe"             # Felhasználónév (egyedi)
- login_password_hash: "$2b$10$..."  # Titkosított jelszó (soha nem sima szöveg!)
- email_address: "john@example.com"  # Email cím
- full_name: "John Doe"              # Teljes név
- password_recovery_hash: null       # Jelszó-visszaállítási token (ha épp folyik)
- password_recovery_expires: null    # Token lejárati ideje
- created_at: "2025-01-15 10:30:00"  # Mikor regisztrált
- updated_at: "2025-01-15 10:30:00"  # Mikor módosult utoljára
```

### Hogyan használja a kód:

```javascript
// 1. Felhasználó keresése:
const user = await User.findOne({ where: { login_name: 'john_doe' } });

// 2. Új felhasználó létrehozása:
const newUser = await User.create({
  login_name: 'jane_doe',
  login_password_hash: 'titkosított_jelszó_hash',
  email_address: 'jane@example.com',
  full_name: 'Jane Doe'
});

// 3. Felhasználó módosítása:
await user.update({
  password_recovery_hash: 'új_token_hash',
  password_recovery_expires: new Date()
});

// 4. Felhasználó törlése:
await user.destroy();
```

## Settings Model:

### Mit tárol:
```javascript
Settings modell → 'settings' tábla

Mezők:
- user_id: 123                    # Melyik felhasználóé (kapcsolódik az account táblához)
- language: "hu"                  # Nyelvi beállítás ("hu" vagy "en")
- theme: "light"                  # Téma beállítás ("light" vagy "dark")
- auto_save_interval: 60          # Automatikus mentés intervalluma (másodperc)
- results_per_page: 25           # Eredmények száma oldalanként
- animation_speed: "normal"       # Animáció sebesség ("slow", "normal", "fast", "off")
- created_at: "2024-01-01..."    # Létrehozás dátuma
- updated_at: "2024-01-01..."    # Utolsó módosítás dátuma
```

### Kapcsolat a User modellel:
```
account tábla (User)     ←→     settings tábla (Settings)
account_id: 123                 user_id: 123
login_name: "john"              language: "hu"
email: "john@..."               theme: "light"
                                auto_save_interval: 60
                                results_per_page: 25
                                animation_speed: "normal"
```

**1:1 kapcsolat:** Minden felhasználónak pontosan egy settings rekordja van.

## Async/Await az adatbázis műveleteknél:

### Miért aszinkron?

Az adatbázis lekérdezések **időbe telnek** (1-3 másodperc), ezért nem várhatjuk meg szinkron módon.

```javascript
// ROSSZ (szinkron - blokkolná a szervert):
function getUser(username) {
  const user = User.findOne({ where: { login_name: username } }); // 2 mp várakozás
  return user; // Ez 2 másodperc múlva fut le
}

// JÓ (aszinkron - nem blokkolja a szervert):
async function getUser(username) {
  const user = await User.findOne({ where: { login_name: username } }); // Megvárja, de közben más is dolgozhat
  return user;
}
```

### Tipikus adatbázis műveletek:

```javascript
// SELECT lekérdezés:
const users = await User.findAll(); // Összes felhasználó
const user = await User.findOne({ where: { email_address: email } }); // Egy felhasználó

// INSERT (új rekord):
const newUser = await User.create({ login_name: 'test', ... });

// UPDATE (módosítás):
await user.update({ full_name: 'Új Név' });

// DELETE (törlés):
await user.destroy();
```

## Hogy használja a többi rész?

### UserService példa:

```javascript
class UserService {
  constructor(User) {
    this.User = User; // "Megkapja" a User modellt
  }

  async login(username, password) {
    // 1. Megkeresi a felhasználót:
    const user = await this.User.findOne({ 
      where: { login_name: username } 
    });
    
    // 2. Ha nincs ilyen felhasználó:
    if (!user) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }
    
    // 3. Jelszó ellenőrzés és tovább...
  }
}
```

### Router → Controller → Service → Model lánc:

```
1. Router fogadja a kérést
2. Controller koordinálja  
3. Service végzi a logikát
4. Model beszél az adatbázissal:
   
   Service: "Keresd meg a john_doe felhasználót"
   Model:   "SELECT * FROM account WHERE login_name = 'john_doe'"
   MySQL:   "Itt van az eredmény: { id: 123, name: 'john_doe', ... }"
   Model:   "Itt van JavaScript objektumként: user = { account_id: 123, ... }"
   Service: "Köszönöm, itt a jelszó ellenőrzés..."
```

## Konfigurációs fájl (dbo/index.js):

```javascript
// Adatbázis kapcsolat beállítása:
const sequelize = new Sequelize(
  process.env.DB_NAME,     // "projekt"
  process.env.DB_USER,     // "root"  
  process.env.DB_PASS,     // "AppleTree1234"
  {
    host: process.env.DB_HOST,     // "localhost"
    port: process.env.DB_PORT,     // 3306
    dialect: 'mysql'               // MySQL adatbázis
  }
);

// Modellek betöltése:
const User = require('./user')(sequelize);
const Settings = require('./settings')(sequelize);

// Exportálás, hogy más fájlok használhassák:
module.exports = { sequelize, User, Settings };
```

Ez az adatbázis réteg lehetővé teszi, hogy a kód egyszerű JavaScript objektumokkal dolgozzon SQL helyett!

## Adatbázis Kapcsolat
A `dbo/index.js`-ben kezelve:
- Sequelize példány konfiguráció
- Modell regisztráció és asszociációk
- Adatbázis hitelesítés és szinkronizáció
- Kapcsolat pooling és hibakezelés

## Modellek

### User Modell (`user/index.js`)
Felhasználói fiókokat reprezentálja az `account` táblában.

#### Mezők
- `account_id` - Elsődleges kulcs (auto-increment)
- `login_name` - Egyedi felhasználónév hitelesítéshez
- `login_password_hash` - Titkosított jelszó bcrypt használatával
- `password_recovery_expires` - Visszaállítási token lejárati időbélyeg
- `password_recovery_hash` - Titkosított visszaállítási token
- `email_address` - Felhasználó email címe
- `full_name` - Felhasználó megjelenítendő neve
- `created_at` - Fiók létrehozási időbélyeg
- `updated_at` - Utolsó módosítási időbélyeg

#### Tábla Konfiguráció
- Tábla név: `account`
- Időbélyegek: Engedélyezve egyedi oszlop nevekkel
- Egyedi korlátozások: `login_name`
- Nullable mezők: Csak visszaállítással kapcsolatos mezők

### Settings Modell (`settings/index.js`)
Felhasználói preferenciákat reprezentálja a `settings` táblában.

#### Mezők
- `user_id` - Elsődleges kulcs és külső kulcs az account táblához
- `language` - Felhasználói felület nyelvi preferencia (alapértelmezett: 'hu')

#### Tábla Konfiguráció
- Tábla név: `settings`
- Külső kulcs kapcsolat a User modellhez
- Alapértelmezett nyelv: Magyar ('hu')

## Adatbázis Séma Kapcsolatok
```
account (User)
    ↓ 1:1
settings (Settings)
```

## Modell Exportok
A `dbo/index.js` exportálja:
- `sequelize` - Adatbázis kapcsolat példány
- `User` - User modell osztály
- `Settings` - Settings modell osztály

## Használat az Alkalmazásban
```javascript
const { sequelize, User, Settings } = require('./dbo');

// Modellek átadása vezérlőknek és útvonalaknak
const userController = new UserController(User);
```

## Adatbázis Műveletek
A modellek támogatják a standard Sequelize műveleteket:
- `findOne()`, `findAll()` - Lekérdezések
- `create()` - Új rekordok beszúrása
- `update()` - Meglévő rekordok módosítása
- `destroy()` - Rekordok törlése

## Migráció és Szinkronizáció
Adatbázis szinkronizáció automatikusan kezelve:
- `alter: true` - Meglévő táblákat módosítja a modell definícióknak megfelelően
- Logging engedélyezve fejlesztői hibakereséshez
- Hibakezelés kapcsolat hibákhoz
