<template>
  <div :class="['empty-state', { centered }]">
    <div class="empty-icon">
      <slot name="icon">{{ icon || defaultIcon }}</slot>
    </div>
    
    <h3 v-if="title" class="empty-title">{{ title }}</h3>
    
    <p v-if="description" class="empty-description">{{ description }}</p>
    
    <div v-if="$slots.actions || showAction" class="empty-actions">
      <slot name="actions">
        <BaseButton 
          v-if="showAction"
          @click="$emit('action')"
          :variant="actionVariant"
          :size="actionSize"
        >
          {{ actionText }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  showAction: {
    type: Boolean,
    default: false
  },
  actionText: {
    type: String,
    default: ''
  },
  actionVariant: {
    type: String,
    default: 'primary'
  },
  actionSize: {
    type: String,
    default: 'medium'
  },
  centered: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['action'])

const defaultIcon = computed(() => 'EMPTY')
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state.centered {
  min-height: 400px;
  justify-content: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.7;
  transition: transform 0.3s ease;
}

.empty-state:hover .empty-icon {
  transform: scale(1.05);
}

.empty-title {
  color: var(--text-primary);
  margin-bottom: 12px;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-description {
  margin-bottom: 30px;
  line-height: 1.6;
  max-width: 400px;
  color: var(--text-secondary);
}

.empty-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .empty-state {
    padding: 40px 15px;
  }
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  .empty-title {
    font-size: 1.3rem;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
