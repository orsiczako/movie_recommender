import { createRouter, createWebHistory } from 'vue-router'

// Auth views
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'

// Dashboard views  
import DashboardView from '@/views/dashboard/DashboardView.vue'
import ProfileView from '@/views/dashboard/ProfileView.vue'
import SettingsView from '@/views/dashboard/SettingsView.vue'
import FavoriteMoviesView from '@/views/dashboard/FavoriteMoviesView.vue'

// Movie views
import PreferencesView from '@/views/preferences/PreferencesView.vue'
import MovieBrowsingView from '@/views/movies/MovieBrowsingView.vue'

const routes = [
  // Redirect root to login
  { 
    path: '/', 
    redirect: '/login' 
  },
  
  // Direct auth routes for easier access
  { 
    path: '/login', 
    name: 'login',
    component: LoginView
  },
  { 
    path: '/register', 
    name: 'register',
    component: RegisterView
  },
  { 
    path: '/forgot-password', 
    name: 'forgot-password',
    component: ForgotPasswordView
  },
  { 
    path: '/reset-password', 
    name: 'reset-password',
    component: ResetPasswordView
  },
  
  // Auth routes (legacy support)
  {
    path: '/auth',
    children: [
      { 
        path: 'login', 
        name: 'auth-login',
        component: LoginView
      },
      { 
        path: 'register', 
        name: 'auth-register',
        component: RegisterView
      },
      { 
        path: 'forgot-password', 
        name: 'auth-forgot-password',
        component: ForgotPasswordView
      },
      { 
        path: 'reset-password', 
        name: 'auth-reset-password',
        component: ResetPasswordView
      }
    ]
  },
  
  // Dashboard routes
  {
    path: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }
      },
      { 
        path: 'profile', 
        name: 'profile',
        component: ProfileView,
        meta: { requiresAuth: true }
      },
      { 
        path: 'settings', 
        name: 'settings',
        component: SettingsView,
        meta: { requiresAuth: true }
      }
    ]
  },
  
  // Movie routes
  {
    path: '/preferences',
    name: 'preferences',
    component: PreferencesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/movies',
    name: 'movies',
    component: MovieBrowsingView,
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoriteMoviesView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Authentication guard
router.beforeEach((to) => {
  // Ellenőrizzük, hogy a route megköveteli-e a bejelentkezést
  const requiresAuth = to.meta.requiresAuth
  
  if (requiresAuth) {
    // Egyszerű token ellenőrzése
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      // Nincs token, redirect login oldalra
      return '/login'
    }
  }
  
  // Ha már be van jelentkezve és login/register oldalra megy, redirect dashboard-ra
  if ((to.path === '/login' || to.path === '/register') && localStorage.getItem('authToken')) {
    return '/dashboard'
  }
})

export default router

