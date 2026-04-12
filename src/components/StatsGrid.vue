<template>
  <section class="stats-section">
    <div
      v-for="(stat, index) in stats"
      :key="stat.key"
      class="stat-card"
      :class="[stat.trend, { 'is-rate': stat.isRate, 'price-flash': stat.flash }]"
      :style="{ animationDelay: `${index * 0.08}s` }"
    >
      <div class="stat-glow" :class="stat.trend"></div>
      <div class="stat-inner">
        <div class="stat-header">
          <div class="stat-meta">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-symbol">{{ stat.symbol }}</span>
          </div>
          <div v-if="stat.showChange" class="stat-badge" :class="stat.trend">
            <IconArrow :direction="stat.trend" :size="12" />
          </div>
        </div>
        <div class="stat-price">
          <span class="price-main">{{ stat.isRate ? '' : '¥' }}{{ formatPrice(stat.cnyPrice, stat.isRate) }}{{ stat.isRate ? '' : '/g' }}</span>
          <span v-if="stat.usdPrice" class="price-sub">${{ formatPrice(stat.usdPrice) }}/oz</span>
        </div>
        <div v-if="stat.showChange" class="stat-change">
          <span class="change-value" :class="stat.trend">{{ formatChange(stat.change) }}</span>
          <span class="change-percent" :class="stat.trend">{{ formatPercent(stat.percent) }}</span>
        </div>
        <div v-else class="stat-change stat-change-placeholder">
          <span class="change-value">--</span>
          <span class="change-percent">--</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import IconArrow from './IconArrow.vue';
import { formatPrice, formatChange, formatPercent, getTrend } from '@/utils/format';
import { OZ_TO_GRAM, DEFAULT_USD_CNY_RATE, NO_CHANGE_DISPLAY_KEYS } from '@/constants';

const props = defineProps({
  au9999: { type: Object, required: true },
  usFutures: { type: Object, required: true },
  ukFutures: { type: Object, required: true },
  paxg: { type: Object, required: true },
  usdCny: { type: Object, required: true },
  dxy: { type: Object, required: true },
  priceFlash: { type: Object, required: true }
});

// 预计算汇率转换系数
const conversionRate = computed(() => {
  const usdCnyRate = props.usdCny?.current || DEFAULT_USD_CNY_RATE;
  return usdCnyRate / OZ_TO_GRAM;
});

// 统一构建统计数据
const stats = computed(() => {
  const { au9999, usFutures, ukFutures, paxg, usdCny, dxy, priceFlash } = props;
  const rate = conversionRate.value;

  const items = [
    {
      key: 'au9999',
      label: '上海黄金',
      symbol: 'Au9999',
      cnyPrice: au9999.current,
      usdPrice: null,
      change: au9999.change,
      percent: au9999.changePercent,
      trend: getTrend(au9999.change),
      isRate: false,
      flash: priceFlash.au9999
    },
    {
      key: 'usFutures',
      label: '美国期货',
      symbol: 'COMEX',
      cnyPrice: (usFutures.current * rate).toFixed(2),
      usdPrice: usFutures.current,
      change: usFutures.change,
      percent: usFutures.changePercent,
      trend: getTrend(usFutures.change),
      isRate: false,
      flash: priceFlash.usFutures
    },
    {
      key: 'ukFutures',
      label: '伦敦金',
      symbol: 'XAU',
      cnyPrice: (ukFutures.current * rate).toFixed(2),
      usdPrice: ukFutures.current,
      change: ukFutures.change,
      percent: ukFutures.changePercent,
      trend: getTrend(ukFutures.change),
      isRate: false,
      flash: priceFlash.ukFutures
    },
    {
      key: 'paxg',
      label: '国际暗金',
      symbol: 'PAXG',
      cnyPrice: (paxg.current * rate).toFixed(2),
      usdPrice: paxg.current,
      change: 0,
      percent: 0,
      trend: 'flat',
      isRate: false,
      flash: priceFlash.paxg
    },
    {
      key: 'usdCny',
      label: '人民币汇率',
      symbol: 'USD/CNY',
      cnyPrice: usdCny.current,
      usdPrice: null,
      change: usdCny.change,
      percent: usdCny.changePercent,
      trend: getTrend(usdCny.change),
      isRate: true,
      flash: priceFlash.usdCny
    },
    {
      key: 'dxy',
      label: '美元指数',
      symbol: 'DXY',
      cnyPrice: dxy.current,
      usdPrice: null,
      change: 0,
      percent: 0,
      trend: 'flat',
      isRate: true,
      flash: priceFlash.dxy
    }
  ];

  // 添加 showChange 标志
  return items.map(item => ({
    ...item,
    showChange: !NO_CHANGE_DISPLAY_KEYS.includes(item.key)
  }));
});
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.stats-section {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-sm;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: $spacing-xs;
  }
}

