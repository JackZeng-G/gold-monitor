<template>
  <div class="skeleton" :class="{ 'animate': animate }">
    <slot>
      <div class="skeleton-block" :style="blockStyle"></div>
    </slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: 20
  },
  radius: {
    type: [String, Number],
    default: 4
  },
  animate: {
    type: Boolean,
    default: true
  }
});

const blockStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius
}));
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.skeleton {
  display: inline-block;
}

.skeleton-block {
  background: linear-gradient(
    90deg,
    rgba(203, 213, 225, 0.3) 0%,
    rgba(203, 213, 225, 0.5) 50%,
    rgba(203, 213, 225, 0.3) 100%
  );
  background-size: 200% 100%;
}

.animate .skeleton-block {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>