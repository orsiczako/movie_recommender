const { messages, DEFAULT_LOCALE } = require('../../i18n/messages');

/**
 * Visszaad egy locale objektumot (ha nincs, akkor az alapértelmezettet)
 * Például: getLocaleObj('hu') → messages.hu objektum
 * Ha 'xyz' nyelvet kérsz ami nem létezik → messages.hu (alapértelmezett)
 */
function getLocaleObj(locale) {
    // Ha létezik a kért nyelv (pl. messages['en']), akkor azt adja vissza
    // Ha nem létezik (pl. messages['fr']), akkor az alapértelmezett magyart (messages['hu'])
    return messages[locale] || messages[DEFAULT_LOCALE];
}

/**
 * Detectálja a locale-ot az Accept-Language fejléc alapján
 * Például: 'hu-HU,hu;q=0.9,en;q=0.8' → 'hu'
 * Vagy: 'en-US,en;q=0.5' → 'en'
 */
function detectLocale(headers = {}, fallback = DEFAULT_LOCALE) {
    // Kiolvassa az Accept-Language fejlécet többféle névvel
    // headers['accept-language'] vagy headers.accept
    const al = headers['accept-language'] || headers.accept || '';
    
    // Regex-szel kikeresi az első nyelvi kódot
    // Példa: 'hu-HU,hu;q=0.9' → match[0] = 'hu-HU'
    const m = String(al).match(/[a-zA-Z]{1,8}(?:-[a-zA-Z]{1,8})?/);
    
    // Ha nincs találat, visszaadja a fallback-et (alapértelmezett 'hu')
    if (!m) return fallback;
    
    // Az első 2 karaktert veszi (hu-HU → hu, en-US → en)
    return String(m[0]).slice(0,2).toLowerCase();
}

/**
 * Egyszerű kulcs-alapú lekérdezés: 'user.errors.missing_fields'
 * Támogatja a változó behelyettesítést: "Üdv {name}!" + {name: "János"} → "Üdv János!"
 */
function t(locale, key, vars = {}) {
    // 1. Lépés: Megszerzi a megfelelő nyelvi objektumot
    // locale='hu' → localeObj = messages.hu
    const localeObj = getLocaleObj(locale);
    
    // 2. Lépés: A kulcsot pont mentén szétbontja
    // 'user.errors.missing_fields' → ['user', 'errors', 'missing_fields']
    const parts = String(key).split('.');
    
    // 3. Lépés: Végigmegy a kulcs részeken és mélyebbre ás az objektumban
    // localeObj['user']['errors']['missing_fields']
    // reduce: acc=localeObj, p='user' → acc=localeObj.user
    //         acc=localeObj.user, p='errors' → acc=localeObj.user.errors  
    //         acc=localeObj.user.errors, p='missing_fields' → acc=localeObj.user.errors.missing_fields
    let val = parts.reduce((acc, p) => (acc && acc[p] !== undefined ? acc[p] : undefined), localeObj);

    // 4. Lépés: Ha nem találta meg ÉS nem az alapértelmezett nyelven kerestük
    if (val === undefined && locale !== DEFAULT_LOCALE) {
        // Fallback: Próbálja meg az alapértelmezett nyelvben (magyar)
        // Például: angol verzió hiányzik → magyar verzió keresése
        const defaultObj = getLocaleObj(DEFAULT_LOCALE);
        val = parts.reduce((acc, p) => (acc && acc[p] !== undefined ? acc[p] : undefined), defaultObj);
    }

    // 5. Lépés: Ha még mindig nincs érték vagy nem string, visszaadja a kulcsot
    // Biztonságos működés: soha nem dob hibát
    if (typeof val !== 'string') return key;

    // 6. Lépés: Változó behelyettesítés {változó} formátumban
    // "Üdv {name}!" + vars={name: "János"} → "Üdv János!"
    // Regex: /\{([^}]+)\}/g keresi a {valamit} mintákat
    return val.replace(/\{([^}]+)\}/g, (_, g) => {
        // Ha van ilyen kulcs a vars objektumban, behelyettesíti
        // Ha nincs, meghagyja az eredeti {kulcs} formátumot
        return Object.prototype.hasOwnProperty.call(vars, g) ? String(vars[g]) : `{${g}}`;
    });
}

module.exports = { getLocaleObj, detectLocale, t };