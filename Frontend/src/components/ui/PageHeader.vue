<template>
  <header class="page-header">
    <!-- Bal felső sarok - Vissza gomb -->
    <div class="header-left">
      <button @click="goBack" class="back-button">
        <span class="back-icon">←</span>
        {{ $t('common.back') }}
      </button>
    </div>

    <!-- Jobb felső sarok - Témaváltó -->
    <div class="header-right">
      <ThemeSwitcher />
    </div>
  </header>
</template>

<script>
import ThemeSwitcher from '@/components/ui/ThemeSwitcher.vue'

export default {
  name: 'PageHeader',
  components: {
    ThemeSwitcher
  },
  props: {
    backRoute: {
      type: String,
      default: '/dashboard'
    }
  },
  methods: {
    goBack() {
      this.$router.push(this.backRoute)
    }
  }
}
</script>

<style scoped>
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--header-bg);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: var(--shadow-md);
}

.header-left {
  display: flex;
  align-items: center;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.back-button:hover {
  background: var(--bg-accent);
  border-color: var(--border-accent);
  transform: translateX(-2px);
}

.back-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1001;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 0 10px;
    height: 55px;
  }
  
  .back-button {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}
</style>
