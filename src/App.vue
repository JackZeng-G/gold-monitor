<template>
  <div class="app" :class="{ 'data-loaded': isDataLoaded }">
    <!-- 顶部导航栏 -->
    <HeaderBar :data-source="store.dataSource">
      <template #actions>
        <SyncIndicator
          :show-details="true"
          :show-stats="true"
          :connected="store.wsConnected"
          :reconnecting="store.wsReconnecting"
          :latency="store.syncStats.latency"
          :record-count="store.syncStats.recordCount"
          :last-update="store.syncStats.lastUpdate"
          :source-status="store.sourceStatus"
        />
        <SettingsPanel :polling-mode="store.pollingMode" />
      </template>
    </HeaderBar>

    <!-- 主内容区 -->
    <main class="app-main">
      <!-- 加载骨架屏 -->
      <template v-if="!isDataLoaded">
        <StatsSkeleton :count="6" />
        <ChartsSkeleton :count="2" />
      </template>

      <!-- 数据加载完成后显示 -->
      <template v-else>
        <!-- 顶部统计卡片 -->
        <StatsGrid
          :au9999="store.au9999"
          :us-futures="store.usFutures"
          :uk-futures="store.ukFutures"
          :paxg="store.paxg"
          :usd-cny="store.usdCny"
          :dxy="store.dxy"
          :price-flash="store.priceFlash"
        />

        <!-- 价格走势图区域 -->
        <ChartsSection />
      </template>

      <!-- 主内容网格 -->
      <div class="content-grid">
        <!-- 左侧：数据分析 -->
        <div class="main-column">
          <section class="section-card analysis-section">
            <AnalysisPanel />
          </section>
        </div>

        <!-- 右侧：黄金资讯 -->
        <div class="side-column">
          <section class="section-card news-section-main">
            <NewsPanel :refresh-interval="300000" />
          </section>
        </div>
      </div>
    </main>

    <!-- 错误提示（带自动消失和重试） -->
    <ErrorToast
      :error="store.error || ''"
      @retry="handleRetry"
      @dismiss="clearError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGoldStore } from '@/stores/goldStore';
import HeaderBar from '@/components/HeaderBar.vue';
import StatsGrid from '@/components/StatsGrid.vue';
import ChartsSection from '@/components/ChartsSection.vue';
import SettingsPanel from '@/components/SettingsPanel.vue';
import NewsPanel from '@/components/NewsPanel.vue';
import AnalysisPanel from '@/components/AnalysisPanel.vue';
import SyncIndicator from '@/components/SyncIndicator.vue';
import StatsSkeleton from '@/components/StatsSkeleton.vue';
import ChartsSkeleton from '@/components/ChartsSkeleton.vue';
import ErrorToast from '@/components/ErrorToast.vue';

const store = useGoldStore();
const isDataLoaded = ref(false);

// 监听数据加载状态
watch(() => store.lastUpdate, (val) => {
  if (val && !isDataLoaded.value) {
    isDataLoaded.value = true;
  }
});

// 重试加载
const handleRetry = async () => {
  await store.fetchAllData();
};

// 清除错误
const clearError = () => {
  store.error = null;
};

onMounted(async () => {
  // 初始化 WebSocket 连接（会自动回退到 HTTP 轮询）
  store.initWebSocket();
  // 首次加载数据
  await store.fetchAllData();
  isDataLoaded.value = true;
  // 更新缓存统计
  await store.updateCacheStats();
});

onUnmounted(() => {
  store.disconnectWebSocket();
});
</script>

<style lang="scss">
@import '@/styles/variables.scss';

// ========================================
// 基础重置
// ========================================

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: $font-body;
  background: $color-bg-primary;
  color: $color-text;
  line-height: 1.6;
  min-height: 100vh;
  font-size: 15px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// ========================================
// 应用容器
// ========================================

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $color-bg-primary;
  position: relative;
  overflow-x: hidden;

  // 动态彩色光斑背景
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background: $gradient-blob-1;
    pointer-events: none;
    z-index: 0;
    animation: blob-float 20s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: fixed;
    inset: 0;
    background: $gradient-blob-2;
    pointer-events: none;
    z-index: 0;
    animation: blob-float 25s ease-in-out infinite reverse;
  }

  &.data-loaded {
    .stat-card, .section-card {
      animation: fade-in-up 0.5s ease-out backwards;
    }
  }
}

// ========================================
// 主内容区
// ========================================

.app-main {
  flex: 1;
  padding: $spacing-lg $spacing-xl;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

// ========================================
// 区块卡片
// ========================================

.section-card {
  @include glass-card;
  padding: 0;

  &:hover {
    transform: none;
  }
}

// ========================================
// 内容网格
// ========================================

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
  align-items: start;
}

.main-column,
.side-column {
  display: flex;
  flex-direction: column;
  min-height: 800px;
  height: 800px;
}

// 新闻区块特殊处理
.news-section-main {
  flex: 1;
  display: flex;
  height: 100%;

  :deep(.news-panel) {
    border: none;
    box-shadow: none;
    background: transparent;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;

    &::before {
      display: none;
    }
  }
}

// 分析区块特殊处理
.analysis-section {
  display: flex;
  height: 100%;

  :deep(.analysis-panel) {
    border: none;
    box-shadow: none;
    background: transparent;
    display: flex;
    flex-direction: column;
    height: 100%;

    &::before {
      display: none;
    }

    .panel-header {
      padding: $spacing-sm $spacing-md;
      border-bottom: 1px solid $color-border;
      background: $gradient-card;
    }
  }
}

// ========================================
// 响应式布局
// ========================================

@media (max-width: 1400px) {
  .content-grid {
    grid-template-columns: 1fr 380px;
  }
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    order: 0;
  }
}

@media (max-width: 768px) {
  .app-main {
    padding: $spacing-md;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: $spacing-md;
  }

  .main-column,
  .side-column {
    height: auto;
    min-height: auto;
  }

  .news-section-main,
  .analysis-section {
    height: auto !important;
    min-height: auto !important;
  }
}

@media (max-width: 480px) {
  .app-main {
    padding: $spacing-sm;
  }

  .app {
    padding-bottom: 0;
  }
}
</style>
