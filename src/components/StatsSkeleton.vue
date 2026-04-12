<template>
  <div class="stats-skeleton">
    <div v-for="i in count" :key="i" class="stat-card-skeleton">
      <div class="skeleton-header">
        <Skeleton width="60px" height="10px" />
        <Skeleton width="40px" height="16px" radius="4px" />
      </div>
      <div class="skeleton-price">
        <Skeleton width="100px" height="28px" />
      </div>
      <div class="skeleton-change">
        <Skeleton width="50px" height="12px" />
        <Skeleton width="60px" height="18px" radius="10px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from './Skeleton.vue';

defineProps({
  count: {
    type: Number,
    default: 6
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.stats-skeleton {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card-skeleton {
  @include card-base;
  padding: $spacing-md;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-xs;
}

.skeleton-price {
  margin-bottom: $spacing-xs;
}

.skeleton-change {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}
</style>