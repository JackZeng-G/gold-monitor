<template>
  <div class="news-panel">
    <div class="panel-header">
      <div class="header-left">
        <h3 class="panel-title">
          <span class="title-icon">📰</span>
          黄金资讯
        </h3>
        <span class="panel-subtitle">GOLD NEWS</span>
      </div>
      <div class="header-right">
        <span class="news-count" v-if="!loading && newsList.length > 0">{{ Math.min(newsList.length, 30) }} 条</span>
        <button class="refresh-btn" @click="loadNews" :disabled="loading">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotating: loading }">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          刷新
        </button>
      </div>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="news-skeleton">
      <div v-for="i in 6" :key="i" class="skeleton-item">
        <Skeleton width="24px" height="24px" radius="4px" />
        <div class="skeleton-content">
          <Skeleton width="50%" height="10px" />
          <Skeleton width="90%" height="13px" />
          <Skeleton width="60px" height="9px" />
        </div>
      </div>
    </div>

    <!-- 新闻列表 -->
    <div class="news-list" v-else-if="newsList.length > 0">
      <a
        v-for="(news, index) in newsList.slice(0, 30)"
        :key="index"
        :href="news.url || '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="news-item"
        :style="{ animationDelay: `${index * 0.03}s` }"
        @click.prevent="openNews(news)"
      >
        <div class="news-index">{{ String(index + 1).padStart(2, '0') }}</div>
        <div class="news-content">
          <div class="news-meta">
            <span v-if="news.tag" class="news-tag" :class="news.tagClass">
              {{ news.tag }}
            </span>
            <span class="news-source">{{ news.source }}</span>
            <span class="news-time">{{ news.time }}</span>
          </div>
          <div class="news-title">{{ news.title }}</div>
          <div class="news-summary" v-if="news.summary">{{ news.summary }}</div>
        </div>
        <div class="news-arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </div>
      </a>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <span class="empty-icon">📭</span>
      <span class="empty-text">暂无资讯</span>
      <button class="retry-btn" @click="loadNews">重新加载</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Skeleton from './Skeleton.vue';

const props = defineProps({
  refreshInterval: {
    type: Number,
    default: 300000 // 5分钟
  }
});

const newsList = ref([]);
const loading = ref(false);
const error = ref(null);

// 动态配置：开发环境用 localhost，生产环境用当前域名
const getApiBase = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8081';
  }
  return window.location.origin;
};
const API_BASE = getApiBase();

