const axios = require('axios');

class SoundtrackController {
  constructor() {
    this.spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    this.spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Get Spotify access token using client credentials flow
   */
  async getSpotifyAccessToken() {
    // Return cached token if still valid
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
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      console.error('Spotify authentication error:', error.message);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  /**
   * Search for movie soundtrack albums on Spotify (ALBUMS FIRST STRATEGY)
   */
  async searchSoundtrackPlaylists(movieTitle) {
    try {
      const token = await this.getSpotifyAccessToken();
      
      
      
      const albumQueries = [
        `${movieTitle} OST`,                    // Most common format
        `${movieTitle} soundtrack`,             // Alternative format
        `${movieTitle} original soundtrack`,    // Full official name
        `${movieTitle} original motion picture` // Complete official format
      ];
      
      let allAlbums = [];
      
      for (const query of albumQueries) {
        const response = await axios.get('https://api.spotify.com/v1/search', {
          params: {
            q: query,
            type: 'album',
            limit: 5,
            market: 'US'  // US market for official releases
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.albums && response.data.albums.items.length > 0) {
          const validAlbums = response.data.albums.items.filter(item => item !== null && item.id);
          
          allAlbums.push(...validAlbums);
        }
      }
      
      // Remove duplicate albums
      const uniqueAlbums = Array.from(
        new Map(allAlbums.map(a => [a.id, a])).values()
      );
      
      
      
      // Helper to normalize strings for matching (moved up so playlists can reuse)
      function normalize(str) {
        return String(str || '').toLowerCase().replace(/[^a-z0-9]/gi, '').trim();
      }

      // Create a "base" title by removing sequel tokens, roman numerals, years and subtitles
      function makeBaseTitle(title) {
        if (!title) return '';
        let t = String(title);
        // Remove parentheses content like (2016) or (Extended)
        t = t.replace(/\([^)]*\)/g, '');
        // Remove subtitles after colon or dash
        t = t.replace(/[:\-–—].*$/g, '');
        // Remove trailing roman numerals or standalone digits (II, III, 2, 3)
        t = t.replace(/\b(?:ii|iii|iv|v|vi|vii|viii|ix|x|\d+)\b/gi, '');
        // Collapse whitespace
        t = t.replace(/\s+/g, ' ').trim();
        return t;
      }

      const baseTitle = makeBaseTitle(movieTitle);
      const baseTitleNorm = normalize(baseTitle);
      // Filter albums: look for official soundtracks
      const filteredAlbums = uniqueAlbums.filter(album => {
        const nameNorm = normalize(album.name);
        const titleNorm = normalize(movieTitle);
        // Must contain soundtrack keywords (including "album" for compilations)
        const containsSoundtrackKeyword = nameNorm.includes('soundtrack') || 
                                          nameNorm.includes('ost') || 
                                          nameNorm.includes('originalmotionpicture') ||
                                          nameNorm.includes('score') ||
                                          (nameNorm.includes('album') && nameNorm.includes(':'));
        // Must contain movie title (anywhere in name, normalized)
        const containsTitle = nameNorm.includes(titleNorm) || (baseTitleNorm && nameNorm.includes(baseTitleNorm));
        // Accept any album_type (album, single, compilation, etc.) if both title and keyword match
        if (containsTitle && containsSoundtrackKeyword) {
          
          return true;
        }
        // Special case: if album name exactly matches movie title and it's an album type
        const isOfficialAlbum = album.album_type === 'album';
        const isExactTitleMatch = nameNorm === titleNorm;
        if (isExactTitleMatch && isOfficialAlbum) {
          
          return true;
        }
        
        return false;
      });
      
      
      
      // If we found good albums, return them (ALWAYS prefer albums over playlists)
      if (filteredAlbums.length > 0) {
        // Sort by relevance
        const sortedAlbums = filteredAlbums.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const titleLower = movieTitle.toLowerCase();
          
          // Original Motion Picture Soundtrack gets highest priority
          const aIsOriginal = aName.includes('original') && aName.includes('motion');
          const bIsOriginal = bName.includes('original') && bName.includes('motion');
          if (aIsOriginal && !bIsOriginal) return -1;
          if (!aIsOriginal && bIsOriginal) return 1;
          
          // OST keyword gets second priority
          const aHasOST = aName.includes('ost');
          const bHasOST = bName.includes('ost');
          if (aHasOST && !bHasOST) return -1;
          if (!aHasOST && bHasOST) return 1;
          
          // Shorter name = more specific
          return aName.length - bName.length;
        }).map(album => ({
          id: album.id,
          name: album.name,
          external_urls: album.external_urls,
          isAlbum: true,
          album: album
        }));
        
        
        // If less than 5 albums, also search playlists and merge results
        if (sortedAlbums.length < 5) {
        
          
          
          const playlistQueries = [
            `${movieTitle} soundtrack`,
            `${movieTitle} OST`,
            `${movieTitle} original score`
          ];
          
          let allPlaylists = [];
          
          for (const query of playlistQueries) {
            const response = await axios.get('https://api.spotify.com/v1/search', {
              params: {
                q: query,
                type: 'playlist',
                limit: 5,
                market: 'US'
              },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.data.playlists && response.data.playlists.items.length > 0) {
              const validPlaylists = response.data.playlists.items.filter(item => item !== null && item.id);
              // ...existing code...
              allPlaylists.push(...validPlaylists);
            }
          }
          
          // Remove duplicates
          const uniquePlaylists = Array.from(
            new Map(allPlaylists.map(p => [p.id, p])).values()
          );
          
          // ...existing code...
          
          // Filter playlists with extra verification: require title/baseTitle or description keywords,
          // and sample first tracks to ensure the playlist contains soundtrack-related items.
          const filteredPlaylists = [];
          for (const playlist of uniquePlaylists) {
            const nameLower = (playlist.name || '').toLowerCase();
            const descLower = (playlist.description || '').toLowerCase();
            const titleLower = (movieTitle || '').toLowerCase();
            const baseLower = (baseTitle || '').toLowerCase();

            // Basic name/description check: must include movie title/base title or explicit soundtrack keyword
            const hasTitleInName = nameLower.includes(titleLower) || (baseLower && nameLower.includes(baseLower));
            const hasKeyword = nameLower.includes('soundtrack') || nameLower.includes('ost') || nameLower.includes('score') || descLower.includes('soundtrack') || descLower.includes('ost') || descLower.includes('score');
            if (!hasTitleInName && !hasKeyword) {
              // ...existing code...
              continue;
            }

            // Check track count (3-150 is reasonable for soundtracks)
            const trackCount = playlist.tracks?.total || 0;
            if (trackCount < 3 || trackCount > 150) {
              // ...existing code...
              continue;
            }

            // Verify by sampling first up to 10 tracks from the playlist to ensure relevance
            try {
              const sampleResp = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
                params: { limit: 10 },
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const items = sampleResp.data.items || [];
              let matchCount = 0;
              for (const it of items) {
                const tr = it.track;
                if (!tr) continue;
                const trName = (tr.name || '').toLowerCase();
                const albumName = (tr.album?.name || '').toLowerCase();
                if (trName.includes(titleLower) || trName.includes(baseLower) || albumName.includes(titleLower) || albumName.includes(baseLower) || trName.includes('soundtrack') || albumName.includes('soundtrack') || trName.includes('ost') || albumName.includes('ost') || trName.includes('score') || albumName.includes('score')) {
                  matchCount++;
                }
              }
              const matchPercent = items.length ? (matchCount / items.length) : 0;
              if (matchCount < 2 && matchPercent < 0.2) {
                // ...existing code...
                continue;
              }
            } catch (e) {
              // ...existing code...
              // If we can't verify, fall back to permissive acceptance (but only if name/description looked good)
            }

            
            filteredPlaylists.push(playlist);
          }

          // ...existing code...

          if (filteredPlaylists.length > 0) {
            // Sort playlists
            const sortedPlaylists = filteredPlaylists.sort((a, b) => {
              const aName = a.name.toLowerCase();
              const bName = b.name.toLowerCase();
              
              // OST/soundtrack keyword priority
              const aHasKeyword = aName.includes('ost') || aName.includes('soundtrack');
              const bHasKeyword = bName.includes('ost') || bName.includes('soundtrack');
              if (aHasKeyword && !bHasKeyword) return -1;
              if (!aHasKeyword && bHasKeyword) return 1;
              
              // Shorter = more specific
              return aName.length - bName.length;
            });
            
            
            // Merge albums and playlists, giving priority to albums
            const mergedResults = [
              ...sortedAlbums,
              ...sortedPlaylists.filter(playlist => !sortedAlbums.find(album => album.id === playlist.id))
            ];
            
            return mergedResults.slice(0, 5);
          }
        }
        
        return sortedAlbums.slice(0, 5);
      }
      
    
      console.log('\n--- STEP 2: No albums found, searching PLAYLISTS as fallback ---');
      
      const playlistQueries = [
        `${movieTitle} soundtrack`,
        `${movieTitle} OST`,
        `${movieTitle} original score`
      ];
      
      let allPlaylists = [];
      
      for (const query of playlistQueries) {
        const response = await axios.get('https://api.spotify.com/v1/search', {
          params: {
            q: query,
            type: 'playlist',
            limit: 5,
            market: 'US'
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.playlists && response.data.playlists.items.length > 0) {
          const validPlaylists = response.data.playlists.items.filter(item => item !== null && item.id);
                
          allPlaylists.push(...validPlaylists);
        }
      }
      
      // Remove duplicates
      const uniquePlaylists = Array.from(
        new Map(allPlaylists.map(p => [p.id, p])).values()
      );
      
              
      
      // Filter playlists with extra verification: require title/baseTitle or description keywords,
      // and sample first tracks to ensure the playlist contains soundtrack-related items.
      const filteredPlaylists = [];
      for (const playlist of uniquePlaylists) {
        const nameLower = (playlist.name || '').toLowerCase();
        const descLower = (playlist.description || '').toLowerCase();
        const titleLower = (movieTitle || '').toLowerCase();
        const baseLower = (baseTitle || '').toLowerCase();

        // Basic name/description check: must include movie title/base title or explicit soundtrack keyword
        const hasTitleInName = nameLower.includes(titleLower) || (baseLower && nameLower.includes(baseLower));
        const hasKeyword = nameLower.includes('soundtrack') || nameLower.includes('ost') || nameLower.includes('score') || descLower.includes('soundtrack') || descLower.includes('ost') || descLower.includes('score');
        if (!hasTitleInName && !hasKeyword) {
          // ...existing code...
          continue;
        }

        // Check track count (3-150 is reasonable for soundtracks)
        const trackCount = playlist.tracks?.total || 0;
        if (trackCount < 3 || trackCount > 150) {
          // ...existing code...
          continue;
        }

        // Verify by sampling first up to 10 tracks from the playlist to ensure relevance
        try {
          const sampleResp = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
            params: { limit: 10 },
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const items = sampleResp.data.items || [];
          let matchCount = 0;
          for (const it of items) {
            const tr = it.track;
            if (!tr) continue;
            const trName = (tr.name || '').toLowerCase();
            const albumName = (tr.album?.name || '').toLowerCase();
            if (trName.includes(titleLower) || trName.includes(baseLower) || albumName.includes(titleLower) || albumName.includes(baseLower) || trName.includes('soundtrack') || albumName.includes('soundtrack') || trName.includes('ost') || albumName.includes('ost') || trName.includes('score') || albumName.includes('score')) {
              matchCount++;
            }
          }
          const matchPercent = items.length ? (matchCount / items.length) : 0;
          if (matchCount < 2 && matchPercent < 0.2) {
            
            continue;
          }
        } catch (e) {
          
          // If we can't verify, fall back to permissive acceptance (but only if name/description looked good)
        }

            
        filteredPlaylists.push(playlist);
      }

      

      if (filteredPlaylists.length > 0) {
        // Sort playlists
        const sortedPlaylists = filteredPlaylists.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          // OST/soundtrack keyword priority
          const aHasKeyword = aName.includes('ost') || aName.includes('soundtrack');
          const bHasKeyword = bName.includes('ost') || bName.includes('soundtrack');
          if (aHasKeyword && !bHasKeyword) return -1;
          if (!aHasKeyword && bHasKeyword) return 1;
          
          // Shorter = more specific
          return aName.length - bName.length;
        });
        
        // ...existing code...
        return sortedPlaylists.slice(0, 5);
      }
      
      // No results found
      
      return [];
    } catch (error) {
        
      throw new Error('Failed to search for playlists');
    }
  }

  /**
   * Get tracks from a Spotify playlist or album
   */
  async getPlaylistTracks(playlistId, isAlbum = false, albumData = null) {
    try {
      const token = await this.getSpotifyAccessToken();
      
      // If it's an album, we need to get the album details first for the cover image
      let albumInfo = albumData;
      if (isAlbum && !albumInfo) {
        const albumResponse = await axios.get(`https://api.spotify.com/v1/albums/${playlistId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        albumInfo = albumResponse.data;
      }
      
      // Use different endpoint for albums vs playlists
      const endpoint = isAlbum 
        ? `https://api.spotify.com/v1/albums/${playlistId}/tracks`
        : `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Parse and format tracks
      const items = response.data.items;
      
      const tracks = items
        .filter(item => isAlbum ? item : item.track) // Filter out null tracks
        .map(item => {
          const track = isAlbum ? item : item.track;
          
          // For albums, use the album info we fetched
          if (isAlbum && albumInfo) {
            return {
              title: track.name,
              artist: track.artists.map(a => a.name).join(', '),
              album: albumInfo.name,
              year: albumInfo.release_date ? new Date(albumInfo.release_date).getFullYear() : null,
              spotifyUrl: track.external_urls?.spotify || null,
              previewUrl: track.preview_url || null,
              albumCover: albumInfo.images?.[0]?.url || null,
              duration: track.duration_ms
            };
          }
          
          // For playlists, use the track's album info
          return {
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album?.name || null,
            year: track.album?.release_date ? new Date(track.album.release_date).getFullYear() : null,
            spotifyUrl: track.external_urls?.spotify || null,
            previewUrl: track.preview_url || null,
            albumCover: track.album?.images?.[0]?.url || null,
            duration: track.duration_ms
          };
        });

      return tracks;
    } catch (error) {
      
      throw new Error('Failed to get tracks');
    }
  }

  /**
   * GET /api/soundtrack/:movieTitle
   * Get soundtrack for a movie from Spotify
   */
  async getMovieSoundtrack(req, res) {
    try {
      const { movieTitle } = req.params;
      const { movieYear } = req.query; // Optional: to filter songs by year

      if (!movieTitle) {
        return res.status(400).json({
          success: false,
          message: 'Movie title is required'
        });
      }

      // Search for playlists
      const playlists = await this.searchSoundtrackPlaylists(movieTitle);

      if (!playlists || playlists.length === 0) {
        return res.json({
          success: true,
          data: {
            description: `No official soundtrack playlist found for "${movieTitle}"`,
            songs: [],
            source: 'spotify'
          }
        });
      }

      // Get the first (most relevant) playlist or album
      const bestPlaylist = playlists[0];
      
      // Get tracks from the playlist or album (pass album data if available)
      let tracks = await this.getPlaylistTracks(
        bestPlaylist.id, 
        bestPlaylist.isAlbum,
        bestPlaylist.album
      );

      // Filter by year if provided
      if (movieYear) {
        const maxYear = parseInt(movieYear);
        tracks = tracks.filter(track => {
          if (!track.year) return true; // Keep tracks without year info
          return track.year <= maxYear;
        });
      }

      // Show all tracks (no limit) - display everything available
      // tracks = tracks.slice(0, 50); // Optional: limit to 50 if too many

      return res.json({
        success: true,
        data: {
          description: `Soundtrack from Spotify playlist: ${bestPlaylist.name}`,
          songs: tracks,
          source: 'spotify',
          playlistUrl: bestPlaylist.external_urls?.spotify || null,
          playlistName: bestPlaylist.name
        }
      });

    } catch (error) {
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get movie soundtrack',
        error: error.message
      });
    }
  }
}

module.exports = SoundtrackController;
