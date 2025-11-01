<template>
  <button 
    :class="buttonClasses" 
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <i v-if="icon && !loading" :class="icon"></i>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'tertiary', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  icon: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => [
  'app-button',
  `app-button--${props.variant}`,
  `app-button--${props.size}`,
  {
    'app-button--loading': props.loading,
    'app-button--disabled': props.disabled,
    'app-button--full-width': props.fullWidth
  }
])
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.app-button--full-width {
  width: 100%;
}

/* Sizes */
.app-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.app-button--medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.app-button--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Variants */
.app-button--primary {
  background: var(--primary);
  color: white;
}

.app-button--primary:hover:not(.app-button--disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.app-button--secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
}

.app-button--secondary:hover:not(.app-button--disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-accent);
}

.app-button--tertiary {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.app-button--tertiary:hover:not(.app-button--disabled) {
  background: var(--primary);
  color: white;
}

.app-button--danger {
  background: var(--error);
  color: white;
}

.app-button--danger:hover:not(.app-button--disabled) {
  background: var(--error-dark);
}

/* States */
.app-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.app-button--loading {
  pointer-events: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
