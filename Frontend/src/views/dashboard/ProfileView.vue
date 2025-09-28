<template>
  <DashboardLayout 
    :title="$t('profile.title')" 
    :show-back-button="true"
    class="profile-page"
  >
    <div class="profile-container">
      <!-- Profil header -->
      <div class="profile-header card">
        <div class="profile-avatar-section">
          <div class="avatar-wrapper">
            <img :src="userProfile.avatar" :alt="$t('profile.avatar')" class="profile-avatar">
            <button @click="changeAvatar" class="avatar-edit-btn">
              <i class="icon-camera"></i>
            </button>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ userProfile.name }}</h2>
            <p class="profile-email">{{ userProfile.email }}</p>
            <p class="profile-joined">{{ $t('profile.joined') }}: {{ userProfile.joinedDate }}</p>
          </div>
        </div>
      </div>

        <!-- Profil beállítások -->
        <div class="profile-settings">
          <!-- Személyes adatok -->
          <div class="settings-section card">
            <h3 class="section-title">
              <i class="icon-user"></i>
              {{ $t('profile.personal_info') }}
            </h3>
            <form @submit.prevent="savePersonalInfo" class="settings-form">
              <div class="form-group">
                <label for="name">{{ $t('profile.name') }}</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="editableProfile.name" 
                  class="input"
                  :placeholder="$t('profile.name_placeholder')"
                >
              </div>
              <div class="form-group">
                <label for="email">{{ $t('profile.email') }}</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="editableProfile.email" 
                  class="input"
                  :placeholder="$t('profile.email_placeholder')"
                >
              </div>
              <div class="form-group">
                <label for="username">{{ $t('profile.username') }}</label>
                <input 
                  type="text" 
                  id="username" 
                  v-model="editableProfile.username" 
                  class="input"
                  :placeholder="$t('profile.username_placeholder')"
                  readonly
                >
                <small class="field-note">{{ $t('profile.username_readonly') }}</small>
              </div>
              <div class="form-group">
                <label for="bio" :class="{ 'label-edited': bioEdited, 'label-saved': bioSaved }">
                  {{ $t('profile.bio') }}
                  <span v-if="bioEdited" class="edit-indicator">*</span>
                  <span v-if="bioSaved" class="save-indicator">saved</span>
                </label>
                <textarea 
                  id="bio" 
                  v-model="editableProfile.bio" 
                  class="input textarea"
                  :class="{ 'bio-edited': bioEdited, 'bio-saved': bioSaved }"
                  rows="3"
                  :placeholder="$t('profile.bio_placeholder')"
                  @input="onBioChange"
                  @focus="onBioFocus"
                ></textarea>
              </div>
              <button type="submit" class="btn btn-primary">
                <i class="icon-save"></i>
                {{ $t('profile.save_changes') }}
              </button>
            </form>
          </div>

          <!-- Jelszó módosítás -->
          <div class="settings-section card">
            <h3 class="section-title">
              <i class="icon-lock"></i>
              {{ $t('profile.security') }}
            </h3>
            <form @submit.prevent="changePassword" class="settings-form">
              <div class="form-group">
                <label for="currentPassword">{{ $t('profile.current_password') }}</label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  v-model="passwordForm.current" 
                  class="input"
                  :placeholder="$t('profile.current_password_placeholder')"
                >
              </div>
              <div class="form-group">
                <label for="newPassword">{{ $t('profile.new_password') }}</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  v-model="passwordForm.new" 
                  class="input"
                  :placeholder="$t('profile.new_password_placeholder')"
                >
              </div>
              <div class="form-group">
                <label for="confirmPassword">{{ $t('profile.confirm_password') }}</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  v-model="passwordForm.confirm" 
                  class="input"
                  :placeholder="$t('profile.confirm_password_placeholder')"
                >
              </div>
              <button type="submit" class="btn btn-primary">
                <i class="icon-shield"></i>
                {{ $t('profile.change_password') }}
              </button>
            </form>
          </div>

          <!-- Fiók műveletek -->
          <div class="settings-section card danger-section">
            <h3 class="section-title">
              <i class="icon-warning"></i>
              {{ $t('profile.account_actions') }}
            </h3>
            <div class="danger-actions">
              <button @click="confirmDeleteAccount" class="btn btn-danger">
                <i class="icon-delete"></i>
                {{ $t('profile.delete_account') }}
              </button>
            </div>
          </div>
        </div>
      </div>

    <!-- Modal for avatar change -->
    <div v-if="showAvatarModal" class="modal-overlay" @click="closeAvatarModal">
      <div class="modal" @click.stop>
        <h3>{{ $t('profile.change_avatar') }}</h3>
        <div class="avatar-options">
          <div 
            v-for="avatar in avatarOptions" 
            :key="avatar.id"
            @click="selectAvatar(avatar)"
            class="avatar-option"
            :class="{ active: avatar.url === editableProfile.avatar }"
          >
            <img :src="avatar.url" :alt="avatar.name">
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeAvatarModal" class="btn btn-secondary">{{ $t('common.cancel') }}</button>
          <button @click="saveAvatar" class="btn btn-primary">{{ $t('common.save') }}</button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import { useNotification } from '@/composables/useNotification'

