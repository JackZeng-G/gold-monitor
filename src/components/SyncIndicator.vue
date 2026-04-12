<template>
  <div class="sync-indicator" :class="syncStatus">
    <div class="sync-icon">
      <div class="sync-dot" :class="{ active: isSyncing }"></div>
      <div class="sync-ring" v-if="isSyncing"></div>
    </div>
    <div class="sync-info">
      <span class="sync-label">{{ statusLabel }}</span>
      <span class="sync-details" v-if="showDetails">{{ syncDetails }}</span>
    </div>
    <div class="sync-stats" v-if="showStats">
      <div class="stat-item">
        <span class="stat-label">延迟</span>
        <span class="stat-value">{{ latencyDisplay }}ms</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">缓存</span>
        <span class="stat-value">{{ recordCount }}</span>
      </div>
    </div>
    <!-- 数据源状态 -->
    <div class="data-sources" v-if="showStats">
      <div class="source-item" :class="getSourceStatus('sina')">
        <span class="source-dot"></span>
        <span class="source-name">新浪</span>
      </div>
      <div class="source-item" :class="getSourceStatus('eastmoney')">
        <span class="source-dot"></span>
        <span class="source-name">东财</span>
      </div>
      <div class="source-item" :class="getSourceStatus('gate')">
        <span class="source-dot"></span>
        <span class="source-name">Gate</span>
      </div>
    </div>
    <!-- 最后更新时间 -->
    <div class="last-update" v-if="showDetails && lastUpdateTime">
      <span class="update-label">更新于</span>
      <span class="update-time">{{ lastUpdateTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  showDetails: {
    type: Boolean,
    default: false
  },
  showStats: {
    type: Boolean,
    default: false
  },
  connected: {
    type: Boolean,
    default: false
  },
  reconnecting: {
    type: Boolean,
    default: false
  },
  latency: {
    type: Number,
    default: 0
  },
  recordCount: {
    type: Number,
    default: 0
  },
  lastUpdate: {
    type: Number,
    default: 0
  },
  sourceStatus: {
    type: Object,
    default: () => ({})
  }
});

const syncStatus = computed(() => {
  if (props.reconnecting) return 'connecting';
  if (props.connected) return 'connected';
  return 'offline';
});

const isSyncing = computed(() => props.reconnecting);

const lastUpdateTime = computed(() => {
  if (!props.lastUpdate) return '';
  const date = new Date(props.lastUpdate);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

const latencyDisplay = computed(() => {
  if (props.latency === 0 || props.latency === null || props.latency === undefined) return '--';
  return props.latency;
});

const statusLabel = computed(() => {
  switch (syncStatus.value) {
    case 'offline':
      return '离线';
    case 'connecting':
      return '连接中...';
    case 'connected':
      return '实时同步';
    case 'error':
      return '连接错误';
    default:
      return '未知';
  }
});

const syncDetails = computed(() => {
  if (syncStatus.value === 'connected') {
    const okCount = Object.values(props.sourceStatus || {}).filter(s => s === 'ok').length;
    return `${okCount}/3 数据源正常`;
  } else if (syncStatus.value === 'error') {
    return '正在尝试重新连接';
  } else if (syncStatus.value === 'offline') {
    return '正在使用离线数据';
  }
  return '';
});

// 获取数据源状态样式
const getSourceStatus = (source) => {
  return props.sourceStatus?.[source] || 'ok';
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.sync-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border-radius: $border-radius-full;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid $color-border;
  transition: all $transition-fast;
  box-shadow: $shadow-sm;

  &.offline {
    border-color: rgba($color-text-muted, 0.3);
  }

  &.connecting {
    border-color: rgba($color-brand, 0.3);
    background: rgba($color-brand, 0.08);
  }

  &.connected {
    border-color: rgba($color-down, 0.3);
    background: rgba($color-down, 0.08);
  }

  &.error {
    border-color: rgba($color-up, 0.3);
    background: rgba($color-up, 0.08);
  }
}

.sync-icon {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sync-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all $transition-fast;

  .offline & {
    background: $color-text-muted;
  }

  .connecting & {
    background: $color-brand;
  }

  .connected & {
    background: $color-down;
  }

  .error & {
    background: $color-up;
  }

  &.active {
    animation: pulse-sync 1.5s ease-in-out infinite;
  }
}

.sync-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: $color-brand;
  animation: spin 1s linear infinite;
}

.sync-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sync-label {
  font-size: 13px;
  font-weight: $font-weight-semibold;
  color: $color-text;
}

.sync-details {
  font-size: 11px;
  color: $color-text-muted;
}

.sync-stats {
  display: flex;
  gap: 12px;
  padding-left: 12px;
  border-left: 1px solid $color-border;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 9px;
  color: $color-text-muted;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: $color-text;
  font-family: $font-mono;
}

// 数据源状态
.data-sources {
  display: flex;
  gap: 8px;
  padding-left: 12px;
  border-left: 1px solid $color-border;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: $border-radius-sm;
  background: rgba(255, 255, 255, 0.6);
  transition: all $transition-fast;

  &.ok {
    .source-dot {
      background: $color-down;
    }
  }

  &.warning {
    .source-dot {
      background: #f59e0b;
    }
  }

  &.error {
    .source-dot {
      background: $color-up;
    }
  }
}

.source-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: all $transition-fast;
}

.source-name {
  font-size: 11px;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
}

// 最后更新时间
.last-update {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding-left: 12px;
  border-left: 1px solid $color-border;
}

.update-label {
  font-size: 9px;
  color: $color-text-muted;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.update-time {
  font-size: 11px;
  font-weight: $font-weight-semibold;
  color: $color-text;
  font-family: $font-mono;
}

@keyframes pulse-sync {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

@keyframes spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

// 响应式
@media (max-width: 1200px) {
  .data-sources {
    display: none;
  }
}

@media (max-width: 768px) {
  .sync-stats {
    display: none;
  }

  .last-update {
    display: none;
  }
}
</style>
