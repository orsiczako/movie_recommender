# Cucumber BDD Tests

Ez a könyvtár tartalmazza a Cucumber BDD teszteket a movie recommender alkalmazáshoz.

## Előfeltételek

- Node.js és npm telepítve
- A frontend alkalmazás fut a `http://localhost:5173` címen
- A backend API fut

## Telepítés

A szükséges csomagok már telepítve vannak a projekt root-jából:

```bash
cd Frontend
npm install
```

## Tesztek futtatása

### Normál mód (böngésző ablakkal)

```bash
npm test
```

Ez a parancs elindítja a Cucumber teszteket Playwright-tel, és látható böngésző ablakban futnak a tesztek.

### Headless mód (háttérben)

```bash
npm run test:headless
```

Ez a parancs headless módban futtatja a teszteket, nincs látható böngésző ablak.

### Csak egy feature futtatása

```bash
npx cucumber-js features/user-stories.feature
```

### Csak egy konkrét scenario futtatása

```bash
npx cucumber-js features/user-stories.feature:8
```

(ahol :8 a scenario sorszáma)

## Feature fájl struktúra

```
Frontend/
  features/
    user-stories.feature      # Gherkin user story-k
    step_definitions/         # Step implementation fájlok
      auth_steps.js           # Authentikáció lépések
      preferences_steps.js    # Preferenciák lépések
      movie_steps.js          # Film böngészés lépések
      ai_chat_steps.js        # AI chat lépések
      common_steps.js         # Közös lépések
    support/
      world.js                # Playwright setup és teardown
```

## Teszt jelentés

A tesztek futása után automatikusan generálódik egy HTML jelentés:

```
Frontend/cucumber-report.html
```

Ezt megnyitva böngészőben láthatod a tesztek eredményét részletesen.

## Tipp: Alkalmazás futtatása tesztelés előtt

Mielőtt futtatod a teszteket, győződj meg róla hogy:

1. A backend fut:
```bash
cd Backend
npm start
```

2. A frontend fut:
```bash
cd Frontend
npm run dev
```

3. Ezután külön terminálban futtasd a teszteket:
```bash
cd Frontend
npm test
```

## Hibakeresés

Ha a tesztek nem találnak elemeket:
- Ellenőrizd hogy a frontend fut-e (`http://localhost:5173`)
- Ellenőrizd hogy a CSS selectorok egyeznek-e a komponensekkel
- Használd a `headless: false` módot hogy lásd mi történik

Ha timeout hibát kapsz:
- Növeld a timeout értékeket a step definition fájlokban
- Ellenőrizd hogy az API gyorsan válaszol-e
