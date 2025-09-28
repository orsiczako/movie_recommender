<template>
  <div class="dashboard">
    <!-- Animált háttér -->
    <AnimatedBackground />

    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <button @click="toggleSidebar" class="menu-btn">
          <div class="hamburger">
            <span></span><span></span><span></span>
          </div>
        </button>
        <div class="profile-section">
          <div class="profile-icon" @click="openProfileSettings">
            <img :src="profileImage" :alt="$t('dashboard.profile')" class="profile-image" />
          </div>
          <span class="profile-name">{{ userName }}</span>
        </div>
      </div>
      <div class="header-right">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <nav class="sidebar-nav">
        <ul>
          <li><a href="#" @click="navigateTo('dashboard')" class="nav-item active">
            {{ $t('dashboard.menu.dashboard') }}
          </a></li>
          <li><a href="#" @click="navigateTo('profile')" class="nav-item">
            {{ $t('dashboard.menu.profile') }}
          </a></li>
          <li><a href="#" @click="navigateTo('settings')" class="nav-item">
            {{ $t('dashboard.menu.settings') }}
          </a></li>
          <li><a href="#" @click="logout" class="nav-item logout">
            {{ $t('common.logout') }}
          </a></li>
        </ul>
      </nav>
    </aside>

    <!-- Overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>

    <!-- Main content -->
    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="welcome-section">
        <h1 class="app-title">{{ $t('dashboard.welcome.title') }}</h1>
        <p class="app-description">{{ $t('dashboard.welcome.description') }}</p>
      </div>
      <div class="content-area">
        <div class="action-cards-grid">
          <router-link to="/preferences" class="action-card">
            <h3 class="action-card-title">{{ $t('dashboard.actions.preferences.title') }}</h3>
            <p class="action-card-description">{{ $t('dashboard.actions.preferences.description') }}</p>
          </router-link>
          
          <router-link to="/movies" class="action-card">
            <h3 class="action-card-title">{{ $t('dashboard.actions.browse_movies.title') }}</h3>
            <p class="action-card-description">{{ $t('dashboard.actions.browse_movies.description') }}</p>
          </router-link>

          <router-link to="/favorites" class="action-card">
            <h3 class="action-card-title">{{ $t('dashboard.actions.favorite_movies.title') }}</h3>
            <p class="action-card-description">{{ $t('dashboard.actions.favorite_movies.description') }}</p>
          </router-link>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script>
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher.vue'
import AppFooter from '@/components/ui/AppFooter.vue'
import AnimatedBackground from '@/components/ui/AnimatedBackground.vue'

export default {
  name: 'Dashboard',
  components: {
    LanguageSwitcher,
    ThemeSwitcher,
    AppFooter,
    AnimatedBackground
  },
  data() {
    return {
      sidebarOpen: false,
      userName: 'Czakó Orsolya', // Teljes név megjelenítése
      profileImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlNTA5MTQiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjciIHI9IjMiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiAxNmMwLTMuMzEzNy0yLjY4NjMtNi02LTZzLTYgMi42ODYzLTYgNiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=' // Piros Netflix színű avatar SVG
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    navigateTo(page) {
      console.log('Navigate to:', page)
      this.closeSidebar()
      
      if (page === 'profile') {
        this.$router.push('/dashboard/profile')
      } else if (page === 'dashboard') {
        this.$router.push('/dashboard')
      } else if (page === 'settings') {
        this.$router.push('/dashboard/settings')
      }
    },
    openProfileSettings() {
      this.$router.push('/dashboard/profile')
    },
    logout() {
      // Töröljük a localStorage-ből az auth adatokat
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      
      // Navigálás a login oldalra
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

/* Header - simplified */
.header {
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

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.menu-btn:hover {
  background: var(--bg-secondary);
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hamburger span {
  width: 20px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 1px;
  transition: all var(--transition-fast);
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-icon {
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--primary);
  transition: transform var(--transition-fast);
}

.profile-icon:hover {
  transform: scale(1.05);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  font-weight: 500;
  color: var(--text-primary);
}

/* Sidebar - simplified */
.sidebar {
  position: fixed;
  top: 60px;
  left: -280px;
  width: 280px;
  height: calc(100vh - 60px);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-primary);
  transition: left var(--transition-normal);
  z-index: 999;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
}

.sidebar.open {
  left: 0;
}

.sidebar-nav {
  padding: 20px 0;
}

.sidebar-nav ul {
  list-style: none;
}

.sidebar-nav li {
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  font-weight: 500;
}

.nav-item:hover {
  background: var(--bg-accent);
  color: var(--primary);
}

.theme-dark .nav-item:hover {
  background: rgba(229, 9, 20, 0.1);
  box-shadow: 0 0 15px rgba(229, 9, 20, 0.1);
  border-right: 2px solid rgba(229, 9, 20, 0.3);
}

.nav-item.active {
  background: var(--primary-light);
  color: var(--primary);
  border-right: 3px solid var(--primary);
}

.theme-dark .nav-item.active {
  background: rgba(229, 9, 20, 0.15);
  box-shadow: 0 0 20px rgba(229, 9, 20, 0.15);
}

.nav-item.logout {
  color: var(--error);
  margin-top: 20px;
  border-top: 1px solid var(--border-primary);
  padding-top: 20px;
}

.nav-item.logout:hover {
  background: rgba(229, 9, 20, 0.1);
}

.sidebar-overlay {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  z-index: 998;
}

/* Main content */
.main-content {
  margin-top: 60px;
  padding: 30px 20px 80px 20px;
  transition: margin-left var(--transition-normal);
  min-height: calc(100vh - 140px);
  position: relative;
  z-index: 10;
}

.welcome-section {
  text-align: center;
  margin-bottom: 30px;
  padding: 15px;
  position: relative;
  z-index: 20;
}

.app-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.app-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

.content-area {
  padding: 40px;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(10px);
  text-align: center;
  color: var(--text-primary);
  max-width: 800px;
  margin: 0 auto;
}

.theme-dark .content-area {
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(229, 9, 20, 0.15),
    inset 0 1px 0 rgba(229, 9, 20, 0.1);
  border: 1px solid rgba(229, 9, 20, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 0 10px;
    height: 55px;
  }
  
  .profile-name {
    display: none;
  }
  
  .main-content {
    margin-top: 55px;
    padding: 20px 15px 70px 15px;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .content-area {
    padding: 30px 20px;
  }
}

@media (min-width: 1024px) {
  .main-content.sidebar-open {
    margin-left: 280px;
  }
  
  .sidebar-overlay {
    display: none;
  }
}

/* Animation optimizations */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>

