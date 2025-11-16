const axios = require('axios');

// Make transliteration optional: if the package isn't installed the server won't crash.
let transliterate = (s) => s;
try {
    const tmod = require('transliteration');
    transliterate = tmod.transliterate || tmod.default || tmod;
} catch (err) {
    console.warn('Optional module "transliteration" not available — skipping transliteration.');
}

class SoundtrackController {
  constructor() {
    this.spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    this.spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  // Engedékeny cím egyezés (minimum 60% szó)
  matchesTitle(spotifyName, movieTitle) {
    const nameNorm = this.prepareTitle(spotifyName);
    const titleWords = this.prepareTitle(movieTitle).split(' ').filter(w => w.length > 0);
    if (titleWords.length === 0) return false;
    const minMatches = Math.max(1, Math.ceil(titleWords.length * 0.6));
    const matches = titleWords.filter(word => nameNorm.includes(word)).length;
    return matches >= minMatches;
  }

  
  async getSpotifyAccessToken() {
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }
    try {
      const credentials = Buffer.from(`${this.spotifyClientId}:${this.spotifyClientSecret}`).toString('base64');
      const response = await axios.post(
        'https://accounts.spotify.com/api/token', // Feltételezett helyőrző URL
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 60000;
      return this.accessToken;
    } catch (err) {
      console.error('Spotify token error:', err.message);
      throw err;
    }
  }

  prepareTitle(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // ékezetek
      .replace(/[&\-\.,]/g, ' ')       // speciális karakterek
      .replace(/[^\w\s]/g, '')         // minden más nem betű/szóköz
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  getAlternativeTitles(title) {
    const alternatives = [];
    const cleaned = this.prepareTitle(title);

    const titleMap = {
      'your name': ['Kimi no Na wa', 'kimi no na wa'],
      'spirited away': ['Sen to Chihiro no Kamikakushi', 'sen to chihiro'],
      'princess mononoke': ['Mononoke Hime', 'mononoke hime'],
      'howls moving castle': ['Howl no Ugoku Shiro'],
      'my neighbor totoro': ['Tonari no Totoro'],
      'weathering with you': ['Tenki no Ko', 'tenki no ko'],
      'a silent voice': ['Koe no Katachi', 'koe no katachi'],
      'grave of the fireflies': ['Hotaru no Haka'],
      'pulp fiction': ['Pulp Fiction'],
      'fear and loathing in las vegas': ['Fear and Loathing in Las Vegas'],
    };

    if (titleMap[cleaned]) {
      alternatives.push(...titleMap[cleaned]);
    }

    return alternatives;
  }

  // 🔹 Keresési lekérdezések összeállítása
  buildQueries(mainTitle) {
    return [
      `${mainTitle} soundtrack`,
      `${mainTitle} ost`,
      `${mainTitle} original soundtrack`,
      `${mainTitle} motion picture soundtrack`,
      `${mainTitle} music`,
      mainTitle // Csak a cím is
    ];
  }


  scoreAlbum(albumName, movieTitle) {
    // JAVÍTÁS 3: Szigorúbb pontozás a pontos címért (pl. "Your Name" vs "Call Me By Your Name")
    const nameNorm = this.prepareTitle(albumName);
    const titleNorm = this.prepareTitle(movieTitle);
    const titleWords = titleNorm.split(' ').filter(w => w.length > 2);
    
    let score = 0;

    // 1. AZONNALI ÉS NAGY BÓNUSZ A CÍM EGYEZÉSÉRT
    // Ez biztosítja, hogy a teljes "your name" szókapcsolat megtalálása magasabb pontot érjen,
    // mint a "Call Me By Your Name" véletlen találatai.
    if (nameNorm.includes(titleNorm)) {
        score += 200; // Nagyobb alappont
        // Bónusz a szinte pontos egyezésért
        if (nameNorm.startsWith(titleNorm)) score += 50; 
    } else {
        // Ha a teljes cím nem szerepel, akkor a szavak egyezése csak alacsony pontot ér
        titleWords.forEach(word => {
            if (nameNorm.includes(word)) score += 10;
        });
    }

    // 2. ZSANER BÓNUSZOK
    // OST/Soundtrack bónusz +30
    if (/\b(ost|soundtrack)\b/i.test(nameNorm)) score += 30;

    // Original + OST bónusz +15
    if (/original/i.test(nameNorm) && /(ost|soundtrack)/i.test(nameNorm)) score += 15;

    // Motion picture +10
    if (/motion picture/i.test(nameNorm)) score += 10;

    // 3. BÜNTETÉS A NEM EGYEZŐ ALACSONY PONTOZÁSÚ TALÁLATOKÉRT
    // Ha a kulcsszavak egyike sem szerepel, büntetünk
    if (titleWords.length > 0 && !titleWords.some(w => nameNorm.includes(w))) {
        score -= 50;
    }

    return score;
  }


  async searchSoundtrackPlaylists(movieTitle) {
    console.log('searchSoundtrackPlaylists called with:', movieTitle);
    const token = await this.getSpotifyAccessToken();
    const mainTitle = typeof movieTitle === 'object' && movieTitle.original_title
      ? this.prepareTitle(movieTitle.original_title)
      : this.prepareTitle(movieTitle);

    const alternativeTitles = this.getAlternativeTitles(mainTitle);
    let allQueries = this.buildQueries(mainTitle);
    for (const altTitle of alternativeTitles) allQueries.push(...this.buildQueries(altTitle));
    console.log('All queries:', allQueries);

    let allAlbums = [];
    let allPlaylists = [];

    // Keresések futtatása
    for (const query of allQueries) {
      const albumResults = await this.spotifySearch('album', query, token);
      allAlbums.push(...albumResults);

      const playlistResults = await this.spotifySearch('playlist', query, token);
      allPlaylists.push(...playlistResults);
    }
    console.log(`Total albums found: ${allAlbums.length}, Total playlists found: ${allPlaylists.length}`);

    // 1. Gyűjtsük össze az összes potenciális albumot és playlistet
    const candidates = [
      // JAVÍTÁS: Szűrjük ki a 'null' vagy 'id' nélküli elemeket, mielőtt map-elnénk
      ...allAlbums.filter(a => a && a.id) 
                  .map(a => ({ ...this.albumToReturn(a), type: 'album' })),
      // JAVÍTÁS: Ugyanez a playlistekre
      ...allPlaylists.filter(p => p && p.id)
                    .map(p => ({ ...this.playlistToReturn(p), type: 'playlist' }))
    ];

    // 2. Szűrjük ki az egyedieket ID alapján
    const uniqueCandidates = Array.from(new Map(candidates.map(c => [c.id, c])).values());

    // 3. Pontozzuk mindet a meglévő scoreAlbum függvénnyel
    const scoredCandidates = uniqueCandidates.map(c => ({
      ...c,
      score: this.scoreAlbum(c.name, mainTitle) 
    }));

    // 4. Sorba rendezés a pontszám alapján, csökkenő sorrendben
    const sortedCandidates = scoredCandidates.sort((a, b) => b.score - a.score);

    // 5. A legjobb találat
    const bestResult = sortedCandidates[0] || null;

    console.log(`Best candidate: ${bestResult?.name} (Score: ${bestResult?.score})`);

    // 6. Ellenőrzés, hogy van-e egyáltalán találat
    if (!bestResult) {
        console.log('No suitable candidate found.');
        return []; // Üres tömböt adunk vissza, ha nincs találat
    }

    // 7. A getMovieSoundtrack [results[0]]-t használ, ezért egy tömböt adunk vissza
    return [bestResult];
  }

  // Spotify keresés

  async spotifySearch(type, query, token) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', { // Feltételezett helyőrző URL
        params: { q: query, type, limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });
      // Biztosítjuk, hogy a lista sose legyen 'null', és az elemek is szűrve legyenek
      const items = type === 'track' ? response.data.tracks?.items : type === 'album' ? response.data.albums?.items : response.data.playlists?.items;
      return (items || []).filter(item => item); // Extra szűrés 'null' elemekre
    } catch (err) {
      console.error(`Spotify search error (${type}):`, err.message);
      return [];
    }
  }

  //Compilation album kivonat track-ekből
  // (Ez a függvény most nincs használatban a javított logikában)

  extractCompilationAlbums(tracks) {
    const seen = new Set();
    const compilationAlbums = [];
    tracks.forEach(track => {
      const album = track.album;
      if (album?.album_type === 'compilation' && album.id && !seen.has(album.id)) {
        compilationAlbums.push({ id: album.id, name: album.name, external_urls: album.external_urls, isAlbum: true, album });
        seen.add(album.id);
      }
    });
    return compilationAlbums;
  }

  // Album/playlist objektum visszaalakítása
  albumToReturn(a) {
    return {
      id: a.id,
      name: a.name,
      external_urls: a.external_urls,
      isAlbum: true,
      album: a 
    };
  }

  playlistToReturn(p) {
    return {
      id: p.id,
      name: p.name,
      external_urls: p.external_urls,
      isAlbum: false,
      playlist: p
    };
  }

  // Track lista lekérése
  async getPlaylistTracks(id, isAlbum = false, albumData = null) {
    const token = await this.getSpotifyAccessToken();
    let albumInfo = albumData;

    try {
        if (isAlbum && (!albumInfo || !albumInfo.tracks)) { 
          const response = await axios.get(`https://api.spotify.com/v1/albums/${id}`, { headers: { Authorization: `Bearer ${token}` } }); // Feltételezett helyőrző URL
          albumInfo = response.data;
        }

        const endpoint = isAlbum ? `https://api.spotify.com/v1/albums/${id}/tracks` : `https://api.spotify.com/v1/playlists/${id}/tracks`; // Feltételezett helyőrző URL-ek
        const response = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        const items = response.data.items;

        return items.filter(item => (isAlbum ? item : item.track) && (isAlbum ? true : item.track.id) )
            .map(item => {
          const track = isAlbum ? item : item.track;
          const albumObj = isAlbum ? albumInfo : track.album; 

          return {
            id: track.id,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: albumObj?.name || null,
            year: albumObj?.release_date ? new Date(albumObj.release_date).getFullYear() : null,
            spotifyUrl: track.external_urls?.spotify || null,
            previewUrl: track.preview_url || null, 
            albumCover: albumObj?.images?.[0]?.url || null,
            duration: track.duration_ms,
          };
        });
    } catch (err) {
        console.error(`Failed to get tracks for ID ${id} (isAlbum: ${isAlbum}):`, err.message);
        return []; // Hiba esetén üres tömb
    }
  }

    // API endpoint
    async getMovieSoundtrack(req, res) {
        try {
            const { movieTitle } = req.params;
            const { originalTitle, englishTitle, movieYear } = req.query;

            // Build candidate search titles in priority. Prefer originalTitle only if it normalizes
            // to a usable (Latin/ASCII) string; otherwise try movieTitle/englishTitle first
            // and keep the original as a fallback. This avoids empty/invalid Spotify queries
            // for non-Latin originals (e.g. Japanese titles like 君の名は。).
            const rawCandidates = [];
            if (originalTitle && originalTitle.trim() !== '') rawCandidates.push(originalTitle.trim());
            if (movieTitle && movieTitle.trim() !== '') rawCandidates.push(movieTitle.trim());
            if (englishTitle && englishTitle.trim() !== '') rawCandidates.push(englishTitle.trim());

            const candidates = [];
            // Determine if originalTitle is usable after normalization
            let originalWasDeprioritized = false;
            if (originalTitle && originalTitle.trim() !== '') {
                const prep = this.prepareTitle(originalTitle);
                if (prep && /[a-z0-9]/i.test(prep)) {
                    candidates.push(originalTitle.trim());
                } else {
                    console.log('Original title normalizes to non-Latin/empty string — deprioritizing original title for initial search.');
                    originalWasDeprioritized = true;
                }
            }

            if (movieTitle && movieTitle.trim() !== '' && !candidates.includes(movieTitle.trim())) candidates.push(movieTitle.trim());
            if (englishTitle && englishTitle.trim() !== '' && !candidates.includes(englishTitle.trim())) candidates.push(englishTitle.trim());

            // If original was deprioritized earlier, attempt transliteration (Romaji) as a better fallback
            if (originalWasDeprioritized && originalTitle && originalTitle.trim() !== '') {
                try {
                    const translit = transliterate(originalTitle.trim());
                    const translitPrep = this.prepareTitle(translit);
                    if (translitPrep && /[a-z0-9]/i.test(translitPrep) && !candidates.includes(translit)) {
                        console.log('Trying transliterated original title as candidate:', translit);
                        candidates.push(translit);
                    }
                } catch (e) {
                    console.warn('Transliteration failed, will fall back to original title as last resort:', e.message);
                }

                if (!candidates.includes(originalTitle.trim())) {
                    candidates.push(originalTitle.trim());
                }
            }

            if (candidates.length === 0) {
                return res.status(400).json({ success: false, message: 'originalTitle query param or :movieTitle path param is required' });
            }

            let results = [];
            let usedCandidate = null;
            // Try candidates in order until we find results
            for (const cand of candidates) {
                console.log('Trying soundtrack search with candidate:', cand);
                results = await this.searchSoundtrackPlaylists(cand);
                if (results && results.length > 0) {
                    usedCandidate = cand;
                    break;
                }
            }

            if (!usedCandidate) {
                console.error('No valid results found for any candidate titles.');
                return res.status(404).json({
                    success: false,
                    message: `No soundtrack found for provided titles`,
                    data: []
                });
            }

            const best = results[0];
            console.log('Best result selected (from candidate', usedCandidate + '):', best.name, `(isAlbum: ${best.isAlbum})`);

            let tracks = await this.getPlaylistTracks(best.id, best.isAlbum, best.isAlbum ? best.album : null);
            console.log('Tracks fetched for best result:', tracks.length);

            if (movieYear && tracks.length > 0) {
                const y = parseInt(movieYear);
                const originalTrackCount = tracks.length;
                tracks = tracks.filter(t => !t.year || t.year <= y);
                console.log(`Tracks filtered by movie year (${y}): ${tracks.length} / ${originalTrackCount}`);
            }

            if (movieYear && tracks.length === 0) {
                console.log('No tracks passed the movie year filter. Falling back to the first three results (pre-filter).');
                const originalTracks = await this.getPlaylistTracks(best.id, best.isAlbum, best.isAlbum ? best.album : null);
                tracks = originalTracks.slice(0, 3);
                console.log('Fallback tracks:', tracks.length);
            }

            if (tracks.length === 0) {
                console.warn(`No tracks found for ID ${best.id}. Returning 404.`);
                return res.status(404).json({
                    success: false,
                    message: `Found playlist "${best.name}", but failed to fetch tracks.`,
                    data: []
                });
            }

            // Return a stable shape expected by frontend
            return res.json({
                success: true,
                data: {
                    description: `Soundtrack from Spotify: ${best.name}`,
                    songs: tracks,
                    source: 'spotify',
                    playlistUrl: best.external_urls?.spotify || null,
                    playlistName: best.name
                }
            });
        } catch (error) {
            console.error('Soundtrack error:', error);
            return res.status(500).json({ success: false, message: 'Failed to get movie soundtrack', error: error.message });
        }
    }
}

module.exports = SoundtrackController;