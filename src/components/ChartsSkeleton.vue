<template>
  <div class="charts-skeleton">
    <div v-for="i in count" :key="i" class="chart-skeleton">
      <div class="chart-header-skeleton">
        <Skeleton width="100px" height="14px" />
        <div class="price-info-skeleton">
          <Skeleton width="80px" height="16px" />
          <Skeleton width="100px" height="12px" />
        </div>
      </div>
      <div class="chart-body-skeleton">
        <!-- 模拟走势线 -->
        <svg viewBox="0 0 300 150" class="skeleton-line">
          <path
            :d="generatePath()"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            opacity="0.3"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from './Skeleton.vue';

defineProps({
  count: {
    type: Number,
    default: 3
  }
});

const generatePath = () => {
  const points = [];
  let y = 75;
  for (let x = 0; x <= 300; x += 10) {
    y += (Math.random() - 0.5) * 20;
    y = Math.max(20, Math.min(130, y));
    points.push(`${x},${y}`);
  }
  return `M ${points.join(' L ')}`;
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.charts-skeleton {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.chart-skeleton {
  @include card-base;
  height: 240px;
  display: flex;
  flex-direction: column;
}

.chart-header-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm;
  border-bottom: 1px solid $color-border;
}

.price-info-skeleton {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.chart-body-skeleton {
  flex: 1;
  padding: $spacing-xs;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-line {
  width: 100%;
  height: 100%;
  color: rgba(203, 213, 225, 0.4);
  animation: pulse-opacity 1.5s ease-in-out infinite;
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}
</style>