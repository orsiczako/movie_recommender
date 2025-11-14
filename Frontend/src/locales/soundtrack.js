export default {
  hu: {
    soundtrack: {
      section: {
        title: 'Film zenéi',
        description: 'Az AI által összeállított zenelista a film leghíresebb dalaiból, Spotify integrációval.',
        loadButton: 'Zenék betöltése',
        refreshButton: 'Frissítés',
        loading: 'Zenelista készítése...',
        retry: 'Újrapróbálás',
        empty: 'Kattints a "Zenék betöltése" gombra a soundtrack megtekintéséhez.'
      },
      
      tracks: {
        foundInfo: '{count} dal találva {total}-ból',
        notFoundOnSpotify: 'Nem található Spotify-on',
        unknownArtist: 'Ismeretlen előadó',
        unknownAlbum: 'Ismeretlen album',
        playPreview: 'Előzetes lejátszása',
        stopPreview: 'Leállítás',
        openInSpotify: 'Megnyitás Spotify-ban',
        duration: 'Időtartam'
      },
      
      errors: {
        noSoundtrack: 'Nem található zenelista ehhez a filmhez',
        aiError: 'Nem sikerült lekérni a film zenéit az AI-tól',
        spotifyError: 'Spotify keresési hiba',
        networkError: 'Hálózati hiba történt',
        timeout: 'A zenelista lekérése túl sokáig tartott',
        overloaded: 'Az AI szolgáltatás túlterhelt. Próbáld újra később.',
        parseError: 'Nem sikerült feldolgozni a zenelista információkat',
        audioError: 'Hang lejátszási hiba',
        configError: 'A Spotify szolgáltatás nincs konfigurálva'
      },
      
      status: {
        searching: 'Keresés Spotify-on...',
        found: 'Megtalálva',
        notFound: 'Nem található',
        loading: 'Betöltés...',
        error: 'Hiba'
      }
    }
  },
  
  en: {
    soundtrack: {
      section: {
        title: 'Movie Soundtrack',
        description: 'AI-curated playlist of the movie\'s most famous songs with Spotify integration.',
        loadButton: 'Load Soundtrack',
        refreshButton: 'Refresh',
        loading: 'Creating soundtrack...',
        retry: 'Retry',
        empty: 'Click "Load Soundtrack" to view the movie\'s soundtrack.'
      },
      
      tracks: {
        foundInfo: 'Found {count} of {total} songs',
        notFoundOnSpotify: 'Not found on Spotify',
        unknownArtist: 'Unknown Artist',
        unknownAlbum: 'Unknown Album',
        playPreview: 'Play preview',
        stopPreview: 'Stop',
        openInSpotify: 'Open in Spotify',
        duration: 'Duration'
      },
      
      errors: {
        noSoundtrack: 'No soundtrack found for this movie',
        aiError: 'Failed to get movie soundtrack from AI',
        spotifyError: 'Spotify search error',
        networkError: 'Network error occurred',
        timeout: 'Soundtrack request timed out',
        overloaded: 'AI service is overloaded. Please try again later.',
        parseError: 'Failed to process soundtrack information',
        audioError: 'Audio playback error',
        configError: 'Spotify service not configured'
      },
      
      status: {
        searching: 'Searching on Spotify...',
        found: 'Found',
        notFound: 'Not found',
        loading: 'Loading...',
        error: 'Error'
      }
    }
  }
}