export default {
  name: 'ProfileView',
  components: {
    DashboardLayout
  },
  setup() {
    const { showSuccess, showError } = useNotification()
    return {
      showSuccess,
      showError
    }
  },
  data() {
    return {
      showAvatarModal: false,
      userProfile: {
        name: 'Betöltés...',
        email: 'Betöltés...',
        username: 'Betöltés...',
        bio: '',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjZDIxOTdmIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgODBjMC0xNi41Njg1IDEzLjQzMTUtMzAgMzAtMzBzMzAgMTMuNDMxNSAzMCAzMCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
        joinedDate: '2024. január'
      },
      editableProfile: {},
      bioEdited: false,
      bioSaved: false,
      passwordForm: {
        current: '',
        new: '',
        confirm: ''
      },
      avatarOptions: [
        { id: 1, name: 'Default', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjZDIxOTdmIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgODBjMC0xNi41Njg1IDEzLjQzMTUtMzAgMzAtMzBzMzAgMTMuNDMxNSAzMCAzMCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+' },
        { id: 2, name: 'Pink', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjZjQ3MmI2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgODBjMC0xNi41Njg1IDEzLjQzMTUtMzAgMzAtMzBzMzAgMTMuNDMxNSAzMCAzMCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+' },
        { id: 3, name: 'Purple', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjYTg1NWY3Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgODBjMC0xNi41Njg1IDEzLjQzMTUtMzAgMzAtMzBzMzAgMTMuNDMxNSAzMCAzMCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+' }
      ]
    }
  },
  created() {
  },
  async mounted() {
    await this.loadUserProfile()
  },
  methods: {
    async loadUserProfile() {
      try {
        const authToken = localStorage.getItem('authToken')
        
        if (!authToken) {
          this.$router.push('/login')
          return
        }

        const response = await fetch('/api/user/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          const userData = data.user
          
          this.userProfile = {
            name: userData.fullName || userData.full_name || userData.name || 'Felhasználó',
            email: userData.email || userData.email_address || 'user@example.com',
            username: userData.username || userData.login_name || '',
            bio: userData.bio || ''
          }
          this.editableProfile = { ...this.userProfile }
          
          // Állapotok visszaállítása
          this.bioEdited = false
          this.bioSaved = false
        } else {
          const errorData = await response.text()
          
          if (response.status === 401) {
            // Unauthorized - redirect to login
            localStorage.removeItem('authToken')
            localStorage.removeItem('authUser')
            this.$router.push('/login')
            return
          }
          
          this.showErrorMessage(this.$t('profile.load_failed'))
        }
      } catch (error) {
        this.showErrorMessage(this.$t('profile.load_failed'))
      }
    },
    onBioChange() {
      this.bioEdited = true
      this.bioSaved = false
    },
    onBioFocus() {
      this.bioSaved = false
    },
    changeAvatar() {
      this.showAvatarModal = true
    },
    closeAvatarModal() {
      this.showAvatarModal = false
    },
    selectAvatar(avatar) {
      this.editableProfile.avatar = avatar.url
    },
    saveAvatar() {
      this.userProfile.avatar = this.editableProfile.avatar
      this.closeAvatarModal()
      this.showSuccessMessage(this.$t('profile.avatar_updated'))
    },
    async savePersonalInfo() {
      // Validáció
      if (!this.editableProfile.name.trim()) {
        this.showErrorMessage(this.$t('profile.name_required'))
        return
      }
      
      if (!this.editableProfile.email.trim()) {
        this.showErrorMessage(this.$t('profile.email_required'))
        return
      }

      try {
        // API hívás profil frissítéshez (username nem küldjük, mert readonly)
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            fullName: this.editableProfile.name,
            email: this.editableProfile.email,
            bio: this.editableProfile.bio
          })
        })

        if (response.ok) {
          this.userProfile = { ...this.editableProfile }
          this.bioEdited = false
          this.bioSaved = true
          this.showSuccessMessage(this.$t('profile.info_updated'))
          
          // 2 másodperc után a saved állapot eltűnik
          setTimeout(() => {
            this.bioSaved = false
          }, 2000)
        } else {
          const error = await response.json()
          this.showErrorMessage(error.message || this.$t('profile.update_failed'))
        }
      } catch (error) {
        this.showErrorMessage(this.$t('profile.update_failed'))
      }
    },
    async changePassword() {
      // Validáció
      if (!this.passwordForm.current || !this.passwordForm.new || !this.passwordForm.confirm) {
        this.showErrorMessage(this.$t('profile.password_fields_required'))
        return
      }

      if (this.passwordForm.new !== this.passwordForm.confirm) {
        this.showErrorMessage(this.$t('profile.password_mismatch'))
        return
      }

      if (this.passwordForm.new.length < 6) {
        this.showErrorMessage(this.$t('profile.password_too_short'))
        return
      }

      try {
        // API hívás jelszó változtatáshoz
        const response = await fetch('/api/user/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            currentPassword: this.passwordForm.current,
            newPassword: this.passwordForm.new
          })
        })

        if (response.ok) {
          this.showSuccessMessage(this.$t('profile.password_updated'))
          this.passwordForm = { current: '', new: '', confirm: '' }
        } else {
          const error = await response.json()
          this.showErrorMessage(error.message || this.$t('profile.password_change_failed'))
        }
      } catch (error) {
        this.showErrorMessage(this.$t('profile.password_change_failed'))
      }
    },
    confirmDeleteAccount() {
      if (confirm(this.$t('profile.delete_account_confirm'))) {
        // Fiók törlése
        this.showSuccessMessage(this.$t('profile.account_deleted'))
        this.$router.push('/login')
      }
    },
    showSuccessMessage(message) {
      this.showSuccess(message)
    },
    showErrorMessage(message) {
      this.showError(message)
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding: 30px 20px;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Icons */
.icon-camera::before { content: "■"; }
.icon-user::before { content: "◇"; }
.icon-lock::before { content: "◆"; }
.icon-save::before { content: "▲"; }
.icon-shield::before { content: "⬟"; }
.icon-warning::before { content: "!"; }
.icon-delete::before { content: "×"; }

/* Profile header */
.profile-header {
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
}

.profile-avatar-section {
  display: flex;
  gap: 20px;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid var(--primary);
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.avatar-edit-btn:hover {
  background: var(--primary-hover);
  transform: scale(1.1);
}

.profile-info h2 {
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  color: var(--text-primary);
}

.profile-email {
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.profile-joined {
  color: var(--text-tertiary);
  margin: 0;
  font-size: 0.9rem;
}

.profile-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Settings sections */
.profile-settings {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.settings-section {
  padding: 25px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: var(--text-primary);
  font-weight: 600;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.textarea {
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
}

/* Bio állapot stílusok */
.textarea.bio-edited {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2) !important;
  background-color: rgba(245, 158, 11, 0.05) !important;
}

.textarea.bio-saved {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
  background-color: rgba(16, 185, 129, 0.05) !important;
  animation: bioSaveSuccess 0.5s ease;
}

@keyframes bioSaveSuccess {
  0% {
    transform: scale(1);
    background-color: rgba(16, 185, 129, 0.1);
  }
  50% {
    transform: scale(1.02);
    background-color: rgba(16, 185, 129, 0.15);
  }
  100% {
    transform: scale(1);
    background-color: rgba(16, 185, 129, 0.05);
  }
}

/* Label állapot stílusok */
.label-edited {
  color: #f59e0b !important;
  font-weight: 600;
}

.label-saved {
  color: #10b981 !important;
  font-weight: 600;
}

.edit-indicator {
  color: #f59e0b;
  font-size: 1.2em;
  margin-left: 5px;
}

.save-indicator {
  color: #10b981;
  font-size: 1.2em;
  margin-left: 5px;
  animation: checkmarkBounce 0.3s ease;
}

@keyframes checkmarkBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* Preferences */
.preferences-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-primary);
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-info label {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: block;
}

.preference-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-secondary);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Danger section */
.danger-section {
  border: 1px solid #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.danger-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  backdrop-filter: blur(10px);
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-xl);
}

.modal h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  text-align: center;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.avatar-option {
  cursor: pointer;
  border-radius: 50%;
  padding: 5px;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.avatar-option:hover {
  border-color: var(--primary);
}

.avatar-option.active {
  border-color: var(--primary);
  background: var(--primary-light);
}

.avatar-option img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: block;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .profile-avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .profile-stats {
    justify-content: center;
  }

  .danger-actions {
    flex-direction: column;
  }

  .preference-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .modal {
    padding: 20px;
  }

  .avatar-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

