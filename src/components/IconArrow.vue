<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <template v-if="direction === 'up'">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </template>
    <template v-else-if="direction === 'down'">
      <path d="M12 5v14" />
      <path d="M5 12l7 7 7-7" />
    </template>
    <template v-else-if="direction === 'right'">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </template>
    <template v-else-if="direction === 'left'">
      <path d="M19 12H5" />
      <path d="M12 5l-7 7 7 7" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  direction: {
    type: String,
    default: 'up',
    validator: (v) => ['up', 'down', 'left', 'right'].includes(v)
  },
  size: {
    type: [Number, String],
    default: 12
  },
  strokeWidth: {
    type: [Number, String],
    default: 2.5
  }
});
</script>
