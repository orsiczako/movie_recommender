<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="copyright">
        {{ $t('footer.copyright', { year: currentYear, name: 'Istenkirály kettes csoport' }) }}
      </p>
      <div class="footer-links">
        <span class="version">{{ $t('footer.version') }}{{ appVersion }}</span>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
    appVersion() {
      // Globális változón keresztül olvassuk a verziót
      return __APP_VERSION__ || '1.0.0'
    }
  }
}
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

