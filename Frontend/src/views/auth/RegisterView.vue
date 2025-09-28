<template>
  <div class="content-wrapper">
    <!-- Animált háttér -->
    <div class="animated-background">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
      </div>
      <!-- Extra holografikus fények -->
      <div class="holographic-lights">
        <div class="light light-1"></div>
        <div class="light light-2"></div>
        <div class="light light-3"></div>
      </div>
    </div>

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
        
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
        
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

export default {
  name: 'Register',
  components: {
    LanguageSwitcher,
    ThemeSwitcher
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
          this.errorMessage = result.message || this.$t('auth.register_error')
        }
      } catch (error) {
        this.errorMessage = this.$t('common.server_error')
      }
      
      this.loading = false
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

/* Animált háttér */
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(244, 114, 182, 0.08) 0%, 
    rgba(236, 72, 153, 0.12) 50%, 
    rgba(217, 70, 239, 0.06) 100%);
  backdrop-filter: blur(2px);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  box-shadow: 0 4px 20px rgba(244, 114, 182, 0.1);
}

/* Sötét témában intenzívebb, csajosabb árnyalatok */
.theme-dark .shape {
  background: linear-gradient(135deg, 
    rgba(244, 114, 182, 0.15) 0%, 
    rgba(232, 121, 249, 0.2) 50%, 
    rgba(168, 85, 247, 0.12) 100%);
  box-shadow: 0 4px 20px rgba(244, 114, 182, 0.2),
              0 0 40px rgba(232, 121, 249, 0.1);
}

/* Egyedi formák és animációk */
.shape-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 10%;
  animation: float1 8s infinite;
}

.shape-2 {
  width: 80px;
  height: 80px;
  top: 20%;
  right: 15%;
  animation: float2 6s infinite;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 20%;
  animation: float3 10s infinite;
}

.shape-4 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 25%;
  animation: float4 7s infinite;
}

.shape-5 {
  width: 100px;
  height: 100px;
  bottom: 10%;
  right: 10%;
  animation: float5 9s infinite;
}

.shape-6 {
  width: 40px;
  height: 40px;
  top: 40%;
  left: 60%;
  animation: float6 5s infinite;
}

/* Lebegési animációk */
@keyframes float1 {
  0% { transform: translate(0px, 0px) rotate(0deg); }
  50% { transform: translate(30px, -20px) rotate(180deg); }
  100% { transform: translate(0px, 0px) rotate(360deg); }
}

@keyframes float2 {
  0% { transform: translate(0px, 0px) rotate(0deg); }
  33% { transform: translate(-25px, 15px) rotate(120deg); }
  66% { transform: translate(20px, -10px) rotate(240deg); }
  100% { transform: translate(0px, 0px) rotate(360deg); }
}

@keyframes float3 {
  0% { transform: translate(0px, 0px) scale(1); }
  50% { transform: translate(-15px, -25px) scale(1.1); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes float4 {
  0% { transform: translate(0px, 0px) rotate(0deg); }
  25% { transform: translate(15px, -15px) rotate(90deg); }
  50% { transform: translate(-10px, -20px) rotate(180deg); }
  75% { transform: translate(-20px, 10px) rotate(270deg); }
  100% { transform: translate(0px, 0px) rotate(360deg); }
}

@keyframes float5 {
  0% { transform: translate(0px, 0px); }
  20% { transform: translate(10px, -15px); }
  40% { transform: translate(-15px, -10px); }
  60% { transform: translate(20px, 5px); }
  80% { transform: translate(-5px, 15px); }
  100% { transform: translate(0px, 0px); }
}

@keyframes float6 {
  0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
  50% { transform: translate(-20px, 20px) rotate(180deg) scale(1.2); }
  100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
}

/* Gyenge pulsing effekt a háttérre */
.animated-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 70%, 
    rgba(244, 114, 182, 0.04) 0%, 
    transparent 60%),
    radial-gradient(circle at 70% 30%, 
    rgba(236, 72, 153, 0.06) 0%, 
    transparent 60%),
    radial-gradient(circle at 50% 50%, 
    rgba(217, 70, 239, 0.03) 0%, 
    transparent 70%);
  animation: pulse 15s ease-in-out infinite;
}

