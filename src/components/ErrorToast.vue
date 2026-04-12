<template>
  <transition name="toast">
    <div v-if="visible && error" class="error-toast">
      <div class="toast-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="toast-content">
        <div class="toast-title">数据获取失败</div>
        <div class="toast-message">{{ error }}</div>
      </div>
      <button class="toast-retry" @click="handleRetry">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 4v6h6"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
        <span>重试</span>
      </button>
      <button class="toast-close" @click="handleClose">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { TOAST_AUTO_DISMISS } from '@/constants';

const props = defineProps({
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['retry', 'dismiss']);
const visible = ref(false);
let dismissTimer = null;

// 自动消失逻辑
watch(() => props.error, (newError) => {
  if (newError) {
    visible.value = true;
    // 清除之前的定时器
    if (dismissTimer) {
      clearTimeout(dismissTimer);
    }
    // 设置自动消失
    dismissTimer = setTimeout(() => {
      visible.value = false;
      emit('dismiss');
    }, TOAST_AUTO_DISMISS);
  } else {
    visible.value = false;
  }
});

const handleRetry = () => {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
  }
  visible.value = false;
  emit('retry');
};

const handleClose = () => {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
  }
  visible.value = false;
  emit('dismiss');
};

onUnmounted(() => {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
  }
});
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.error-toast {
  position: fixed;
  bottom: $spacing-xl;
  left: 50%;
  transform: translateX(-50%);
  background: $color-bg-card-solid;
  border: 1px solid $color-up-border;
  border-radius: $border-radius-xl;
  padding: $spacing-md $spacing-lg;
  box-shadow: $shadow-xl, $shadow-up;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  z-index: 1000;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: $gradient-up;
  color: white;
  border-radius: $border-radius-md;
  flex-shrink: 0;
}

.toast-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-title {
  font-weight: $font-weight-semibold;
  font-size: 14px;
  color: $color-up;
}

.toast-message {
  font-size: 12px;
  color: $color-text-secondary;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-retry {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: $color-up-bg;
  color: $color-up;
  border: 1px solid $color-up-border;
  border-radius: $border-radius-md;
  font-size: 13px;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $color-up;
    color: white;
  }

  svg {
    flex-shrink: 0;
  }
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: $color-text-muted;
  cursor: pointer;
  border-radius: $border-radius-sm;
  transition: all $transition-fast;

  &:hover {
    background: rgba($color-up, 0.1);
    color: $color-up;
  }
}

// 动画
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

// 响应式
@media (max-width: 768px) {
  .error-toast {
    flex-wrap: wrap;
    max-width: calc(100% - 32px);
    padding: $spacing-sm $spacing-md;
  }

  .toast-message {
    max-width: 200px;
  }

  .toast-retry {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
