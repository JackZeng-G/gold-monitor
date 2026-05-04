import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// ========================================
// 全局错误处理
// ========================================

// 错误统计
const errorStats = {
  total: 0,
  byType: new Map(),
  recentErrors: []
}

// 错误分类
function classifyError(error) {
  if (error?.message) {
    const msg = error.message.toLowerCase()
    if (msg.includes('network') || msg.includes('fetch')) return 'network'
    if (msg.includes('timeout')) return 'timeout'
    if (msg.includes('syntax')) return 'syntax'
    if (msg.includes('type')) return 'type'
    if (msg.includes('reference')) return 'reference'
  }
  return 'unknown'
}

// 记录错误
function recordError(error, type = 'vue') {
  errorStats.total++
  const errorType = classifyError(error)

  errorStats.byType.set(errorType, (errorStats.byType.get(errorType) || 0) + 1)

  errorStats.recentErrors.push({
    type,
    errorType,
    message: error?.message || String(error),
    stack: error?.stack,
    timestamp: Date.now()
  })

  // 只保留最近 50 个错误
  if (errorStats.recentErrors.length > 50) {
    errorStats.recentErrors.shift()
  }
}

// 用户友好的错误提示
function getUserFriendlyMessage(error, type) {
  const errorMsg = error?.message || String(error)

  switch (type) {
    case 'unhandledRejection':
      if (errorMsg.includes('NetworkError') || errorMsg.includes('fetch')) {
        return '网络请求失败，请检查网络连接'
      }
      return '异步操作失败，请重试'

    case 'vue':
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        return '数据加载失败，请检查网络'
      }
      if (errorMsg.includes('timeout')) {
        return '请求超时，请稍后重试'
      }
      return '组件加载出现问题'

    default:
      return '应用出现异常'
  }
}

// Vue 全局错误处理器
function setupGlobalErrorHandler(app) {
  // Vue 错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Vue Error]', {
      error: err,
      component: instance?.$options?.name || '匿名组件',
      info: info
    })

    recordError(err, 'vue')

    // 显示用户友好的提示（可扩展为 toast 通知）
    const friendlyMsg = getUserFriendlyMessage(err, 'vue')
    showUserNotification(friendlyMsg, 'error')
  }

  // 未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Rejection]', event.reason)

    recordError(event.reason, 'unhandledRejection')

    const friendlyMsg = getUserFriendlyMessage(event.reason, 'unhandledRejection')
    showUserNotification(friendlyMsg, 'warning')

    // 阻止默认的控制台错误输出（可选）
    // event.preventDefault()
  })

  // 全局 JavaScript 错误
  window.addEventListener('error', (event) => {
    if (event.error) {
      console.error('[Global Error]', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      })

      recordError(event.error, 'global')
    }
  })

  // 资源加载错误
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.error('[Resource Error]', {
        tagName: event.target.tagName,
        src: event.target.src || event.target.href,
        type: event.type
      })

      recordError(
        new Error(`Resource load failed: ${event.target.src || event.target.href}`),
        'resource'
      )
    }
  }, true)
}

// 用户通知（简单实现，可替换为 toast 组件）
function showUserNotification(message, type = 'info') {
  // 创建通知元素
  const notification = document.createElement('div')
  notification.className = `global-notification global-notification--${type}`
  notification.textContent = message

  // 样式
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    background: type === 'error' ? 'rgba(239, 68, 68, 0.9)' :
               type === 'warning' ? 'rgba(251, 191, 36, 0.9)' :
               'rgba(16, 185, 129, 0.9)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: '10000',
    animation: 'notification-slide-in 0.3s ease-out',
    maxWidth: '300px',
    wordBreak: 'break-word'
  })

  // 添加动画
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style')
    style.id = 'notification-styles'
    style.textContent = `
      @keyframes notification-slide-in {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes notification-slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  document.body.appendChild(notification)

  // 自动移除
  setTimeout(() => {
    notification.style.animation = 'notification-slide-out 0.3s ease-out forwards'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// 暴露错误统计（用于调试）
if (import.meta.env.DEV) {
  window.__ERROR_STATS__ = errorStats
}

// ========================================
// 应用初始化
// ========================================

const app = createApp(App)
const pinia = createPinia()

// 设置全局错误处理
setupGlobalErrorHandler(app)

// Loading 指令
app.directive('loading', {
  mounted(el, binding) {
    if (binding.value) {
      el.style.position = 'relative'
      const overlay = document.createElement('div')
      overlay.className = 'v-loading-overlay'
      overlay.innerHTML = '<div class="v-loading-spinner"></div>'
      el.appendChild(overlay)
    }
  },
  updated(el, binding) {
    const overlay = el.querySelector('.v-loading-overlay')
    if (binding.value && !overlay) {
      el.style.position = 'relative'
      const newOverlay = document.createElement('div')
      newOverlay.className = 'v-loading-overlay'
      newOverlay.innerHTML = '<div class="v-loading-spinner"></div>'
      el.appendChild(newOverlay)
    } else if (!binding.value && overlay) {
      overlay.remove()
    }
  }
})

app.use(pinia)
app.mount('#app')
