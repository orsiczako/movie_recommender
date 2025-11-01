<template>
  <div :class="['loading-spinner-container', `size-${size}`, { centered }]">
    <div class="loading-spinner" :style="spinnerStyle"></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  color: {
    type: String,
    default: 'primary' // primary, secondary, accent
  },
  text: {
    type: String,
    default: ''
  },
  centered: {
    type: Boolean,
    default: false
  }
})

const spinnerStyle = computed(() => {
  const sizes = {
    small: '20px',
    medium: '40px', 
    large: '60px'
  }
  
  const colors = {
    primary: 'var(--accent-primary)',
    secondary: 'var(--border-secondary)', 
    accent: 'var(--primary)'
  }
  
  return {
    width: sizes[props.size],
    height: sizes[props.size],
    borderTopColor: colors[props.color]
  }
})
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.loading-spinner-container.centered {
  justify-content: center;
  min-height: 200px;
}

.loading-spinner-container.size-small {
  gap: 8px;
}

.loading-spinner-container.size-large {
  gap: 20px;
}

.loading-spinner {
  border: 3px solid var(--border-secondary);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
}

.size-small .loading-text {
  font-size: 0.8rem;
}

.size-large .loading-text {
  font-size: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Theme variations */
.theme-dark .loading-spinner {
  border-color: rgba(255, 255, 255, 0.2);
  border-top-color: var(--accent-primary);
}
</style>
