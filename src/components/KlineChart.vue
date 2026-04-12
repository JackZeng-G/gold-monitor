<template>
  <div class="kline-chart">
    <div class="chart-header">
      <div class="header-row">
        <div class="title-row">
          <span class="chart-icon">📊</span>
          <h3 class="chart-title">{{ title }}</h3>
        </div>
        <div class="last-price" v-if="klineData.length > 0">
          <div class="price-main">
            <span class="price-label">最新价</span>
            <span class="price-value" :class="priceTrend">{{ lastClose.toFixed(2) }}</span>
          </div>
          <div class="price-change-wrapper" :class="priceTrend">
            <span class="change-value">{{ changeSign }}{{ changeValue.toFixed(2) }}</span>
            <span class="change-percent">{{ changeSign }}{{ changePercent.toFixed(2) }}%</span>
          </div>
        </div>
      </div>
      <div class="period-tabs">
        <button
          v-for="p in periods"
          :key="p.value"
          :class="['period-btn', { active: currentPeriod === p.value }]"
          @click="changePeriod(p.value)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>
    <div ref="chartRef" class="chart-container" v-loading="loading"></div>
    <div class="chart-stats" v-if="klineData.length > 0">
      <div class="stat-item">
        <span class="stat-icon">📈</span>
        <span class="stat-label">开盘</span>
        <span class="stat-value">{{ lastOpen.toFixed(2) }}</span>
      </div>
      <div class="stat-item high">
        <span class="stat-icon">⬆️</span>
        <span class="stat-label">最高</span>
        <span class="stat-value">{{ lastHigh.toFixed(2) }}</span>
      </div>
      <div class="stat-item low">
        <span class="stat-icon">⬇️</span>
        <span class="stat-label">最低</span>
        <span class="stat-value">{{ lastLow.toFixed(2) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">📊</span>
        <span class="stat-label">成交量</span>
        <span class="stat-value">{{ formatVolume(lastVolume) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import { API_BASE } from '@/constants';
import { fetchKlineData as fetchKlineDataFromApi } from '@/services/api';

const props = defineProps({
  title: {
    type: String,
    default: 'K线图'
  },
  symbol: {
    type: String,
    default: 'AU0'
  },
  apiEndpoint: {
    type: String,
    default: ''
  },
  height: {
    type: [Number, String],
    default: 400
  },
  availablePeriods: {
    type: Array,
    default: () => ['5', '15', '30', '60', 'day', 'week', 'month']
  },
  defaultPeriod: {
    type: String,
    default: 'day'
  }
});

const API_BASE_URL = API_BASE + '/api';

const chartRef = ref(null);
let chart = null;
const loading = ref(true);
const klineData = ref([]);
const currentPeriod = ref(props.defaultPeriod);

// K线数据缓存（内存缓存，避免重复请求）
const klineCache = new Map();
const CACHE_TTL = 60000; // 缓存有效期：60秒

// 获取缓存键
const getCacheKey = (symbol, period) => {
  return `${symbol || 'default'}_${period}`;
};

// 从缓存获取数据
const getFromCache = (key) => {
  const cached = klineCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

// 保存到缓存
const saveToCache = (key, data) => {
  klineCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const allPeriods = [
  { value: '5', label: '5分' },
  { value: '15', label: '15分' },
  { value: '30', label: '30分' },
  { value: '60', label: '60分' },
  { value: 'day', label: '日K' },
  { value: 'week', label: '周K' },
  { value: 'month', label: '月K' }
];

const periods = computed(() => {
  return allPeriods.filter(p => props.availablePeriods.includes(p.value));
});

// 计算属性
const lastKline = computed(() => {
  if (klineData.value.length === 0) return null;
  return klineData.value[klineData.value.length - 1];
});

const lastOpen = computed(() => lastKline.value?.open || 0);
const lastHigh = computed(() => lastKline.value?.high || 0);
const lastLow = computed(() => lastKline.value?.low || 0);
const lastClose = computed(() => lastKline.value?.close || 0);
const lastVolume = computed(() => lastKline.value?.volume || 0);

const prevClose = computed(() => {
  if (klineData.value.length < 2) return lastOpen.value;
  return klineData.value[klineData.value.length - 2].close;
});

const changeValue = computed(() => lastClose.value - prevClose.value);
const changePercent = computed(() => {
  if (prevClose.value === 0) return 0;
  return (changeValue.value / prevClose.value) * 100;
});

const changeSign = computed(() => changeValue.value >= 0 ? '+' : '');
const priceTrend = computed(() => changeValue.value >= 0 ? 'up' : 'down');

// 格式化成交量
const formatVolume = (vol) => {
  if (!vol || vol === 0) return '--';
  if (vol >= 100000000) {
    return (vol / 100000000).toFixed(2) + '亿';
  }
  if (vol >= 10000) {
    return (vol / 10000).toFixed(2) + '万';
  }
  return vol.toFixed(0);
};

// 获取K线数据
const fetchKlineData = async (forceRefresh = false) => {
  const cacheKey = getCacheKey(props.symbol || props.apiEndpoint, currentPeriod.value);

  // 尝试从缓存获取（非强制刷新时）
  if (!forceRefresh) {
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      klineData.value = cachedData;
      loading.value = false;
      updateChart();
      return;
    }
  }

  loading.value = true;
  try {
    let data;

    if (props.apiEndpoint) {
      // Custom endpoint - use axios directly
      const url = `${API_BASE_URL}${props.apiEndpoint}?period=${currentPeriod.value}`;
      const response = await axios.get(url, { timeout: 15000 });
      if (response.data?.success && response.data?.data) {
        data = response.data.data;
      }
    } else {
      // Standard symbol-based endpoint - use centralized API
      data = await fetchKlineDataFromApi(props.symbol, currentPeriod.value);
    }

    if (data) {
      klineData.value = data;
      saveToCache(cacheKey, data);
      updateChart();
    }
  } catch (error) {
    console.error('Failed to fetch kline data:', error);
  } finally {
    loading.value = false;
  }
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value, null, {
    // 使用 Canvas 渲染，减少 passive event 警告
    renderer: 'canvas',
    // 禁用一些不必要的交互来减少事件监听
    useDirtyRect: true
  });

  const option = {
    backgroundColor: 'transparent',
    animation: false,
    grid: [
      {
        left: '8%',
        right: '3%',
        top: '5%',
        height: '55%'
      },
      {
        left: '8%',
        right: '3%',
        top: '65%',
        height: '20%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: [],
        boundaryGap: true,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          interval: 'auto'
        },
        splitLine: { show: false }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: [],
        boundaryGap: true,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { show: false },
        splitLine: { show: false }
      }
    ],
    yAxis: [
      {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        splitLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          formatter: (value) => value.toFixed(0)
        }
      },
      {
        type: 'value',
        gridIndex: 1,
        scale: true,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        splitLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          formatter: (value) => {
            if (value >= 10000) return (value / 10000).toFixed(0) + '万';
            return value.toFixed(0);
          }
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 50,
        end: 100
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: {
        color: '#1e293b',
        fontSize: 13
      },
      formatter: (params) => {
        if (!params || params.length === 0) return '';
        const kline = params[0];
        const data = klineData.value[kline.dataIndex];
        if (!data) return '';

        const change = data.close - data.open;
        const changePercent = data.open > 0 ? (change / data.open * 100) : 0;
        const color = change >= 0 ? '#f97316' : '#10b981';
        const sign = change >= 0 ? '+' : '';

        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #8b5cf6;">${data.date}</div>
            <div style="display: grid; grid-template-columns: 60px 80px; gap: 4px;">
              <span style="color: #64748b;">开盘:</span>
              <span style="color: #1e293b;">${data.open.toFixed(2)}</span>
              <span style="color: #64748b;">收盘:</span>
              <span style="color: ${color}; font-weight: bold;">${data.close.toFixed(2)}</span>
              <span style="color: #64748b;">最高:</span>
              <span style="color: #f97316;">${data.high.toFixed(2)}</span>
              <span style="color: #64748b;">最低:</span>
              <span style="color: #10b981;">${data.low.toFixed(2)}</span>
              <span style="color: #64748b;">涨跌:</span>
              <span style="color: ${color};">${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)</span>
              <span style="color: #64748b;">成交量:</span>
              <span style="color: #1e293b;">${formatVolume(data.volume)}</span>
            </div>
          </div>
        `;
      }
    },
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: [],
        itemStyle: {
          color: '#f97316',
          color0: '#10b981',
          borderColor: '#f97316',
          borderColor0: '#10b981'
        },
        barWidth: '60%'
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: [],
        itemStyle: {
          color: (params) => {
            const data = klineData.value[params.dataIndex];
            if (!data) return '#94a3b8';
            return data.close >= data.open ? '#f97316' : '#10b981';
          }
        },
        barWidth: '60%'
      }
    ]
  };

  chart.setOption(option);
};

// 更新图表
const updateChart = () => {
  if (!chart || klineData.value.length === 0) return;

  const dates = klineData.value.map(d => d.date);
  const ohlc = klineData.value.map(d => [d.open, d.close, d.low, d.high]);
  const volumes = klineData.value.map(d => d.volume);

  chart.setOption({
    xAxis: [
      { data: dates },
      { data: dates }
    ],
    series: [
      { data: ohlc },
      { data: volumes }
    ]
  });
};

// 切换周期
const changePeriod = (period) => {
  currentPeriod.value = period;
  fetchKlineData();
};

// 窗口大小变化
const handleResize = () => {
  chart && chart.resize();
};

// 监听symbol变化
watch(() => props.symbol, () => {
  fetchKlineData();
});

onMounted(() => {
  initChart();
  fetchKlineData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chart && chart.dispose();
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.kline-chart {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: visible;
}

.chart-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid $color-border;
  background: linear-gradient(180deg, rgba($color-brand, 0.08) 0%, transparent 100%);
  flex-shrink: 0;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.chart-icon {
  font-size: 18px;
}

.chart-title {
  font-family: $font-display;
  font-size: 19px;
  font-weight: $font-weight-semibold;
  color: $color-text;
  margin: 0;
}

.period-tabs {
  display: flex;
  gap: 6px;
}

.period-btn {
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid $color-border;
  border-radius: $border-radius-sm;
  font-size: 14px;
  color: $color-text-secondary;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    color: $color-brand;
    border-color: $color-border-gold;
    background: rgba($color-brand, 0.1);
  }

  &.active {
    background: rgba($color-brand, 0.08);
    color: $color-brand;
    border-color: $color-brand;
    font-weight: $font-weight-semibold;
    box-shadow: 0 0 10px rgba($color-brand, 0.3);
  }
}

.last-price {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-label {
  font-size: 14px;
  color: $color-text-muted;
}

.price-value {
  font-family: $font-display;
  font-size: 26px;
  font-weight: $font-weight-bold;
  letter-spacing: -0.5px;

  &.up {
    color: $color-up;
    text-shadow: 0 0 20px rgba($color-up, 0.5);
  }

  &.down {
    color: $color-down;
    text-shadow: 0 0 20px rgba($color-down, 0.5);
  }
}

.price-change-wrapper {
  display: flex;
  gap: 8px;
  padding: 5px 12px;
  border-radius: $border-radius-sm;
  font-family: $font-mono;
  font-size: 14px;
  font-weight: $font-weight-semibold;

  &.up {
    background: $color-up-bg;
    color: $color-up;
  }

  &.down {
    background: $color-down-bg;
    color: $color-down;
  }

  .change-value {
    min-width: 70px;
  }

  .change-percent {
    min-width: 60px;
  }
}

.chart-container {
  flex: 1;
  width: 100%;
  min-height: 240px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: $border-radius-md;
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.6);
  border-top: 1px solid $color-border;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: $border-radius-full;
  border: 1px solid $color-border;

  .stat-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .stat-label {
    font-size: 13px;
    color: $color-text-muted;
    white-space: nowrap;
  }

  .stat-value {
    font-family: $font-mono;
    font-size: 15px;
    font-weight: $font-weight-semibold;
    color: $color-text;
    white-space: nowrap;
  }

  &.high .stat-value {
    color: $color-up;
  }

  &.low .stat-value {
    color: $color-down;
  }
}

@media (max-width: 600px) {
  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .last-price {
    margin-left: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .chart-stats {
    flex-wrap: wrap;
    gap: 6px;
  }

  .stat-item {
    padding: 3px 6px;
    font-size: 12px;

    .stat-label {
      font-size: 10px;
    }

    .stat-value {
      font-size: 12px;
    }
  }
}
</style>
