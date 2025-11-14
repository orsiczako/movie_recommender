/**
 * Spotify Web API Service
 * Handles authentication and track searching for movie soundtracks
 */

class SpotifyService {
  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    this.clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
    this.accessToken = null
    this.tokenExpiresAt = null
    this.baseURL = 'https://api.spotify.com/v1'
    this.authURL = 'https://accounts.spotify.com/api/token'
    
    // Rate limiting
    this.rateLimitDelay = 100 // ms between requests
    this.lastRequestTime = 0
  }

  /**
   * Check if service is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return Boolean(this.clientId && this.clientSecret)
  }

  /**
   * Get client credentials access token for app-only authentication
   * @returns {Promise<boolean>} - Success status
   */
  async authenticate() {
    if (!this.isConfigured()) {
      console.error('Spotify service not configured - missing client credentials')
      return false
    }

    // Check if token is still valid
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return true
    }

    try {
      const credentials = btoa(`${this.clientId}:${this.clientSecret}`)
      
      const response = await fetch(this.authURL, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        throw new Error(`Spotify authentication failed: ${response.status}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000 // 1 minute buffer
      
      console.log('Spotify authentication successful')
      return true
    } catch (error) {
      console.error('Spotify authentication error:', error)
      return false
    }
  }

  /**
   * Wait for rate limiting
   */
  async handleRateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await this.delay(this.rateLimitDelay - timeSinceLastRequest)
    }
    
    this.lastRequestTime = Date.now()
  }

  /**
   * Search for tracks on Spotify
   * @param {string} query - Search query
   * @param {number} limit - Max results (default: 1)
   * @returns {Promise<Object>} - Search results
   */
  async searchTracks(query, limit = 1) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Spotify service not configured',
        tracks: []
      }
    }

    // Ensure we have a valid token
    const authenticated = await this.authenticate()
    if (!authenticated) {
      return {
        success: false,
        error: 'Failed to authenticate with Spotify',
        tracks: []
      }
    }

    await this.handleRateLimit()

    try {
      const searchParams = new URLSearchParams({
        q: query,
        type: 'track',
        limit: limit.toString(),
        market: 'US' // For preview URLs
      })

      const response = await fetch(`${this.baseURL}/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 429) {
        // Rate limited - wait and retry once
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1') * 1000
        console.log(`Rate limited, waiting ${retryAfter}ms`)
        await this.delay(retryAfter)
        return this.searchTracks(query, limit) // Retry once
      }

      if (!response.ok) {
        throw new Error(`Spotify search failed: ${response.status}`)
      }

      const data = await response.json()
      
      const tracks = data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        releaseDate: track.album?.release_date || null,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls?.spotify,
        image: track.album?.images?.[0]?.url || null,
        popularity: track.popularity || 0
      }))

      return {
        success: true,
        tracks,
        total: data.tracks.total
      }
    } catch (error) {
      console.error('Spotify search error:', error)
      return {
        success: false,
        error: error.message,
        tracks: []
      }
    }
  }

  /**
   * Search for a specific song by title and artist
   * @param {string} songTitle - Song title
   * @param {string} artist - Artist name (optional)
   * @returns {Promise<Object>} - Track information or null
   */
  async searchTrack(songTitle, artist = '') {
    if (!songTitle) {
      return {
        success: false,
        error: 'Song title is required',
        track: null
      }
    }

    // Build search query
    let query = `track:"${songTitle}"`
    if (artist && artist !== 'Unknown Artist') {
      query += ` artist:"${artist}"`
    }

    const result = await this.searchTracks(query, 1)
    
    if (result.success && result.tracks.length > 0) {
      return {
        success: true,
        track: result.tracks[0]
      }
    } else {
      // Fallback: try simpler search without quotes
      const fallbackQuery = artist && artist !== 'Unknown Artist' 
        ? `${songTitle} ${artist}` 
        : songTitle
      
      const fallbackResult = await this.searchTracks(fallbackQuery, 1)
      
      return {
        success: fallbackResult.success,
        track: fallbackResult.tracks[0] || null,
        error: fallbackResult.error
      }
    }
  }

  /**
   * Search for multiple songs from a soundtrack
   * @param {Array} songs - Array of {title, artist} objects
   * @returns {Promise<Array>} - Array of track results
   */
  async searchSoundtrackTracks(songs) {
    if (!Array.isArray(songs) || songs.length === 0) {
      return []
    }

    const results = []
    
    for (const song of songs) {
      try {
        const result = await this.searchTrack(song.title, song.artist)
        results.push({
          originalSong: song,
          spotifyTrack: result.track,
          success: result.success,
          error: result.error
        })
        
        // Small delay between searches to be respectful
        if (songs.indexOf(song) < songs.length - 1) {
          await this.delay(this.rateLimitDelay)
        }
      } catch (error) {
        console.error(`Error searching for ${song.title}:`, error)
        results.push({
          originalSong: song,
          spotifyTrack: null,
          success: false,
          error: error.message
        })
      }
    }

    return results
  }

  /**
   * Get track details by Spotify ID
   * @param {string} trackId - Spotify track ID
   * @returns {Promise<Object>} - Track details
   */
  async getTrack(trackId) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Spotify service not configured'
      }
    }

    const authenticated = await this.authenticate()
    if (!authenticated) {
      return {
        success: false,
        error: 'Failed to authenticate with Spotify'
      }
    }

    await this.handleRateLimit()

    try {
      const response = await fetch(`${this.baseURL}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get track: ${response.status}`)
      }

      const track = await response.json()
      
      return {
        success: true,
        track: {
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown Artist',
          album: track.album?.name || 'Unknown Album',
          releaseDate: track.album?.release_date || null,
          duration: track.duration_ms,
          previewUrl: track.preview_url,
          spotifyUrl: track.external_urls?.spotify,
          image: track.album?.images?.[0]?.url || null,
          popularity: track.popularity || 0
        }
      }
    } catch (error) {
      console.error('Error getting track:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Format duration from milliseconds to mm:ss
   * @param {number} ms - Duration in milliseconds
   * @returns {string} - Formatted duration
   */
  formatDuration(ms) {
    if (!ms) return '0:00'
    
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  /**
   * Utility function for delays
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Test the Spotify service configuration
   * @returns {Promise<Object>} - Test results
   */
  async testService() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Service not configured - missing credentials'
      }
    }

    const authenticated = await this.authenticate()
    if (!authenticated) {
      return {
        success: false,
        error: 'Authentication failed'
      }
    }

    try {
      // Test search with a well-known song
      const testResult = await this.searchTrack('Bohemian Rhapsody', 'Queen')
      return {
        success: testResult.success,
        message: testResult.success 
          ? 'Spotify service working correctly' 
          : 'Search test failed',
        error: testResult.error
      }
    } catch (error) {
      return {
        success: false,
        error: `Service test failed: ${error.message}`
      }
    }
  }
}

// Export singleton instance
export const spotifyService = new SpotifyService()
export default spotifyService