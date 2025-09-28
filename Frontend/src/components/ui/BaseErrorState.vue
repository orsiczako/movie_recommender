<template>
  <div :class="['error-state', `type-${type}`, { centered }]">
    <div class="error-icon">
      <slot name="icon">{{ defaultIcon }}</slot>
    </div>
    
    <h3 v-if="title" class="error-title">{{ title }}</h3>
    
    <p v-if="message" class="error-message">{{ message }}</p>
    
    <div v-if="$slots.actions || showRetry" class="error-actions">
      <slot name="actions">
        <BaseButton 
          v-if="showRetry"
          @click="$emit('retry')"
          variant="primary"
          size="medium"
        >
          {{ retryText || $t('common.retry') }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'error', // error, warning, info, empty
    validator: (value) => ['error', 'warning', 'info', 'empty'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  showRetry: {
    type: Boolean,
    default: false
  },
  retryText: {
    type: String,
    default: ''
  },
  centered: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['retry'])

const defaultIcon = computed(() => {
  if (props.icon) return props.icon
  
  const iconMap = {
  error: '',
  warning: '', 
    info: 'ℹ️',
  empty: ''
  }
  
  return iconMap[props.type] || 'ERROR'
})
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.error-state.centered {
  min-height: 300px;
  justify-content: center;
}

.error-state.type-error {
  color: var(--error);
}

.error-state.type-warning {
  color: var(--warning);
}

.error-state.type-info {
  color: var(--info);
}

.error-state.type-empty {
  color: var(--text-secondary);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.7;
}

.error-title {
  color: var(--text-primary);
  margin-bottom: 12px;
  font-size: 1.5rem;
  font-weight: 600;
}

.error-state.type-error .error-title {
  color: var(--error);
}

.error-state.type-warning .error-title {
  color: var(--warning);
}

.error-message {
  margin-bottom: 30px;
  line-height: 1.6;
  max-width: 400px;
  color: var(--text-secondary);
}

.error-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .error-state {
    padding: 30px 15px;
  }
  
  .error-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  .error-title {
    font-size: 1.3rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
