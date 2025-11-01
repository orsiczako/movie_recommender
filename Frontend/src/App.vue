<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth.js'
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const { initAuth } = useAuth()
    
    // Globális favorites cache minden komponens számára
    const globalFavoritesCache = ref([])
    
    // Globális event handler minden favorites event-hez
    const handleGlobalFavoritesEvent = (event) => {
  console.log('GLOBAL FAVORITES EVENT HANDLER:', event.detail)
      
      // Broadcast-eljük az event-et minden komponensnek
      // Ez biztosítja hogy minden FavoriteMoviesView megkapja
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('global-favorites-refresh', {
          detail: event.detail
        }))
      }, 50)
    }
    
    return { 
      initAuth,
      globalFavoritesCache,
      handleGlobalFavoritesEvent
    }
  },
  mounted() {
    // Indításkor ellenőrizzük a tárolt token érvényességét
    this.initAuth()
    
    // Globális event listener regisztrálás
  console.log('Registering global favorites event listener')
    window.addEventListener('favorites-updated', this.handleGlobalFavoritesEvent)
  },
  beforeUnmount() {
    // Cleanup
    window.removeEventListener('favorites-updated', this.handleGlobalFavoritesEvent)
  }
}</script>

<style>
/* A CSS-t külön fájlba tesszük */
</style>

