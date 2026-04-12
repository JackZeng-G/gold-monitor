<template>
  <section class="charts-section">
    <div class="charts-grid">
      <div class="chart-wrapper">
        <KlineChart
          title="上海黄金 K线"
          symbol="AU0"
          :available-periods="['day']"
        />
      </div>
      <div class="chart-wrapper">
        <KlineChart
          title="美国期货 K线"
          api-endpoint="/kline/us"
          default-period="5"
          :available-periods="['5', '15', '30', '60', 'day', 'week', 'month']"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import KlineChart from './KlineChart.vue';
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.charts-section {
  margin-bottom: $spacing-lg;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-lg;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.chart-wrapper {
  @include glass-card;
  height: 480px;
  width: 100%;
  overflow: visible;
  display: flex;
  flex-direction: column;

  :deep(.kline-chart),
  :deep(.gold-chart) {
    height: 100%;
    width: 100%;
    border: none;
    box-shadow: none;
    background: transparent;
  }
}

@media (max-width: 768px) {
  .chart-wrapper {
    height: 350px;
  }
}

@media (max-width: 480px) {
  .charts-grid {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }

  .chart-wrapper {
    height: 280px;
  }
}
</style>
