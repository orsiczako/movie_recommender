<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="copyright">Property of me - v{{ appVersion }}</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

// Get app version from environment variables (set in vite.config.js)
// This is the standard and safe way to expose build-time info in Vite.
const appVersion = computed(() => import.meta.env.VITE_APP_VERSION || '1.0.0');
</script>

<style scoped>
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #e50914;
  color: white;
  z-index: 100;
  box-shadow: var(--shadow-lg);
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3px 15px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 20px;
}

.copyright {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.footer-links {
  display: flex;
  align-items: center;
}

.version {
  font-size: 0.7rem;
  opacity: 0.6;
  font-weight: 400;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 6px;
    padding: 10px 15px;
  }
  
  .copyright {
    font-size: 0.8rem;
  }
  
  .version {
    font-size: 0.6rem;
  }
}
</style>
