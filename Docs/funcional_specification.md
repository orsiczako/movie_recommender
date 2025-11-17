
# Funkcionális specifikáció

## Felhasználói szerepkörök

- **Regisztrált felhasználó**: Teljes funkcionalitás, személyre szabott ajánlások, saját lista, értékelés, preferenciák beállítása.

# Funkcionális követelmények

A rendszer fő funkciói a felhasználói élményre és a filmfelfedezésre koncentrálnak, két szerepkörre bontva: regisztrált felhasználó és vendég (guest).

### Regisztrált felhasználó funkciói:

* **Regisztráció és bejelentkezés:** E-mail cím és jelszó megadása; a rendszer biztonságosan tárolja az adatokat.
* **Kérdőív kitöltése:** Preferenciák (műfaj, hangulat, kedvenc filmek, színészek) rögzítése, amely az algoritmus személyre szabott ajánlásait vezérli.
* **Swipe mechanizmus:** Filmek gyors lapozása, elsődleges adatok megtekintése (borító, cím, év), részletek görgetéssel.
* **Személyes lista:** Kedvenc filmek elmentése, későbbi böngészés, szűrés és rendezés lehetősége.
* **Értékelés és véleményezés:** Csillagokkal történő pontozás/rövid szöveges vélemény hozzáadása.

## Fő funkciók

### 1. Regisztráció és bejelentkezés
- Új felhasználók regisztrációja e-mail és jelszó megadásával.
- Bejelentkezés meglévő fiókkal.
- Jelszó visszaállítás e-mailen keresztül.

### 2. Felhasználói profil és preferenciák
- Profiladatok megtekintése és szerkesztése.
- Filmpreferenciák (műfaj, év, nyelv, értékelés stb.) beállítása és módosítása.
- Preferenciák mentése, betöltése, visszaállítása alapértelmezettre.

### 3. Filmek böngészése és keresése
- Filmek listázása (népszerű, új, ajánlott, műfaj szerint).
- Részletes filmnézet: cím, év, műfaj, leírás, értékelés, poszter, soundtrack.
- Keresés filmcím, műfaj, év, nyelv alapján.

### 4. Személyre szabott ajánlások
- Algoritmus alapú filmjavaslatok a felhasználói preferenciák és korábbi interakciók alapján.
- Tinder-szerű swipe mechanizmus: filmek gyors elfogadása vagy elutasítása.

### 5. Kedvencek és saját lista
- Filmek hozzáadása/eltávolítása a kedvencekhez vagy saját listához.
- Kedvencek listázása, szerkesztése, törlése.

### 6. Értékelés és véleményezés
- Filmek értékelése (pl. csillagokkal vagy pontszámmal).
- Szöveges vélemények írása, szerkesztése, törlése.

### 7. Soundtrack keresés
- Filmekhez kapcsolódó soundtrackek keresése és megjelenítése (Spotify integráció).
- Lejátszási listák, albumok, zeneszámok megjelenítése.

### 8. AI-alapú film chat
- AI chat funkció, ahol a felhasználó kérdezhet a filmről, karakterekről, történetről.
- Többnyelvű támogatás (pl. magyar, angol).

## Nem funkcionális követelmények

- Reszponzív webes felület (mobil, tablet, asztali támogatás).
- GDPR-kompatibilis adatkezelés.
- Biztonságos hitelesítés és adatvédelem.
- Gyors válaszidő, optimalizált API-hívások.
- Dokumentált API és felhasználói útmutató.


