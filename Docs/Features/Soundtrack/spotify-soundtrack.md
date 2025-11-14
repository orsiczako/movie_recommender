# Spotify Soundtrack Integráció

## Áttekintés

A Spotify integráció automatikusan megtalálja és megjeleníti a filmek hivatalos filmzenéit. A rendszer szűrési logikával biztosítja, hogy releváns soundtrackeket jelenítsen meg.

## Authentikáció és API Használat

A rendszer a Spotify Client Credentials Flow authentikációt használja. A hozzáférési token automatikusan frissül, amikor lejár, és cache-elve van a teljesítmény javítása érdekében. A SoundtrackController kezeli a Spotify API kommunikációt.

## Keresési Stratégia

A soundtrack keresés során a rendszer először albumokat keres, mivel ezek általában hivatalos kiadások, ellentétben a felhasználók által létrehozott playlistekkel. Az albumok rendelkeznek megfelelő metaadatokkal, mint borítókép, kiadási dátum és előadók.

A keresés több formátumban történik: a film címével, valamint különböző soundtrack kulcsszavakkal kombinálva, mint OST, soundtrack, original soundtrack és original motion picture.

## Szűrési Logika

A keresési eredményekből a rendszer szűri azokat az albumokat, amelyek valóban a filmhez tartoznak. A szűrés során ellenőrzi, hogy az album címe tartalmazza-e a film címét, és hogy szerepel-e benne soundtrack jellegű kulcsszó.

A rendszer word boundary használatával ellenőrzi a címegyezést, így elkerülve a hamis találatokat. Például az Enough című film esetén nem jeleníti meg a Never Enough című dalt tartalmazó albumokat.

Az album címének elején kell szerepelnie a film címének, hogy elfogadott legyen. Ez megakadályozza olyan találatok megjelenését, ahol a film címe csak véletlenül szerepel a cím közepén vagy végén.

## Graceful Degradation

Ha a rendszer nem talál hivatalos soundtrackot egy filmhez, a SoundtrackSection komponens egyszerűen elrejti magát. Nem jelenik meg hibaüzenet vagy üres szekció, így a felhasználói élmény tiszta marad.

A komponens felismeri azokat a hibaüzeneteket, amelyek azt jelzik, hogy nincs soundtrack, és ezeket speciálisan kezeli. Más típusú hibák esetén viszont megjelenik a hibaüzenet és egy újrapróbálkozás gomb.

## Megjelenített Információk

A soundtrack szekció megjeleníti az album borítóját nagy felbontásban, az album címét, az előadók listáját és a kiadási dátumot. Van egy Spotify link is, amely megnyitja az albumot a Spotify alkalmazásban vagy webes lejátszóban.

A track lista tartalmazza az összes szám címét, az előadókat track-enként és a szám hosszúságát perc:másodperc formátumban. Ha elérhető, az explicit tartalom is jelölve van.

## Spotify Deep Linking

A rendszer Spotify deep linkeket használ, amelyek asztali gépen a Spotify alkalmazást nyitják meg, mobil eszközökön pedig a Spotify appot vagy web playert. Ha egyik sem elérhető, a böngészőben nyílik meg a Spotify webes lejátszó.

## Hibakezelés

Az API hibákat a rendszer kecsesen kezeli. Unauthorized hiba esetén újra authentikál és újrapróbálja a kérést. Rate limit esetén exponenciális várakozást alkalmaz. Hálózati hibák esetén általános hibaüzenet jelenik meg újrapróbálkozási lehetőséggel.

A frontend oldalon timeout van beállítva a betöltéshez, és a hibás album adatok egyszerűen kihagyásra kerülnek. Ha az album borítóképe nem tölthető be, egy alapértelmezett kép jelenik meg.

## Teljesítmény Optimalizáció

A Spotify hozzáférési token egy órán át cache-elve van, így nem szükséges minden kereséskor új tokent kérni. A backend korlátozza a lekérések számát, maximum húsz albumot kér le keresési művelentenként.

A frontend lazy loading-ot használ az album borítóknál, és skeleton loader jelenik meg a betöltés alatt. Az újrapróbálkozásoknál debounce van alkalmazva, hogy elkerülje a túl gyakori kéréseket.

## Lokalizáció

A soundtrack szekció teljesen lokalizált magyar és angol nyelven. Az összes felhasználói felületi elem, gomb és üzenet megfelelő nyelven jelenik meg a felhasználó beállításai alapján.
