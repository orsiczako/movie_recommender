# Felhasználói Profil és Beállítások

## Áttekintés

A profil és beállítások rendszer lehetővé teszi a felhasználók számára, hogy testreszabják az alkalmazást és kezeljék személyes adataikat.

## Felhasználói Profil

A ProfileView komponens jeleníti meg a felhasználói profilt, amely tartalmazza a felhasználó nevét, email címét és a fiók regisztrációjának dátumát.

### Személyes Adatok Szerkesztése

A felhasználók módosíthatják a nevüket, email címüket és felhasználónevüket. A felhasználónév csak olvasható, nem módosítható. Van lehetőség egy rövid bemutatkozó szöveg megadására is. A változtatások azonnal mentődnek a háttérrendszerbe.

### Jelszó Változtatás

A jelszó megváltoztatásához három mezőt kell kitölteni: a jelenlegi jelszót, az új jelszót és az új jelszó megerősítését. A rendszer először ellenőrzi, hogy a megadott jelenlegi jelszó helyes-e. Az új jelszónak legalább nyolc karakterből kell állnia.

A jelszavak titkosítva kerülnek tárolásra bcrypt hash algoritmussal, amely biztosítja a biztonságos tárolást. A jelszó változtatás után megerősítő üzenet jelenik meg.

## Témaválasztás

Az alkalmazás világos és sötét témát is támogat. A ThemeSwitcher komponens lehetővé teszi a felhasználók számára, hogy átváltsanak a két téma között. A téma beállítás azonnal érvényesül az egész alkalmazásban.

A kiválasztott téma a böngésző localStorage-ában tárolódik, így a következő látogatáskor is megmarad a beállítás. A témaváltás animációval történik a jobb felhasználói élmény érdekében.

## Nyelvi Beállítások

Az alkalmazás két nyelvet támogat: magyart és angolt. A LanguageSwitcher komponens segítségével a felhasználók válthatnak a nyelvek között. A nyelvi beállítás szintén localStorage-ban kerül mentésre.

Minden felhasználói felületi elem, üzenet és tartalom teljes mértékben lokalizált mindkét nyelven. A nyelvváltás után az alkalmazás automatikusan frissül az új nyelven.

## Responsivitás

A profil oldal teljesen reszponzív kialakítású. Mobil eszközökön egy oszlopos elrendezést használ teljes szélességű mezőkkel és érintésre optimalizált gombokkal. Nagyobb képernyőkön az elrendezés kihasználja a rendelkezésre álló helyet, központosított tartalommal és megfelelő távolságokkal.

## Felhasználói Élmény

A profil és beállítások rendszer egyszerű és könnyen használható. Minden műveletnél azonnali visszajelzést kap a felhasználó, legyen az sikeres mentés vagy hibaüzenet. A felület világos vizuális hierarchiával rendelkezik, amely segíti a tájékozódást.
