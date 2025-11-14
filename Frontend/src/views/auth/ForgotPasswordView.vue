<template>
  <div class="content-wrapper">
    <!-- Animált háttér -->
    <AnimatedBackground />

    <!-- Fejléc komponensek -->
    <div class="header-controls">
      <ThemeSwitcher />
      <LanguageSwitcher />
    </div>

    <!-- Jelszó visszaállítási form -->
    <div class="form-container">
      <h2>{{ $t('auth.forgot_password_title') }}</h2>
      <p class="description">{{ $t('auth.forgot_password_description') }}</p>
      
      <form @submit.prevent="handleSubmit">
        <label for="email">{{ $t('auth.email') }}</label>
        <input 
          type="email" 
          id="email" 
          v-model="form.email" 
          required
          :placeholder="$t('auth.email')"
        >
        
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success">{{ successMessage }}</div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'Loading...' : $t('auth.send_reset_link') }}
        </button>
        
        <button type="button" @click="backToLogin" class="back-btn">
          {{ $t('auth.back_to_login_page') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { authService } from '@/services/api.js'
import { generatePasswordRecoveryTemplate } from '@/services/emailTemplates.js'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher.vue'
import AnimatedBackground from '@/components/ui/AnimatedBackground.vue'

export default {
  name: 'ForgotPasswordView',
  components: {
    LanguageSwitcher,
    ThemeSwitcher,
    AnimatedBackground
  },
  data() {
    return {
      form: {
        email: ''
      },
      errorMessage: '',
      successMessage: '',
      loading: false
    }
  },
  methods: {
    async handleSubmit() {
      this.errorMessage = ''
      this.successMessage = ''
      this.loading = true

      if (!this.form.email) {
        this.errorMessage = this.$t('auth.missing_email')
        this.loading = false
        return
      }

      try {
        // Generate email template for frontend
        // Use placeholder that will be replaced by backend
        const recoveryLink = '{recoveryLink}'
        const emailTemplate = generatePasswordRecoveryTemplate(
          recoveryLink,
          this.$i18n.locale,
          '{userFullName}' // Backend will replace this with actual full name
        )

        const result = await authService.forgotPassword(this.form.email, emailTemplate)
        
        if (result.success) {
          this.successMessage = this.$t('auth.recovery_sent')
          this.form.email = '' // Clear form
        } else {
          this.errorMessage = result.message || this.$t('common.server_error')
        }
      } catch (error) {
        console.error('Forgot password error:', error)
        this.errorMessage = this.$t('common.server_error')
      }
      
      this.loading = false
    },

    backToLogin() {
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

/* Form container */
.form-container {
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
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 600;
}

.description {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Form elements */
label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

input[type="email"] {
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

input[type="email"]:focus {
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

.back-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
}

.back-btn:hover {
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

.success {
  color: var(--success);
  margin-bottom: 1rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-container {
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

