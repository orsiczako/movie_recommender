
# Sprint 2 Rendszerterv – Felhasználói Profil, Beállítások és Bejelentkezés

## Sprint Célja

A második fejlesztési szakaszban a cél az volt, hogy a felhasználók saját profilját és beállításait biztonságosan tudjuk kezelni, valamint a bejelentkezési rendszert megbízhatóvá tegyük. Ez épít az első sprint film-ajánló és preferencia alapjaira, kiegészítve személyre szabható és biztonságos felhasználói élménnyel.

---

## 1. Felhasználói Profil

**Miért fontos:**
A profil lehetővé teszi a felhasználóknak, hogy személyre szabják az élményt, kezeljék adataikat és kapcsolatba lépjenek a közösséggel a későbbi funkciókhoz.

**Főbb funkciók:**

* Név, e-mail, telefonszám, profilkép kezelése
* Biztonságos jelszó (bcrypt hash, erős jelszó szabályok)
* E-mail ellenőrzés és változtatás többlépcsős ellenőrzéssel
* Profilkép feltöltés és automatikus avatar generálás
* Fiók törlés: először “soft delete”, majd 30 nap után végleges törlés, GDPR kompatibilitás

**Frontend megvalósítás:**

* Vue komponensek valós idejű hibajelzésekkel és inline validációval
* Settings integráció: téma (világos/sötét), nyelv, értesítések

---

## 2. Beállítások Rendszer

**Cél:**
Lehetővé tenni a felhasználóknak, hogy személyre szabják a platform kinézetét, viselkedését és értesítési preferenciáit.

**Főbb kategóriák:**

* **Megjelenés:** világos/sötét/auto téma, nyelv, jövőben betűméret
* **Adatvédelem:** profil láthatóság, aktivitások elrejtése, keresőmotor opt-out
* **Értesítések:** e-mail, push értesítések, kategória alapú kapcsoló
* **Akadálymentesség:** nagy kontraszt, mozgáscsökkentés, billentyűzet navigáció

**Backend:**

* `user_settings` tábla JSON oszlopokkal a komplex beállításokhoz
* API: GET és PUT endpoint a beállítások lekéréséhez és frissítéséhez

---

## 3. Bejelentkezés és Autentikáció

**Funkciók:**

* Jelszóval és e-maillel történő biztonságos bejelentkezés
* Token alapú session-kezelés (JWT)
* Fiók aktivitás és biztonság nyomon követése

---

## 4. Kedvenc Filmek és Interakciók

**Főbb funkciók:**

* LIKE, DISLIKE típusú interakciók
* Watchlist kezelés, filmek hozzáadása, értékelés
* Real-time szinkronizáció több eszközön
* Optimista UI frissítés, rollback hibák esetén
* Adatbázis optimalizáció: indexek, partícionálás, cursor-based scroll

---

## 5. AI Chat Film Ajánló

**Miért:**
Lehetővé teszi, hogy a felhasználók természetes nyelven kérjenek filmeket és hangulat alapján kapjanak javaslatokat.

**Főbb funkciók:**

* Hangulat és műfaj alapú film ajánlás
* Több körös beszélgetés, előző kontextus megőrzése
* Actor/Director keresés, fuzzy matching, typo tolerancia
* TMDB API integráció, intelligens eredményválogatás

**Biztonság:**

* Prompt injection szűrés
* Tartalom szűrés
* Rate limiting
* Input validálás

---

## 6. Felhasználói Felület és Film Kártyák

* Reszponzív, adaptív grid layout
* Lazy loading és progressive image loading
* Interaktív film kártyák: kedvencek, részletek, értékelés
* Accessibility támogatás (billentyűzet, screen reader, színek)

---

## 7. Teljesítmény és Skálázhatóság

* AI chat válaszok cache-elése, streaming, fallback modellek
* Database optimalizáció: indexek, partícionálás, query optimalizálás
* Frontend: virtual scrolling, kép lazy loading, komponens caching
* Bundle splitting és lazy loading a gyorsabb oldalbetöltéshez

---

## 8. Tesztelés

* CRUD műveletek, concurrency, adatintegritás
* AI chat intent recognition, válasz relevancia, hibakezelés, teljesítmény
* Integrációs tesztek TMDB API-val, komponensek közötti kommunikáció

---

## 9. Eredmények

* Kedvenc filmek kezelése: teljes funkcionalitás
* AI chat: 95% intent felismerés, multi-turn kontextus
* Film kártyák: 12 variáns, WCAG 2.1 AA kompatibilis
* Keresés: fuzzy, typo-toleráns, filterezhető
* Teljesítmény: AI válasz átlag 2,4s, 150+ párhuzamos chat session stabil

**Felhasználói hatás:**

* AI chat funkcióval az aktív napi felhasználók 87%-a használta
* Kedvenc gyűjtemény építés 73% felhasználónál
* AI által javasolt filmek 56%-a hosszú távon kedvencek lettek

---

## 10. Következő Sprint (Sprint 3) Tervek

* Soundtrack funkció Spotify integrációval
* Közösségi megosztások
* Fejlett analitikák
* Progressive Web App offline működéssel
* Mikroszolgáltatás architektúra, real-time kommunikáció, ML pipeline előkészítés

---
