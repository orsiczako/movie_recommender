<template>
  <div class="app-input">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="input-wrapper">
      <i v-if="icon" :class="icon" class="input-icon"></i>
      
      <input
        :id="inputId"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
      
      <button 
        v-if="type === 'password'" 
        type="button"
        @click="togglePasswordVisibility"
        class="password-toggle"
      >
        <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
      </button>
    </div>
    
    <span v-if="error" class="input-error">{{ error }}</span>
    <span v-else-if="hint" class="input-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { computed, ref, getCurrentInstance } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  hint: {
    type: String,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue', 'focus', 'blur'])

const instance = getCurrentInstance()
const inputId = `input-${instance.uid}`

const showPassword = ref(false)

const inputClasses = computed(() => [
  'input-field',
  {
    'input-field--error': props.error,
    'input-field--with-icon': props.icon,
    'input-field--password': props.type === 'password'
  }
])

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  const input = document.getElementById(inputId)
  input.type = showPassword.value ? 'text' : 'password'
}
</script>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.required {
  color: var(--error);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: 0.5rem;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field--with-icon {
  padding-left: 2.5rem;
}

.input-field--password {
  padding-right: 2.5rem;
}

.input-field:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.input-field--error {
  border-color: var(--error);
}

.input-field--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-secondary);
  z-index: 1;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.input-error {
  font-size: 0.875rem;
  color: var(--error);
}

.input-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Icons (simple text icons for now) */
.icon-eye::before { content: "●"; }
.icon-eye-off::before { content: "■"; }
</style>
