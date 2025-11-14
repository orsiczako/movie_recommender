# Kedvenc Filmek Kezelése

## Áttekintés

A kedvenc filmek rendszer lehetővé teszi a felhasználók számára, hogy személyes film gyűjteményt hozzanak létre és kezeljék kedvenceiket. A kedvencek a swipe funkción keresztül történő LIKE interakciókkal kerülnek be a listába.

## Interakció Rendszer

A kedvenc filmek a user-movie interakciók részei. Amikor a felhasználó egy filmre jobbra swipe-ol, az egy LIKE típusú interakciót hoz létre az adatbázisban, ami automatikusan hozzáadja a filmet a watchlist-hez is.

### Adatbázis Tárolás

Az interakciók egy saját táblában tárolódnak, amely tartalmazza a felhasználó azonosítót, a film azonosítót és az interakció típusát. A tábla garantálja, hogy egy felhasználó ugyanahhoz a filmhez csak egy interakciót rendelhet, így nem lehet duplikált kedvenc. A felhasználó törlésekor az összes kapcsolódó interakció is törlődik.

### Automatikus Film Létrehozás

Ha egy filmre történik interakció, amely még nem szerepel az adatbázisban, a rendszer automatikusan létrehozza a film rekordjait a TMDB API-ból. Ez biztosítja, hogy minden kedvenc film teljes részletekkel rendelkezzen.

## Kedvencek Megjelenítése

A FavoriteMoviesView komponens jeleníti meg a felhasználó kedvenc filmjeit. A komponens betölti az összes LIKE típusú interakciót, majd lekéri a kapcsolódó film adatokat. A filmek reszponzív grid nézetben jelennek meg.

### Reszponzív Megjelenítés

A grid elrendezés alkalmazkodik a képernyő méretéhez. Mobil eszközökön két oszlopos, nagyobb kijelzőkön több oszlopos elrendezésben jelennek meg a filmek.

### Film Kártyák

Minden film kártya tartalmazza a film poszterét, címét, megjelenési évét, műfajait és értékelését. A kártyán látható egy státusz jelvény is, amely jelzi, hogy a felhasználó látta-e már a filmet. Erre kattintással a film részletes nézete nyílik meg.

### Nyelvi Fordítás

A kedvencek betöltésekor a rendszer automatikusan lefordítja a filmek címeit és adatait a felhasználó által beállított nyelvre. Ez a TMDB API nyelvi paramétereivel történik, amely biztosítja, hogy a magyar és angol nyelvű felhasználók is a saját nyelvükön látják a film információkat.

## Kedvenc Törlése

A felhasználók törölhetnek filmeket a kedvencek közül a film részletes nézetéből. A törlés gomb megnyomásakor egy megerősítő dialógus jelenik meg magyar vagy angol nyelven. Ha a felhasználó megerősíti, az interakció törlődik az adatbázisból, és a watchlist-ből is eltávolítódik a film.

### Visszajelzések

A rendszer minden műveletről visszajelzést ad. A törlés után a felhasználó automatikusan visszakerül a kedvencek listájához, ahol már nem jelenik meg a törölt film.

## Üres Állapot

Ha a felhasználónak még nincsenek kedvenc filmjei, egy üres állapot komponens jelenik meg. Ez információt ad a kedvencek hiányáról, és egy gombot kínál a filmböngésző nézetre navigáláshoz, ahol új filmeket lehet felfedezni és kedvencnek jelölni.

## Valós Idejű Frissítés

A kedvencek lista automatikusan frissül, amikor a felhasználó új filmet like-ol vagy töröl egy kedvencet. Ez JavaScript custom event-ekkel történik, amelyek biztosítják a szinkronizációt az alkalmazás különböző részei között.

A komponens újratölti a kedvenceket, amikor a felhasználó visszatér az oldalra, valamint amikor a böngésző fül újra aktívvá válik. A nyelv váltásakor is automatikus újratöltés történik, hogy a filmek az új nyelven jelenjenek meg.

## Watched Státusz

A kedvencek listában minden film mellett jelenik meg egy jelvény, amely mutatja, hogy a felhasználó látta-e már az adott filmet. Ez a watchlist funkcióval van összekötve, ahol a felhasználók jelölhetik a már megtekintett filmeket.

## Műfajok Megjelenítése

A film kártyákon megjelennek a műfajok, maximum három műfaj jelenik meg kártyánként. A műfajok a felhasználó nyelvén jelennek meg a lokalizációs rendszer segítségével.

## Törlés Biztonsága

A törlés művelet tranzakció kezelést használ, amely biztosítja, hogy az interakció és a watchlist elem törlése egyszerre történjen meg. Ha valamelyik művelet sikertelen, egyik módosítás sem kerül véglegesítésre.
