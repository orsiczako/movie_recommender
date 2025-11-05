<template>
  <div class="content-wrapper">
    <!-- Animált háttér -->
    <AnimatedBackground />

    <!-- Fejléc komponensek -->
    <div class="header-controls">
      <ThemeSwitcher />
      <LanguageSwitcher />
    </div>

    <!-- Regisztrációs form -->
    <div class="login-container">
      <h2>{{ $t('auth.register_title') }}</h2>
      <form @submit.prevent="handleSubmit">
        <label for="username">{{ $t('auth.username') }}</label>
        <input 
          type="text" 
          id="username" 
          v-model="form.username" 
          required
        >
        
        <label for="email">{{ $t('auth.email') }}</label>
        <input 
          type="email" 
          id="email" 
          v-model="form.email" 
          required
        >
        
        <label for="fullName">{{ $t('auth.full_name') }}</label>
        <input 
          type="text" 
          id="fullName" 
          v-model="form.fullName" 
          required
        >
        
        <label for="password">{{ $t('auth.password') }}</label>
        <input 
          type="password" 
          id="password" 
          v-model="form.password" 
          required
        >
        
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'Loading...' : $t('auth.register_button') }}
        </button>
        
        <button type="button" @click="goToLogin">
          {{ $t('auth.back_to_login') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { authService } from '@/services/api.js'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher.vue'
import AnimatedBackground from '@/components/ui/AnimatedBackground.vue'

export default {
  name: 'Register',
  components: {
    LanguageSwitcher,
    ThemeSwitcher,
    AnimatedBackground
  },
  data() {
    return {
      form: {
        username: '',
        email: '',
        fullName: '',
        password: ''
      },
      errorMessage: '',
      loading: false
    }
  },
  methods: {
    async handleSubmit() {
      this.errorMessage = ''
      this.loading = true

      if (!this.form.username || !this.form.password || !this.form.email || !this.form.fullName) {
        this.errorMessage = this.$t('auth.missing_fields')
        this.loading = false
        return
      }

      try {
        const result = await authService.register(
          this.form.username, 
          this.form.password, 
          this.form.email, 
          this.form.fullName
        )
        
        if (result.success) {
          this.$router.push('/login?registered=1')
        } else {
          this.errorMessage = result.message || this.$t('auth.register_failed')
        }
      } catch (error) {
        this.errorMessage = this.$t('auth.register_failed')
      } finally {
        this.loading = false
      }
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* Content wrapper */
.content-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-primary);
  overflow: hidden;
}

/* Header controls */
.header-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;
}

/* Login container - Same styling as Login component */
.login-container {
  background: var(--card-bg);
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-xl);
  min-width: 360px;
  max-width: 400px;
  width: 100%;
  border: 1px solid var(--card-border);
  position: relative;
  z-index: 10;
  backdrop-filter: blur(10px);
}

h2 {
  color: var(--primary);
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 600;
}

/* Form elements */
label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

input[type="text"], 
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid var(--input-border);
  border-radius: 0.5rem;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input[type="text"]:focus, 
input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

/* Buttons */
button {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

button[type="submit"] {
  background: var(--primary);
  color: white;
}

button[type="submit"]:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

button[type="button"] {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
}

button[type="button"]:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
}

/* Error message */
.error-message {
  color: var(--error-color);
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  padding: 0.5rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.375rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-controls {
    top: 15px;
    right: 15px;
    gap: 10px;
  }
  
  .login-container {
    margin: 1rem;
    min-width: auto;
    padding: 2rem 1.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    margin: 0.5rem;
    padding: 1.5rem 1rem;
  }
  
  button {
    padding: 0.875rem;
    font-size: 1.1rem;
  }
}
</style>