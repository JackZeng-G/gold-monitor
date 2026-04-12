<template>
  <div class="settings-panel">
    <button class="settings-btn" @click="showPanel = !showPanel">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
      <span class="btn-text">设置</span>
    </button>

    <transition name="dropdown">
      <div v-if="showPanel" class="settings-dropdown">
        <div class="dropdown-header">
          <span class="dropdown-icon">⚙</span>
          <span class="dropdown-title">系统设置</span>
        </div>

        <div class="setting-item info-item">
          <div class="setting-header">
            <span class="setting-icon">📊</span>
            <span class="setting-label">智能轮询</span>
          </div>
          <div class="setting-value" :class="pollingMode">
            <span class="mode-indicator" :class="pollingMode"></span>
            {{ pollingModeText }} ({{ pollingIntervalText }})
          </div>
        </div>

        <div class="setting-item info-item">
          <div class="setting-header">
            <span class="setting-icon">📰</span>
            <span class="setting-label">资讯数据</span>
          </div>
          <div class="setting-value">自动刷新 (5分钟)</div>
        </div>

        <div class="dropdown-footer">
          <span class="footer-tip">根据数据变化频率自动调整刷新间隔</span>
        </div>
      </div>
    </transition>

    <!-- 点击外部关闭 -->
    <div v-if="showPanel" class="overlay" @click="showPanel = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  pollingMode: {
    type: String,
    default: 'active'
  }
});

const showPanel = ref(false);

// 轮询模式文字
const pollingModeText = computed(() => {
  const modeMap = {
    active: '活跃',
    normal: '正常',
    calm: '平静',
    inactive: '休眠'
  };
  return modeMap[props.pollingMode] || '活跃';
});

// 轮询间隔文字
const pollingIntervalText = computed(() => {
  const intervalMap = {
    active: '5秒',
    normal: '10秒',
    calm: '20秒',
    inactive: '30秒'
  };
  return intervalMap[props.pollingMode] || '5秒';
});

// ESC 关闭
const handleEsc = (e) => {
  if (e.key === 'Escape') {
    showPanel.value = false;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc);
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.settings-panel {
  position: relative;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: $spacing-xs $spacing-sm;
  background: $color-bg-card-solid;
  border: 1px solid $color-border;
  border-radius: $border-radius-sm;
  cursor: pointer;
  transition: all $transition-fast;
  color: $color-text;
  font-size: 14px;
  font-weight: $font-weight-medium;

  &:hover {
    background: rgba($color-brand, 0.08);
    border-color: rgba($color-brand, 0.3);
    color: $color-brand;

    svg {
      transform: rotate(45deg);
    }
  }

  svg {
    flex-shrink: 0;
    color: $color-text-secondary;
    transition: all $transition-fast;
  }
}

.btn-text {
  @media (max-width: 768px) {
    display: none;
  }
}

.settings-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  background: $color-bg-card-solid;
  border: 1px solid $color-border;
  border-radius: $border-radius-md;
  box-shadow: $shadow-2xl;
  min-width: 260px;
  z-index: 1000;
  overflow: hidden;
  animation: scale-in 0.2s ease-out;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  background: rgba($color-brand, 0.08);
  border-bottom: 1px solid $color-border;
}

.dropdown-icon {
  font-size: 16px;
  color: $color-brand;
}

.dropdown-title {
  font-size: 16px;
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.info-item {
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid $color-border;

  &:last-of-type {
    border-bottom: none;
  }
}

.setting-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.setting-icon {
  font-size: 14px;
  color: $color-brand;
}

.setting-label {
  font-size: 14px;
  color: $color-text-secondary;
  font-weight: $font-weight-medium;
}

.setting-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: $color-brand;
  padding-left: 20px;

  &.active {
    color: $color-up;
  }

  &.normal {
    color: $color-brand;
  }

  &.calm {
    color: $color-text-secondary;
  }

  &.inactive {
    color: $color-text-muted;
  }
}

.mode-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $color-brand;
  transition: all $transition-fast;

  &.active {
    background: $color-up;
    box-shadow: 0 0 8px rgba($color-up, 0.5);
    animation: pulse 2s ease-in-out infinite;
  }

  &.normal {
    background: $color-brand;
    box-shadow: 0 0 6px rgba($color-brand, 0.3);
  }

  &.calm {
    background: $color-text-secondary;
  }

  &.inactive {
    background: $color-text-muted;
    opacity: 0.5;
  }
}

.dropdown-footer {
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.6);
  border-top: 1px solid $color-border;
}

.footer-tip {
  font-size: 12px;
  color: $color-text-muted;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

// 动画
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
