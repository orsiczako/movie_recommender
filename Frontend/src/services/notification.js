/**
 * Notification Service - Reusable notification system
 * Supports success, error, warning, and info notifications
 */

export class NotificationService {
  static show(message, type = 'info', duration = 3000) {
    const notification = this.createNotification(message, type)
    document.body.appendChild(notification)
    
    // Auto remove after duration
    setTimeout(() => {
      this.hideNotification(notification)
    }, duration)
    
    return notification
  }
  
  static showSuccess(message, duration = 3000) {
    return this.show(message, 'success', duration)
  }
  
  static showError(message, duration = 5000) {
    return this.show(message, 'error', duration)
  }
  
  static showWarning(message, duration = 4000) {
    return this.show(message, 'warning', duration)
  }
  
  static showInfo(message, duration = 3000) {
    return this.show(message, 'info', duration)
  }
  
  static createNotification(message, type) {
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    
    const styles = this.getNotificationStyles(type)
    notification.style.cssText = styles.base
    
    // Add theme-aware styling
    if (document.documentElement.classList.contains('theme-dark')) {
      notification.style.cssText += styles.dark
    }
    
    return notification
  }
  
  static hideNotification(notification) {
    notification.style.animation = 'slideOutRight 0.3s ease-in'
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification)
      }
    }, 300)
  }
  
  static getNotificationStyles(type) {
    const baseStyles = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: 500;
      font-family: var(--font-family);
      font-size: 0.9rem;
      max-width: 400px;
      word-wrap: break-word;
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
    `
    
    const typeStyles = {
      success: {
        base: baseStyles + `
          background: #10b981;
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `,
        dark: `
          background: #059669;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        `
      },
      error: {
        base: baseStyles + `
          background: #ef4444;
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        `,
        dark: `
          background: #dc2626;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        `
      },
      warning: {
        base: baseStyles + `
          background: #f59e0b;
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        `,
        dark: `
          background: #d97706;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        `
      },
      info: {
        base: baseStyles + `
          background: #3b82f6;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        `,
        dark: `
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        `
      }
    }
    
    return typeStyles[type] || typeStyles.info
  }
  
  // Clear all notifications
  static clearAll() {
    const notifications = document.querySelectorAll('.notification')
    notifications.forEach(notification => {
      this.hideNotification(notification)
    })
  }
}

// Export as default and named export for flexibility
export default NotificationService

// Add CSS animations to document if not already present
if (typeof document !== 'undefined' && !document.getElementById('notification-styles')) {
  const style = document.createElement('style')
  style.id = 'notification-styles'
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .notification:hover {
      transform: translateX(-2px);
      transition: transform 0.2s ease;
    }
    
    @media (max-width: 768px) {
      .notification {
        right: 10px !important;
        left: 10px !important;
        max-width: none !important;
      }
    }
  `
  document.head.appendChild(style)
}