.theme-dark .animated-background::before {
  background: radial-gradient(circle at 30% 70%, 
    rgba(244, 114, 182, 0.08) 0%, 
    transparent 50%),
    radial-gradient(circle at 70% 30%, 
    rgba(232, 121, 249, 0.1) 0%, 
    transparent 50%),
    radial-gradient(circle at 50% 50%, 
    rgba(168, 85, 247, 0.06) 0%, 
    transparent 60%);
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* Holografikus fények */
.holographic-lights {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.light {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.light-1 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, 
    rgba(244, 114, 182, 0.3) 0%, 
    rgba(244, 114, 182, 0.1) 40%, 
    transparent 70%);
  top: 20%;
  left: 80%;
  animation: hologram1 20s infinite;
}

.light-2 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, 
    rgba(232, 121, 249, 0.25) 0%, 
    rgba(232, 121, 249, 0.08) 40%, 
    transparent 70%);
  bottom: 30%;
  left: 10%;
  animation: hologram2 25s infinite;
}

.light-3 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, 
    rgba(168, 85, 247, 0.2) 0%, 
    rgba(168, 85, 247, 0.06) 40%, 
    transparent 70%);
  top: 60%;
  right: 20%;
  animation: hologram3 18s infinite;
}

/* Sötét témában intenzívebb holografikus fények */
.theme-dark .light-1 {
  background: radial-gradient(circle, 
    rgba(244, 114, 182, 0.4) 0%, 
    rgba(244, 114, 182, 0.15) 40%, 
    transparent 70%);
}

.theme-dark .light-2 {
  background: radial-gradient(circle, 
    rgba(232, 121, 249, 0.35) 0%, 
    rgba(232, 121, 249, 0.12) 40%, 
    transparent 70%);
}

.theme-dark .light-3 {
  background: radial-gradient(circle, 
    rgba(168, 85, 247, 0.3) 0%, 
    rgba(168, 85, 247, 0.1) 40%, 
    transparent 70%);
}

@keyframes hologram1 {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.3; }
  33% { transform: translate(-30px, -50px) scale(1.1); opacity: 0.6; }
  66% { transform: translate(20px, 30px) scale(0.9); opacity: 0.4; }
}

@keyframes hologram2 {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.25; }
  25% { transform: translate(40px, -20px) scale(1.2); opacity: 0.5; }
  50% { transform: translate(-20px, -40px) scale(0.8); opacity: 0.7; }
  75% { transform: translate(30px, 20px) scale(1.1); opacity: 0.3; }
}

@keyframes hologram3 {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.2; }
  40% { transform: translate(-25px, 35px) scale(1.3); opacity: 0.6; }
  80% { transform: translate(15px, -25px) scale(0.7); opacity: 0.4; }
}

/* Responsive - kisebb képernyőkön kevesebb animáció */
@media (max-width: 768px) {
  .shape-4, .shape-6, .light-3 {
    display: none;
  }
  
  .shape {
    animation-duration: 12s; /* Lassabb animáció mobilon */
  }
  
  .light {
    animation-duration: 25s; /* Lassabb holografikus fények */
  }
}

/* Reduced motion támogatás */
@media (prefers-reduced-motion: reduce) {
  .shape, .light {
    animation: none;
  }
  
  .animated-background::before {
    animation: none;
  }
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
  border-color: var(--border-accent);
}

/* Messages */
.error {
  color: var(--error);
  margin-bottom: 1rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .login-container {
    margin: 20px;
    padding: 2rem;
    min-width: auto;
  }
  
  .header-controls {
    top: 15px;
    right: 15px;
    gap: 10px;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}
</style>

