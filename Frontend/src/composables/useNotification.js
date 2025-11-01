import { NotificationService } from '@/services/notification.js'

/**
 * Composable for using notifications in Vue components
 * Provides reactive notification methods with consistent API
 */
export function useNotification() {
  
  const notify = {
    success: (message, duration = 3000) => {
      return NotificationService.showSuccess(message, duration)
    },
    
    error: (message, duration = 5000) => {
      return NotificationService.showError(message, duration)
    },
    
    warning: (message, duration = 4000) => {
      return NotificationService.showWarning(message, duration)
    },
    
    info: (message, duration = 3000) => {
      return NotificationService.showInfo(message, duration)
    },
    
    // Generic method
    show: (message, type = 'info', duration = 3000) => {
      return NotificationService.show(message, type, duration)
    },
    
    // Clear all notifications
    clearAll: () => {
      NotificationService.clearAll()
    }
  }
  
  return {
    notify
  }
}
