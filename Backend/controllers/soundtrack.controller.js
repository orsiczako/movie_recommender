const axios = require('axios');

// Optional transliteration
let transliterate = (s) => s;
try {
  const tmod = require('transliteration');
  transliterate = tmod.transliterate || tmod.default || tmod;
} catch (err) {
  console.warn('Optional module "transliteration" not available.');
}

class SoundtrackController {
  constructor() {
    this.spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    this.spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  async getSpotifyAccessToken() {
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }
    try {
      const credentials = Buffer.from(`${this.spotifyClientId}:${this.spotifyClientSecret}`).toString('base64');
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
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
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[&\-\.,]/g, ' ')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // Bővített alternatív címek (animék, híres filmek)
  getAlternativeTitles(title) {
    const alternatives = [];
    const cleaned = this.prepareTitle(title);

    const titleMap = {
      // Anime filmek
      'your name': ['君の名は', 'Kimi no Na wa', 'kimi no na wa'],
      'kimi no na wa': ['Your Name', 'your name'],
      'spirited away': ['千と千尋の神隠し', 'Sen to Chihiro no Kamikakushi', 'sen to chihiro'],
      'princess mononoke': ['もののけ姫', 'Mononoke Hime', 'mononoke hime'],
      'howls moving castle': ['ハウルの動く城', 'Howl no Ugoku Shiro'],
      'my neighbor totoro': ['となりのトトロ', 'Tonari no Totoro'],
      'weathering with you': ['天気の子', 'Tenki no Ko', 'tenki no ko'],
      'a silent voice': ['聲の形', 'Koe no Katachi', 'koe no katachi'],
      'grave of the fireflies': ['火垂るの墓', 'Hotaru no Haka'],
      'suzume': ['すずめの戸締まり', 'Suzume no Tojimari'],
      'belle': ['竜とそばかすの姫', 'Ryu to Sobakasu no Hime'],
      
      // Western filmek
      'the lord of the rings': ['LOTR', 'Lord of the Rings'],
      'star wars': ['Star Wars'],
      'harry potter': ['Harry Potter'],
      'pulp fiction': ['Pulp Fiction'],
      'fear and loathing in las vegas': ['Fear and Loathing in Las Vegas'],
    };

    if (titleMap[cleaned]) {
      alternatives.push(...titleMap[cleaned]);
    }

    return alternatives;
  }

  buildQueries(mainTitle) {
    const prepared = this.prepareTitle(mainTitle);
    
    // Ha üres vagy túl rövid, ne próbálkozzunk
    if (!prepared || prepared.length < 2) return [];
    
    return [
      `${mainTitle} soundtrack`,
      `${mainTitle} ost`,
      `${mainTitle} original soundtrack`,
      `${mainTitle} motion picture`,
      mainTitle
    ];
  }

  //Blacklist - kiszűri a random zenéket
  isBlacklisted(name, description = '') {
    const text = (name + ' ' + description).toLowerCase();
    const blacklist = [
      // Bollywood / Indian
      'bollywood', 'hindi', 'telugu', 'punjabi', 'tamil', 'malayalam', 'marathi', 'bengali', 'kannada',
      'aur rani', 'prem kahaani', 'ki prem', 'rani', 'aur', 'kahaani',
      
      // Random compilations
      'best of', 'greatest hits', 'collection', 'piano covers', 'lofi', 'lo-fi',
      'chill beats', 'study music', 'relaxing', 'meditation', 'sleep music',
      'remix', 'cover', 'tribute', 'karaoke', 'instrumental only',
      
      // Más nyelvek (ha nem az a cél)
      'magyar', 'hungarian', 'french', 'german', 'spanish',
      
      // Streaming / podcast
      'podcast', 'audiobook', 'audio drama', 'hangoskönyv',
    ];
    
    return blacklist.some(word => text.includes(word));
  }

  // Pontozó rendszer (szigorúbb)
  scoreAlbum(albumName, movieTitle, movieYear = null, trackCount = 0) {

    const nameNorm = this.prepareTitle(albumName);
    const titleNorm = this.prepareTitle(movieTitle);
    const titleWords = titleNorm.split(' ').filter(w => w.length > 2);
    let score = 0;

    // Franchise/part detection
    const franchiseParts = [
      'part 1', 'part 2', 'part 3', 'part i', 'part ii', 'part iii',
      'catching fire', 'mockingjay', 'new moon', 'eclipse', 'breaking dawn',
      'deathly hallows', 'goblet of fire', 'order of the phoenix', 'prisoner of azkaban',
      'chamber of secrets', 'philosopher', 'sorcerer', 'half-blood prince',
      'revenge of the sith', 'attack of the clones', 'phantom menace', 'empire strikes back', 'return of the jedi',
      'fellowship of the ring', 'two towers', 'return of the king',
      'desolation of smaug', 'battle of the five armies',
      'the last jedi', 'the force awakens', 'rise of skywalker',
      'matrix reloaded', 'matrix revolutions', 'matrix resurrections',
      'godfather part ii', 'godfather part iii',
      'back to the future part ii', 'back to the future part iii',
      'independence day resurgence', 'resurgence',
      'creed', 'creed ii', 'creed iii',
      'rocky ii', 'rocky iii', 'rocky iv', 'rocky v', 'rocky balboa',
      'fast & furious', 'tokyo drift', 'furious 7', 'fate of the furious', 'hobbs & shaw',
      'mission impossible', 'ghost protocol', 'rogue nation', 'fallout',
      'scream 2', 'scream 3', 'scream 4', 'scream 5',
      'saw ii', 'saw iii', 'saw iv', 'saw v', 'saw vi', 'saw vii',
      'final chapter', 'origins', 'legacy', 'awakening', 'evolution', 'annihilation',
      'chapter two', 'chapter 2', 'chapter one', 'chapter 1',
      'volume 2', 'volume 3', 'vol. 2', 'vol. 3',
      'pt. 1', 'pt. 2', 'pt. 3',
    ];

    // Special handling for single-word movie titles
    const isSingleWordTitle = titleNorm.split(' ').length === 1;
    const nameNormWords = nameNorm.split(' ');

    // If the searched movie title does NOT contain a part/episode, but the album name does, penalize
    const titleHasPart = franchiseParts.some(part => titleNorm.includes(part));
    const albumHasPart = franchiseParts.some(part => nameNorm.includes(part));
    if (!titleHasPart && albumHasPart) {
      score -= 400;
    }
    // If the searched movie title contains a part/episode, but the album name does NOT, penalize
    if (titleHasPart && !albumHasPart) {
      score -= 200;
    }
    // If both have a part, but the part is different, penalize
    if (titleHasPart && albumHasPart) {
      const titlePart = franchiseParts.find(part => titleNorm.includes(part));
      const albumPart = franchiseParts.find(part => nameNorm.includes(part));
      if (titlePart && albumPart && titlePart !== albumPart) {
        score -= 500;
      }
    }

    if (isSingleWordTitle) {
      // Only allow high score for exact match or "title (original soundtrack)" pattern
      const hasOst = /\b(ost|soundtrack|score|original.*soundtrack|motion.*picture)\b/i.test(albumName);
      const hasYear = movieYear && albumName.includes(String(movieYear));
      if (nameNorm === titleNorm) {
        // If it's an exact match but NOT a soundtrack/OST/score/film context, penalize heavily
        if (!hasOst && !hasYear && !/film|movie|motion picture|original/i.test(albumName)) {
          score -= 800;
        } else {
          score += 600;
        }
      } else if (/^([\w\-]+) (ost|soundtrack|original soundtrack|motion picture|score)$/i.test(nameNorm) && nameNorm.startsWith(titleNorm)) {
        score += 400;
      } else {
        // Penalize multi-word album names that don't start with the movie title
        if (nameNormWords.length > 1 && nameNormWords[0] !== titleNorm) {
          score -= 500;
        }
        // Penalize if album name contains other known movie/album names (e.g. "Rocky Horror Picture Show")
        if (nameNorm.includes('horror') || nameNorm.includes('picture show')) {
          score -= 700;
        }
      }
    } else {
      // PONTOS EGYEZÉS - legmagasabb prioritás
      if (nameNorm === titleNorm) {
        score += 500;
      } else if (nameNorm.includes(titleNorm) || titleNorm.split(' ').every(w => nameNorm.includes(w))) {
        score += 300;
      }
    }

    // OST/SOUNDTRACK kulcsszavak (KRITIKUS!)
    const hasOst = /\b(ost|soundtrack|score|original.*soundtrack|motion.*picture)\b/i.test(albumName);
    if (hasOst) {
      score += 200;
    } else {
      // Ha nincs OST kulcsszó, KOMOLY büntetés
      score -= 150;
    }

    // Szavak egyezése
    let matchedWords = 0;
    titleWords.forEach(word => {
      if (nameNorm.includes(word)) {
        matchedWords++;
        score += 20;
      }
    });

    // Ha EGYETLEN szó sem egyezik, óriási büntetés
    if (matchedWords === 0 && titleWords.length > 0) {
      score -= 500;
    }

    // Évszám egyezés
    if (movieYear) {
      const yearStr = String(movieYear);
      if (albumName.includes(yearStr)) score += 100;
    }

    //Track count büntetés (ha túl kevés)
    if (trackCount > 0 && trackCount < 3) {
      score -= 200; // Single track albumok nem soundtrackok
    }

    // Blacklist check
    if (this.isBlacklisted(albumName)) {
      score -= 1000; // Azonnal kizár
    }

    //Deluxe/Complete Edition bónusz
    if (/deluxe|complete|expanded|special edition/i.test(albumName)) {
      score += 50;
    }

    return score;
  }

  async searchSoundtrackPlaylists(movieTitle, movieYear = null) {
    
    const token = await this.getSpotifyAccessToken();
    
    // Parse title
    const mainTitle = typeof movieTitle === 'object' && movieTitle.original_title
      ? movieTitle.original_title
      : movieTitle;

    const prepared = this.prepareTitle(mainTitle);

    // Get alternatives
    const alternatives = this.getAlternativeTitles(prepared);

    // Build all search candidates
    const searchCandidates = [mainTitle, ...alternatives];
    
    // Try transliteration for non-latin
    if (!/[a-z]/i.test(prepared) && prepared.length < 3) {
      try {
        const translit = transliterate(mainTitle);
        if (translit && translit !== mainTitle) {
          searchCandidates.push(translit);
        }
      } catch (e) {
        console.warn('Transliteration failed');
      }
    }

    let allResults = [];

    // Search each candidate
    for (const candidate of searchCandidates) {
      const queries = this.buildQueries(candidate);
      
      if (queries.length === 0) {
        continue;
      }

      console.log(`\ Searching candidate: "${candidate}"`);
      
      for (const query of queries) {
        try {
          // Album search
          const albumRes = await axios.get('https://api.spotify.com/v1/search', {
            params: { q: query, type: 'album', limit: 15 },
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const albums = (albumRes.data.albums?.items || []).filter(a => a && a.id);
          if (albums.length > 0) {
            console.log(`  ✓ Albums (${query}): ${albums.length}`);
            allResults.push(...albums.map(a => ({ ...a, type: 'album', searchQuery: query })));
          }

          // Playlist search
          const playlistRes = await axios.get('https://api.spotify.com/v1/search', {
            params: { q: query, type: 'playlist', limit: 10 },
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const playlists = (playlistRes.data.playlists?.items || []).filter(p => p && p.id);
          if (playlists.length > 0) {
            console.log(`  ✓ Playlists (${query}): ${playlists.length}`);
            allResults.push(...playlists.map(p => ({ ...p, type: 'playlist', searchQuery: query })));
          }
        } catch (err) {
          console.error(`  ✗ Error (${query}):`, err.message);
        }
      }
    }

    // Remove duplicates
    const unique = Array.from(new Map(allResults.map(r => [r.id, r])).values());

    if (unique.length === 0) {
      return [];
    }

    // Score all results
    const scored = unique.map(result => {
      const trackCount = result.type === 'album' ? result.total_tracks : result.tracks?.total || 0;
      const score = this.scoreAlbum(result.name, prepared, movieYear, trackCount);
      
      return {
        id: result.id,
        name: result.name,
        external_urls: result.external_urls,
        isAlbum: result.type === 'album',
        album: result.type === 'album' ? result : null,
        playlist: result.type === 'playlist' ? result : null,
        score: score,
        trackCount: trackCount
      };
    });

    // Sort by score
    // Sort: albums first (isAlbum: true), then playlists, both by score descending
    scored.sort((a, b) => {
      if (a.isAlbum !== b.isAlbum) {
        return a.isAlbum ? -1 : 1; // albums first
      }
      return b.score - a.score;
    });

    // Log top 5
    console.log('\nTop 5 results:');
    scored.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i + 1}. "${r.name}" - Score: ${r.score} (${r.trackCount} tracks)`);
    });

    // KRITIKUS: Minimum pontszám követelmény
    const MINIMUM_SCORE = 100;
    
    if (scored[0].score < MINIMUM_SCORE) {
      return [];
    }

    return [scored[0]];
  }

  async getPlaylistTracks(id, isAlbum = false, albumData = null) {
    const token = await this.getSpotifyAccessToken();
    let albumInfo = albumData;

    try {
      if (isAlbum && !albumInfo) {
        const res = await axios.get(`https://api.spotify.com/v1/albums/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        albumInfo = res.data;
      }

      const endpoint = isAlbum 
        ? `https://api.spotify.com/v1/albums/${id}/tracks`
        : `https://api.spotify.com/v1/playlists/${id}/tracks`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const items = res.data.items;

      let filtered = items.filter(item => isAlbum ? item : item.track);

      // Extra filtering for single-word movie titles to avoid unrelated tracks
      if (albumInfo && albumInfo.name) {
        const movieTitle = this.prepareTitle(albumInfo.name.split('(')[0]); // e.g. 'Weapons'
        if (movieTitle && movieTitle.split(' ').length === 1) {
          filtered = filtered.filter(item => {
            const track = isAlbum ? item : item.track;
            const albumObj = isAlbum ? albumInfo : track.album;
            const tTitle = this.prepareTitle(track.name);
            const aTitle = this.prepareTitle(albumObj?.name || '');
            const hasOst = /\b(ost|soundtrack|score|film|movie|motion picture|original)\b/i.test(track.name) || /\b(ost|soundtrack|score|film|movie|motion picture|original)\b/i.test(albumObj?.name || '');
            const hasYear = albumObj?.release_date && albumObj.release_date.includes(String(new Date().getFullYear()));
            // Only allow if track or album title contains the movie title, or is clearly a soundtrack
            return (
              tTitle.includes(movieTitle) ||
              aTitle.includes(movieTitle) ||
              hasOst ||
              hasYear
            );
          });
        }
      }

      return filtered.map(item => {
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
      console.error(`Failed to get tracks for ${id}:`, err.message);
      return [];
    }
  }

  async getMovieSoundtrack(req, res) {
    try {
      const { movieTitle } = req.params;
      const { originalTitle, englishTitle, movieYear } = req.query;

      console.log('\n🎬 API Request:');
      console.log('  movieTitle:', movieTitle);
      console.log('  originalTitle:', originalTitle);
      console.log('  englishTitle:', englishTitle);
      console.log('  movieYear:', movieYear);

      //KRITIKUS: Build candidate titles (PRIORITY ORDER!)
      const candidates = [];
      
      // ANGOL CÍM MINDIG ELŐSZÖR (ha van és latin karaktereket tartalmaz)
      if (englishTitle && englishTitle.trim()) {
        const prepEng = this.prepareTitle(englishTitle);
        if (prepEng.length > 2 && /[a-z]/i.test(prepEng)) {
          candidates.push(englishTitle.trim());
        }
      }
      
      // URL-ben átadott cím (movieTitle) - csak ha latin és még nincs benne
      if (movieTitle && movieTitle.trim()) {
        const prepMovie = this.prepareTitle(movieTitle);
        if (prepMovie.length > 2 && /[a-z]/i.test(prepMovie) && !candidates.includes(movieTitle.trim())) {
          candidates.push(movieTitle.trim());
          console.log('  ✅ Adding movieTitle as candidate:', movieTitle.trim());
        }
      }
      
      // Eredeti cím (originalTitle) - UTOLSÓ HELYEN, még ha nem is latin
      if (originalTitle && originalTitle.trim() && !candidates.includes(originalTitle.trim())) {
        // Try transliteration first if non-latin
        const prepOrig = this.prepareTitle(originalTitle);
        if (prepOrig.length < 2 || !/[a-z]/i.test(prepOrig)) {
          // Non-latin - try transliteration
          try {
            const translit = transliterate(originalTitle.trim());
            const translitPrep = this.prepareTitle(translit);
            if (translitPrep && translitPrep.length > 2 && /[a-z]/i.test(translitPrep)) {
              candidates.push(translit);
            }
          } catch (e) {
          }
        }
        
        // Add original as last resort (even if non-latin)
        candidates.push(originalTitle.trim());
      }


      if (candidates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Movie title is required'
        });
      }

      let results = [];
      let usedCandidate = null;
      let allResults = []; // Gyűjtsd össze MINDEN candidate eredményét
      
      // Try ALL candidates and collect results
      for (const cand of candidates) {
        const candidateResults = await this.searchSoundtrackPlaylists(cand, movieYear ? parseInt(movieYear) : null);
        
        if (candidateResults && candidateResults.length > 0) {
          console.log(` Found ${candidateResults.length} result(s), score: ${candidateResults[0].score}`);
          allResults.push({
            candidate: cand,
            results: candidateResults,
            score: candidateResults[0].score
          });
        } else {
          console.log(' No results');
        }
      }

      // KRITIKUS: Válaszd a LEGMAGASABB pontszámú eredményt MINDEN candidate közül
      if (allResults.length === 0) {
        return res.json({
          success: true,
          data: {
            description: `No soundtrack found for "${candidates[0]}"`,
            songs: [],
            source: 'spotify'
          }
        });
      }

      // Rendezd pontszám szerint
      allResults.sort((a, b) => b.score - a.score);
      
      const bestCandidate = allResults[0];
      usedCandidate = bestCandidate.candidate;
      results = bestCandidate.results;

      console.log(`  Candidate: "${usedCandidate}"`);
      console.log(`  Album: "${results[0].name}"`);
      console.log(`  Score: ${results[0].score}`);

      const best = results[0];

      let tracks = await this.getPlaylistTracks(best.id, best.isAlbum, best.album);

      // Filter by year if provided
      if (movieYear && tracks.length > 0) {
        const y = parseInt(movieYear);
        const original = tracks.length;
        tracks = tracks.filter(t => !t.year || t.year <= y);
      }


      if (tracks.length === 0) {
        // Ha a találat pontszáma nagyon magas (pl. >= 500), adjuk vissza az összes tracket year filter nélkül
        if (best.score && best.score >= 500) {
          tracks = await this.getPlaylistTracks(best.id, best.isAlbum, best.album);
        }
      }

      if (tracks.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Found "${best.name}" but no tracks available`
        });
      }

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
      return res.status(500).json({
        success: false,
        message: 'Failed to get movie soundtrack',
        error: error.message
      });
    }
  }
}

module.exports = SoundtrackController;