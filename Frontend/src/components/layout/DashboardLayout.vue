<template>
  <div class="dashboard-layout">
    <!-- Animált háttér -->
    <AnimatedBackground />

    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <button v-if="showBackButton" @click="goBack" class="back-button">
          <i class="icon-back"></i>
          {{ $t('common.back') }}
        </button>
        <h1 v-if="title" class="page-title">{{ title }}</h1>
      </div>

      <div class="header-right">
        <slot name="header-right">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </slot>
      </div>
    </header>

    <!-- Main content -->
    <main class="main-content">
      <div class="content-container">
        <slot></slot>
      </div>
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AnimatedBackground from '../ui/AnimatedBackground.vue'
import LanguageSwitcher from '../ui/LanguageSwitcher.vue'
import ThemeSwitcher from '../ui/ThemeSwitcher.vue'
import AppFooter from '../ui/AppFooter.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: false
  },
  backRoute: {
    type: String,
    default: '/dashboard'
  }
})

const router = useRouter()

function goBack() {
  if (props.backRoute) {
    router.push(props.backRoute)
  } else {
    router.back()
  }
}
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: var(--bg-primary);
  position: relative;
}

/* Header */
.dashboard-header {
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
  gap: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid var(--border-secondary);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.back-button:hover {
  background: var(--bg-accent);
  border-color: var(--primary);
  color: var(--primary);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Icons */
.icon-back::before { content: "←"; }

/* Main content */
.main-content {
  margin-top: 60px;
  padding: 30px 20px 80px 20px;
  position: relative;
  z-index: 10;
  min-height: calc(100vh - 140px);
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 0 15px;
    height: 55px;
  }
  
  .header-left {
    gap: 10px;
  }

  .page-title {
    font-size: 1.2rem;
  }

  .main-content {
    margin-top: 55px;
    padding: 20px 15px 70px 15px;
  }

  .back-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .header-left {
    gap: 8px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .header-right {
    gap: 8px;
  }
}
</style>
