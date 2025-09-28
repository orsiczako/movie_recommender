<template>
  <div class="language-switcher">
    <span>{{ $t('nav.language_switch') }}</span>
    <button 
      v-for="lang in languages" 
      :key="lang.code"
      class="lang-btn"
      :class="{ active: currentLanguage === lang.code }"
      @click="changeLanguage(lang.code)"
    >
      {{ $t(`nav.${lang.name}`) }}
    </button>
  </div>
</template>

<script>
import { useLocale } from '@/composables/useLocale'

export default {
  name: 'LanguageSwitcher',
  setup() {
    const { currentLocale, setLocale } = useLocale()
    
    return {
      currentLocale,
      setLocale
    }
  },
  data() {
    return {
      languages: [
        { code: 'hu', name: 'hungarian' },
        { code: 'en', name: 'english' }
      ]
    }
  },
  computed: {
    currentLanguage() {
      return this.currentLocale
    }
  },
  methods: {
    changeLanguage(lang) {
      console.log('LanguageSwitcher: Changing language to:', lang)
      this.setLocale(lang)
      
      // Force reload of current page to refresh movie data
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 10px;
}

.language-switcher span {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.lang-btn {
  padding: 8px 12px;
  border: 2px solid var(--border-secondary);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 60px;
}

.lang-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.lang-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

/* Responsive design */
@media (max-width: 768px) {
  .language-switcher {
    gap: 8px;
  }
  
  .language-switcher span {
    display: none; /* Mobil nézetben elrejtjük a "Nyelv" szöveget */
  }
  
  .lang-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
    min-width: 50px;
  }
}
</style>

