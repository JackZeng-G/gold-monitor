<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-left">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 44 44" fill="none">
              <defs>
                <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#a78bfa"/>
                  <stop offset="50%" stop-color="#8b5cf6"/>
                  <stop offset="100%" stop-color="#6366f1"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="22" cy="22" r="20" stroke="url(#brandGrad)" stroke-width="2" fill="none"/>
              <circle cx="22" cy="22" r="16" stroke="url(#brandGrad)" stroke-width="1" fill="none" opacity="0.3"/>
              <path d="M22 6L27 16L38 18L30 26L32 38L22 32L12 38L14 26L6 18L17 16L22 6Z" fill="url(#brandGrad)" filter="url(#glow)"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1 class="app-title">黄金看盘</h1>
            <span class="app-subtitle">GOLD MONITOR</span>
          </div>
        </div>
        <span class="data-source">数据来源: {{ dataSourceName }}</span>
      </div>

      <div class="header-right">
        <div class="header-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { DATA_SOURCE_NAMES } from '@/constants';

const props = defineProps({
  dataSource: {
    type: String,
    default: 'sina'
  }
});

const dataSourceName = computed(() => {
  return DATA_SOURCE_NAMES[props.dataSource] || DATA_SOURCE_NAMES.mixed;
});
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: $gradient-header;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid $color-border;
  box-shadow: $shadow-sm;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm $spacing-lg;
  max-width: 1600px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.data-source {
  font-size: 12px;
  color: $color-text-muted;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: $border-radius-full;
  border: 1px solid $color-border;
}

.logo {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.logo-icon {
  width: 40px;
  height: 40px;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(139, 92, 246, 0.3));

  svg {
    width: 100%;
    height: 100%;
  }
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-title {
  font-family: $font-display;
  font-size: 24px;
  font-weight: $font-weight-bold;
  letter-spacing: 1px;
  @include gradient-text($gradient-brand);
}

.app-subtitle {
  font-size: 11px;
  font-weight: $font-weight-semibold;
  letter-spacing: 2px;
  color: $color-text-muted;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

// 响应式
@media (max-width: 768px) {
  .header-inner {
    padding: $spacing-sm $spacing-md;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .app-title {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .header-inner {
    padding: $spacing-xs $spacing-sm;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-xs;
  }

  .data-source {
    font-size: 11px;
    padding: 3px 8px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
  }

  .app-title {
    font-size: 18px;
    letter-spacing: 1px;
  }

  .app-subtitle {
    font-size: 10px;
    letter-spacing: 1px;
  }

  .header-actions {
    gap: $spacing-xs;
  }
}
</style>