.stat-card {
  @include glass-card;
  padding: $spacing-md;
  cursor: default;
  position: relative;
  overflow: hidden;
  min-height: 140px;
  display: flex;
  flex-direction: column;

  &.price-flash {
    animation: price-flash 0.5s ease-out;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
      animation: shimmer 0.5s ease-out;
    }

    &.up::after {
      background: linear-gradient(90deg, transparent, rgba($color-up, 0.15), transparent);
    }

    &.down::after {
      background: linear-gradient(90deg, transparent, rgba($color-down, 0.15), transparent);
    }
  }

  &:hover {
    box-shadow: $shadow-card-hover;
    border-color: rgba(139, 92, 246, 0.3);
    .stat-glow { opacity: 1; }
  }

  .stat-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    opacity: 0;
    transition: opacity $transition-slow;
    pointer-events: none;

    &.up { background: radial-gradient(circle at center, rgba($color-up, 0.1) 0%, transparent 50%); }
    &.down { background: radial-gradient(circle at center, rgba($color-down, 0.1) 0%, transparent 50%); }
  }

  &.up {
    .price-main { @include gradient-text($gradient-up); }
    .stat-badge { background: $color-up-bg; color: $color-up; }
    .change-value, .change-percent { color: $color-up; }
    &::before { background: linear-gradient(90deg, $color-up-from 0%, $color-up-to 50%, $color-up-from 100%); }
  }

  &.down {
    .price-main { @include gradient-text($gradient-down); }
    .stat-badge { background: $color-down-bg; color: $color-down; }
    .change-value, .change-percent { color: $color-down; }
    &::before { background: linear-gradient(90deg, $color-down-from 0%, $color-down-to 50%, $color-down-from 100%); }
  }

  &.is-rate {
    .price-main { @include gradient-text($gradient-brand); }
    .stat-badge {
      background: rgba(139, 92, 246, 0.1);
      color: $color-brand;
      border: 1px solid rgba(139, 92, 246, 0.2);
    }
  }
}

.stat-inner {
  position: relative;
  z-index: 1;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-sm;
}

.stat-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
  letter-spacing: 0.5px;
}

.stat-symbol {
  font-family: $font-mono;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: $color-brand;
  background: rgba(139, 92, 246, 0.1);
  padding: 4px 10px;
  border-radius: $border-radius-full;
  width: fit-content;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.stat-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: $border-radius-sm;
  transition: all $transition-fast;

  &:hover { transform: scale(1.15); }
}

.stat-price {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: $spacing-xs;

  .price-main {
    font-family: $font-display;
    font-size: 28px;
    font-weight: $font-weight-bold;
    line-height: 1;
    color: $color-text;
    letter-spacing: -1px;
  }

  .price-sub {
    font-family: $font-mono;
    font-size: 13px;
    color: $color-text-muted;
    font-weight: $font-weight-medium;
  }
}

.stat-change {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  &.stat-change-placeholder {
    .change-value, .change-percent {
      color: $color-text-muted;
      opacity: 0.5;
    }
  }
}

.change-value {
  font-family: $font-mono;
  font-size: 16px;
  font-weight: $font-weight-semibold;
}

.change-percent {
  font-family: $font-mono;
  font-size: 13px;
  font-weight: $font-weight-bold;
  padding: 4px 10px;
  border-radius: $border-radius-full;
  background: rgba(255, 255, 255, 0.8);

  &.up { background: $color-up-bg; }
  &.down { background: $color-down-bg; }
}

// 响应式
@media (max-width: 768px) {
  .stat-card {
    padding: $spacing-sm $spacing-md;
    min-height: 100px;
  }

  .stat-badge {
    width: 32px;
    height: 32px;
  }

  .stat-price .price-main {
    font-size: 26px;
  }

  .price-sub {
    display: none;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: $spacing-sm;
  }

  .stat-label {
    font-size: 13px;
  }

  .stat-symbol {
    font-size: 11px;
    padding: 3px 8px;
  }

  .stat-price .price-main {
    font-size: 22px;
  }

  .stat-price .price-sub {
    font-size: 11px;
  }

  .stat-change {
    flex-direction: column;
    gap: 2px;
  }

  .change-value {
    font-size: 13px;
  }

  .change-percent {
    font-size: 11px;
    padding: 2px 6px;
  }
}

// 动画
@keyframes price-flash {
  0% { transform: scale(1); }
  25% { transform: scale(1.02); }
  50% { transform: scale(1); }
  75% { transform: scale(1.01); }
  100% { transform: scale(1); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}
</style>
