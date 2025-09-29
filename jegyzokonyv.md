# 2025.09.29.:

## Backend: 
- A preferenciák elmentésével még akadnak gondok
- Seen/haven't seen logikát még meg kell tervezni
- Az adatbázist módosítani kell, amennyiben nincs benne seen/haven't seen, ennek ez értéke bináris, tehát vagy 0 vagy 1 (igaz/hamis)
### Állapot:
- Lassan készen van, a fent említetteket kell csak megoldani, refraktorálni sem kell

## Frontend:
- Át kell majd tervezni a frontendet
- Ki kellene találni, hogy hova helyezzük a seen/haven't seen gombot
- A világos/sötét témánál mindenképpen maradjon meg a háttér animáció, amennyiben a színvilágot akarjuk módosítani, úgy nem kell átírni mindent, csak az assetsben a themes.css-t (DRY és KISS elveknek felel meg, slay)
## Állapot: 
- Ez sem halad rosszul, kicsit talán hátrébb van, mint a backend, de jól haladunk ezzel is

## Tesztek:
- Ezt lehet érdemes majd Jesttel megoldani, az adatokat nem érdemes mockolni, hanem mondjuk teszt adatokat felhasználni az adatbázisból
- Backendre és Frontendre is kellene írni, az lenne a legjobb, a Frontendnél olyanokat érdemes írni, hogy egyáltalán egy adott gomb működik-e és hasonlók
## Állapot:
- Jelenleg még csak tervezési fázisban van

## SMTP:
- A szerver jó, viszont az Email Template-et, amit kiküldünk a jelszó helyreállításakor, azt még egy kicsit át kell gondolni és alakítani, eddig eléggé phising jellegűnek tűnik
## Állapot:
- Működik, készen van