// 加载资讯
const loadNews = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${API_BASE}/api/news`);
    const result = await response.json();

    if (result.success && result.data) {
      newsList.value = result.data;
    } else {
      error.value = result.error || '获取资讯失败';
    }
  } catch (err) {
    console.error('Failed to load news:', err);
    error.value = '网络请求失败';
  } finally {
    loading.value = false;
  }
};

// 打开资讯
const openNews = (news) => {
  if (news.url) {
    window.open(news.url, '_blank');
  }
};

let refreshTimer = null;

// 设置定时刷新
const setupRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  refreshTimer = setInterval(loadNews, props.refreshInterval);
};

// 监听刷新间隔变化
watch(() => props.refreshInterval, () => {
  setupRefreshTimer();
});

onMounted(() => {
  loadNews();
  setupRefreshTimer();
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.news-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid $color-border;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba($color-brand, 0.05) 0%, transparent 100%);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-family: $font-display;
  font-size: 19px;
  font-weight: $font-weight-semibold;
  color: $color-text;
  margin: 0;
}

.title-icon {
  font-size: 18px;
}

.panel-subtitle {
  font-size: 12px;
  font-weight: $font-weight-bold;
  color: $color-text-muted;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-left: 22px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.news-count {
  font-size: 14px;
  color: $color-text-muted;
  background: rgba(255, 255, 255, 0.8);
  padding: 3px 10px;
  border-radius: $border-radius-full;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid $color-border;
  border-radius: $border-radius-full;
  font-size: 13px;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
  cursor: pointer;
  transition: all $transition-fast;
  letter-spacing: 0.3px;

  &:hover:not(:disabled) {
    color: $color-brand;
    border-color: rgba($color-brand, 0.3);
    background: rgba($color-brand, 0.08);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg.rotating {
    animation: spin 0.8s linear infinite;
  }
}

// 骨架屏
.news-skeleton {
  padding: $spacing-sm;
}

.skeleton-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-xs;
  background: rgba(255, 255, 255, 0.6);
  border-radius: $border-radius-md;
  margin-bottom: $spacing-xs;
  animation: pulse-opacity 1.5s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

// 新闻列表
.news-list {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: 0 $spacing-xs;
  // 启用 CSS 容器查询优化
  contain: layout style;
  // 平滑滚动
  scroll-behavior: smooth;
  // 隐藏滚动条但保持功能
  scrollbar-width: thin;
}

.news-item {
  // 隔离渲染层，优化滚动性能
  contain: layout style;
  will-change: transform;
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid rgba($color-border, 0.5);
  cursor: pointer;
  transition: all $transition-fast;
  animation: fade-in-up 0.3s ease-out backwards;
  text-decoration: none;
  color: inherit;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba($color-brand, 0.05);

    .news-arrow {
      opacity: 1;
      transform: translateX(4px);
    }

    .news-title {
      color: $color-brand;
    }

    .news-index {
      background: $gradient-brand;
      color: white;
      box-shadow: $shadow-brand;
      transform: scale(1.05);
    }
  }
}

.news-index {
  font-family: $font-mono;
  font-size: 12px;
  font-weight: $font-weight-bold;
  color: $color-brand;
  background: rgba($color-brand, 0.1);
  border: 1px solid rgba($color-brand, 0.2);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $border-radius-sm;
  flex-shrink: 0;
  transition: all $transition-fast;
}

.news-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.news-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-xs;
  margin-bottom: 4px;
}

.news-tag {
  padding: 2px 7px;
  border-radius: $border-radius-xs;
  font-size: 9px;
  font-weight: $font-weight-semibold;
  text-transform: uppercase;
  letter-spacing: 0.3px;

  &.hot {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  &.money {
    background: rgba(59, 130, 246, 0.12);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  &.bank {
    background: rgba(234, 88, 12, 0.12);
    color: #fb923c;
    border: 1px solid rgba(234, 88, 12, 0.2);
  }

  &.safe {
    background: rgba(190, 24, 93, 0.12);
    color: #f472b6;
    border: 1px solid rgba(190, 24, 93, 0.2);
  }

  &.org {
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  &.demand {
    background: rgba(147, 51, 234, 0.12);
    color: #a78bfa;
    border: 1px solid rgba(147, 51, 234, 0.2);
  }
}

.news-source {
  font-size: 13px;
  color: $color-text-muted;
  font-weight: $font-weight-medium;
}

.news-time {
  font-size: 12px;
  color: $color-text-muted;
}

.news-title {
  font-size: 15px;
  font-weight: $font-weight-medium;
  color: $color-text;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color $transition-fast;
}

.news-summary {
  font-size: 13px;
  color: $color-text-muted;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 3px;
}

.news-arrow {
  flex-shrink: 0;
  color: $color-brand;
  opacity: 0;
  transition: all $transition-fast;
  padding: 2px;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
  gap: $spacing-sm;
  color: $color-text-muted;
}

.empty-icon {
  font-size: 32px;
  opacity: 0.5;
}

.empty-text {
  font-size: 12px;
  color: $color-text-secondary;
  margin-top: $spacing-xs;
}

.retry-btn {
  margin-top: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: rgba($color-brand, 0.08);
  border: 1px solid $color-border-gold;
  border-radius: $border-radius-sm;
  color: $color-brand;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-fast;
  letter-spacing: 0.3px;

  &:hover {
    background: rgba(251, 191, 36, 0.15);
    border-color: $color-border-gold-strong;
    transform: translateY(-1px);
  }
}

// 滚动条
.news-list::-webkit-scrollbar {
  width: 4px;
}

.news-list::-webkit-scrollbar-track {
  background: transparent;
}

.news-list::-webkit-scrollbar-thumb {
  background: rgba($color-brand, 0.3);
  border-radius: 2px;

  &:hover {
    background: rgba($color-brand, 0.5);
  }
}
</style>
