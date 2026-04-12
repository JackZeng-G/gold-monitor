<template>
  <div class="analysis-panel">
    <div class="panel-header">
      <div class="header-left">
        <h3 class="panel-title">
          <span class="title-icon">🤖</span>
          数据分析
        </h3>
        <span class="panel-subtitle">DATA ANALYSIS</span>
      </div>
    </div>

    <div class="analysis-content">
      <!-- 三线分析 -->
      <div class="analysis-sections">
        <!-- 短线 -->
        <div class="analysis-section short" :class="shortTerm.class">
          <div class="section-top">
            <div class="term-info">
              <span class="term-icon">⚡</span>
              <span class="term-title">短线</span>
              <span class="term-badge">日内</span>
            </div>
            <div class="term-score">
              <span class="score-num">{{ shortTerm.score }}</span>
              <span class="score-status" :class="shortTerm.class">{{ shortTerm.label }}</span>
            </div>
          </div>
          <div class="section-content">
            <div class="analysis-list">
              <div v-for="(item, idx) in shortAnalysis.slice(0, 8)" :key="idx" class="analysis-row">
                <span class="dot" :class="item.type"></span>
                <span class="text">{{ item.text }}</span>
              </div>
            </div>
          </div>
          <div class="section-footer">
            <span class="suggestion-tag">建议</span>
            <span class="suggestion-text" :class="shortTerm.class">{{ shortTerm.suggestion }}</span>
          </div>
        </div>

        <!-- 中线 -->
        <div class="analysis-section mid" :class="midTerm.class">
          <div class="section-top">
            <div class="term-info">
              <span class="term-icon">📈</span>
              <span class="term-title">中线</span>
              <span class="term-badge">1-4周</span>
            </div>
            <div class="term-score">
              <span class="score-num">{{ midTerm.score }}</span>
              <span class="score-status" :class="midTerm.class">{{ midTerm.label }}</span>
            </div>
          </div>
          <div class="section-content">
            <div class="analysis-list">
              <div v-for="(item, idx) in midAnalysis.slice(0, 8)" :key="idx" class="analysis-row">
                <span class="dot" :class="item.type"></span>
                <span class="text">{{ item.text }}</span>
              </div>
            </div>
          </div>
          <div class="section-footer">
            <span class="suggestion-tag">建议</span>
            <span class="suggestion-text" :class="midTerm.class">{{ midTerm.suggestion }}</span>
          </div>
        </div>

        <!-- 长线 -->
        <div class="analysis-section long" :class="longTerm.class">
          <div class="section-top">
            <div class="term-info">
              <span class="term-icon">🎯</span>
              <span class="term-title">长线</span>
              <span class="term-badge">1-12月</span>
            </div>
            <div class="term-score">
              <span class="score-num">{{ longTerm.score }}</span>
              <span class="score-status" :class="longTerm.class">{{ longTerm.label }}</span>
            </div>
          </div>
          <div class="section-content">
            <div class="analysis-list">
              <div v-for="(item, idx) in longAnalysis.slice(0, 8)" :key="idx" class="analysis-row">
                <span class="dot" :class="item.type"></span>
                <span class="text">{{ item.text }}</span>
              </div>
            </div>
          </div>
          <div class="section-footer">
            <span class="suggestion-tag">建议</span>
            <span class="suggestion-text" :class="longTerm.class">{{ longTerm.suggestion }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGoldStore } from '@/stores/goldStore';
import {
  calculateMACD,
  calculateKDJ,
  calculateWilliamsR,
  calculateRSI,
  calculateBollingerBands,
  calculateATR,
  calculateEMA,
  calculateSMA,
  analyzeTechnicalIndicators
} from '@/utils/technicalIndicators';

const store = useGoldStore();

const lastDataHash = ref('');

// 短线数据
const shortTerm = ref({
  score: 50,
  label: '计算中',
  class: 'neutral',
  suggestion: '等待数据...'
});

// 中线数据
const midTerm = ref({
  score: 50,
  label: '计算中',
  class: 'neutral',
  suggestion: '等待数据...'
});

// 长线数据
const longTerm = ref({
  score: 50,
  label: '计算中',
  class: 'neutral',
  suggestion: '等待数据...'
});

// 分析内容
const shortAnalysis = ref([]);
const midAnalysis = ref([]);
const longAnalysis = ref([]);

// 技术指标结果
const technicalIndicators = ref(null);

// ========== 技术指标计算 ==========

// 计算标准差（波动率）
const calculateStdDev = (prices, period) => {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  const avg = slice.reduce((a, b) => a + b, 0) / period;
  const squaredDiffs = slice.map(p => Math.pow(p - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / period);
};

// 计算动量指标
const calculateMomentum = (prices, period = 5) => {
  if (prices.length < period + 1) return 0;
  const current = prices[prices.length - 1];
  const past = prices[prices.length - 1 - period];
  return ((current - past) / past) * 100;
};

// 计算布林带位置
const calculateBollingerPosition = (currentPrice, prices, period = 20) => {
  if (prices.length < period) return 0.5;

  const ma = calculateSMA(prices, period);
  const stdDev = calculateStdDev(prices, period);

  if (stdDev === 0) return 0.5;

  const upperBand = ma + 2 * stdDev;
  const lowerBand = ma - 2 * stdDev;

  // 返回当前价格在布林带中的位置 (0-1)
  return (currentPrice - lowerBand) / (upperBand - lowerBand);
};

// 计算趋势强度 (ADX简化版)
const calculateTrendStrength = (prices, period = 10) => {
  if (prices.length < period + 1) return 0;

  let upMoves = 0, downMoves = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) upMoves += Math.abs(change);
    else downMoves += Math.abs(change);
  }

  const totalMoves = upMoves + downMoves;
  if (totalMoves === 0) return 0;

  // 返回趋势方向性强度 (0-100)
  return Math.abs(upMoves - downMoves) / totalMoves * 100;
};

// 计算内外盘价差
const calculatePriceSpread = () => {
  const au = store.au9999;
  const us = store.usFutures;
  const rate = store.usdCny;

  if (!au.current || !us.current || !rate.current) return { spread: 0, status: 'normal' };

  const ozToGram = 31.1035;
  // 将国际金价转换为人民币/克
  const internationalCNY = (us.current * rate.current) / ozToGram;
  // 计算价差百分比
  const spreadPercent = ((au.current - internationalCNY) / internationalCNY) * 100;

  let status = 'normal';
  if (spreadPercent > 1.5) status = 'premium';  // 溢价
  else if (spreadPercent < -0.5) status = 'discount';  // 折价

  return { spread: spreadPercent, status };
};

// 计算数据哈希
const calculateDataHash = () => {
  const au = store.au9999;
  const us = store.usFutures;
  const uk = store.ukFutures;
  const rate = store.usdCny;
  return `${au.current}-${au.changePercent}-${us.current}-${us.changePercent}-${uk.current}-${uk.changePercent}-${rate.current}-${rate.change}`;
};

// ========== 短线分析 (技术面70% + 基本面30%) ==========
const analyzeShortTerm = (prices = null) => {
  const au = store.au9999;
  const us = store.usFutures;
  const uk = store.ukFutures;
  const dxy = store.dxy;

  let score = 50;
  const items = [];
  // 优先使用传入的 prices，避免重复提取
  const priceArray = prices || (au.history || []).map(h => h.price);

  // ===== 技术面分析 (70%权重) =====

  // 1. RSI指标 (权重15%)
  const rsi = calculateRSI(priceArray, 14).value;
  if (rsi !== null) {
    if (rsi > 70) {
      score -= 10;
      items.push({ type: 'negative', text: `RSI超买区(${rsi.toFixed(1)})，短期回调风险` });
    } else if (rsi > 60) {
      score += 5;
      items.push({ type: 'positive', text: `RSI偏强(${rsi.toFixed(1)})，多头动能充足` });
    } else if (rsi < 30) {
      score += 10;
      items.push({ type: 'positive', text: `RSI超卖区(${rsi.toFixed(1)})，反弹概率大` });
    } else if (rsi < 40) {
      score -= 5;
      items.push({ type: 'negative', text: `RSI偏弱(${rsi.toFixed(1)})，空头压力明显` });
    } else {
      items.push({ type: 'neutral', text: `RSI中性区域(${rsi.toFixed(1)})` });
    }
  }

  // 2. 移动平均线交叉 (权重20%)
  if (priceArray.length >= 10) {
    const ma5 = calculateSMA(priceArray, 5);
    const ma10 = calculateSMA(priceArray, 10);
    const currentPrice = au.current;

    if (ma5 && ma10) {
      const ma5AboveMa10 = ma5 > ma10;
      const priceAboveMa5 = currentPrice > ma5;

      if (ma5AboveMa10 && priceAboveMa5) {
        score += 15;
        items.push({ type: 'positive', text: `多头排列：MA5(${ma5.toFixed(2)}) > MA10(${ma10.toFixed(2)})` });
      } else if (!ma5AboveMa10 && !priceAboveMa5) {
        score -= 15;
        items.push({ type: 'negative', text: `空头排列：MA5(${ma5.toFixed(2)}) < MA10(${ma10.toFixed(2)})` });
      } else if (ma5AboveMa10 && !priceAboveMa5) {
        score += 5;
        items.push({ type: 'neutral', text: `均线金叉形成中，价格回踩MA5` });
      } else {
        score -= 5;
        items.push({ type: 'neutral', text: `均线死叉风险，价格承压` });
      }
    }
  }

  // 3. 布林带位置 (权重15%)
  if (priceArray.length >= 20) {
    const bbPos = calculateBollingerPosition(au.current, priceArray, 20);
    if (bbPos > 0.9) {
      score -= 8;
      items.push({ type: 'negative', text: `触及布林上轨，短期回调压力` });
    } else if (bbPos > 0.7) {
      score += 5;
      items.push({ type: 'positive', text: `布林带上行区间，趋势偏强` });
    } else if (bbPos < 0.1) {
      score += 8;
      items.push({ type: 'positive', text: `触及布林下轨，反弹机会` });
    } else if (bbPos < 0.3) {
      score -= 5;
      items.push({ type: 'negative', text: `布林带下行区间，趋势偏弱` });
    } else {
      items.push({ type: 'neutral', text: `布林带中轨附近，方向待明` });
    }
  }

  // 4. 动量指标 (权重20%)
  if (priceArray.length >= 6) {
    const momentum = calculateMomentum(priceArray, 5);
    if (momentum > 0.5) {
      score += 12;
      items.push({ type: 'positive', text: `动量强劲 +${momentum.toFixed(2)}%，上涨动能足` });
    } else if (momentum > 0.2) {
      score += 6;
      items.push({ type: 'positive', text: `动量偏多 +${momentum.toFixed(2)}%` });
    } else if (momentum < -0.5) {
      score -= 12;
      items.push({ type: 'negative', text: `动量转弱 ${momentum.toFixed(2)}%，下跌加速` });
    } else if (momentum < -0.2) {
      score -= 6;
      items.push({ type: 'negative', text: `动量偏空 ${momentum.toFixed(2)}%` });
    } else {
      items.push({ type: 'neutral', text: `动量平稳 ${momentum.toFixed(2)}%` });
    }
  }

  // ===== 基本面分析 (30%权重) =====

  // 5. 外盘联动 (权重15%)
  if (us.current > 0 && uk.current > 0) {
    const avgChange = (us.changePercent + uk.changePercent) / 2;
    if (avgChange > 0.3) {
      score += 10;
      items.push({ type: 'positive', text: `外盘强势：COMEX +${us.changePercent.toFixed(2)}%，伦敦金 +${uk.changePercent.toFixed(2)}%` });
    } else if (avgChange > 0) {
      score += 5;
      items.push({ type: 'positive', text: `外盘偏强：COMEX +${us.changePercent.toFixed(2)}%` });
    } else if (avgChange < -0.3) {
      score -= 10;
      items.push({ type: 'negative', text: `外盘走弱：COMEX ${us.changePercent.toFixed(2)}%` });
    } else if (avgChange < 0) {
      score -= 5;
      items.push({ type: 'negative', text: `外盘偏弱：COMEX ${us.changePercent.toFixed(2)}%` });
    } else {
      items.push({ type: 'neutral', text: '外盘走势分化' });
    }
  }

  // 6. 美元指数影响 (权重15%)
  if (dxy.current > 0) {
    if (dxy.change < -0.2) {
      score += 8;
      items.push({ type: 'positive', text: `美元走弱(${dxy.change.toFixed(2)}%)，利好金价` });
    } else if (dxy.change > 0.2) {
      score -= 8;
      items.push({ type: 'negative', text: `美元走强(${dxy.change.toFixed(2)}%)，压制金价` });
    }
  }

  // 设置结果
  shortTerm.value.score = Math.min(100, Math.max(0, Math.round(score)));
  shortTerm.value.class = score >= 58 ? 'bullish' : score <= 42 ? 'bearish' : 'neutral';
  shortTerm.value.label = score >= 65 ? '强势' : score >= 55 ? '偏多' : score <= 35 ? '弱势' : score <= 45 ? '偏空' : '震荡';

  if (score >= 65) shortTerm.value.suggestion = '趋势强劲，可轻仓顺势做多';
  else if (score >= 55) shortTerm.value.suggestion = '短线偏多，回调可试多';
  else if (score >= 45) shortTerm.value.suggestion = '震荡格局，观望为主';
  else if (score >= 35) shortTerm.value.suggestion = '短线偏弱，谨慎参与';
  else shortTerm.value.suggestion = '空头氛围，建议观望';

  shortAnalysis.value = items;
};

// ========== 中线分析 (技术面50% + 基本面50%) ==========
const analyzeMidTerm = (prices = null) => {
  const au = store.au9999;
  const dxy = store.dxy;

  let score = 50;
  const items = [];
  // 优先使用传入的 prices，避免重复提取
  const priceArray = prices || (au.history || []).map(h => h.price);

  // ===== 技术面分析 (50%权重) =====

  // 1. 趋势强度 (权重25%)
  if (priceArray.length >= 10) {
    const trendStrength = calculateTrendStrength(priceArray, 10);
    const firstAvg = priceArray.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const secondAvg = priceArray.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const trend = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (trend > 0.3 && trendStrength > 50) {
      score += 15;
      items.push({ type: 'positive', text: `上升趋势确立，强度${trendStrength.toFixed(0)}%，涨幅${trend.toFixed(2)}%` });
    } else if (trend > 0.3) {
      score += 8;
      items.push({ type: 'positive', text: `价格重心上移${trend.toFixed(2)}%，趋势形成中` });
    } else if (trend < -0.3 && trendStrength > 50) {
      score -= 15;
      items.push({ type: 'negative', text: `下降趋势确立，强度${trendStrength.toFixed(0)}%` });
    } else if (trend < -0.3) {
      score -= 8;
      items.push({ type: 'negative', text: `价格重心下移${Math.abs(trend).toFixed(2)}%` });
    } else {
      items.push({ type: 'neutral', text: `震荡整理，趋势强度${trendStrength.toFixed(0)}%` });
    }
  }

  // 2. 波动率分析 (权重25%)
  if (priceArray.length >= 15) {
    const stdDev = calculateStdDev(priceArray, 15);
    const avgPrice = priceArray.reduce((a, b) => a + b, 0) / priceArray.length;
    const volatility = (stdDev / avgPrice) * 100;

    if (volatility < 0.5) {
      score += 5;
      items.push({ type: 'positive', text: `波动率低(${volatility.toFixed(2)}%)，趋势稳定` });
    } else if (volatility > 1.5) {
      score -= 5;
      items.push({ type: 'negative', text: `波动率高(${volatility.toFixed(2)}%)，方向不明` });
    } else {
      items.push({ type: 'neutral', text: `波动率正常(${volatility.toFixed(2)}%)` });
    }
  }

  // ===== 基本面分析 (50%权重) =====

  // 3. 汇率因素 (权重25%)
  const rate = store.usdCny;
  if (rate.current > 0) {
    if (rate.change < -0.1) {
      score += 12;
      items.push({ type: 'positive', text: `人民币升值趋势，汇率${rate.current.toFixed(2)}` });
    } else if (rate.change > 0.1) {
      score -= 8;
      items.push({ type: 'negative', text: `人民币贬值，汇率${rate.current.toFixed(2)}` });
    } else {
      items.push({ type: 'neutral', text: `汇率稳定${rate.current.toFixed(2)}` });
    }
  }

  // 4. 美元指数趋势 (权重25%)
  if (dxy.current > 0) {
    if (dxy.current < 103) {
      score += 10;
      items.push({ type: 'positive', text: `美元指数偏低(${dxy.current.toFixed(2)})，利好黄金` });
    } else if (dxy.current > 106) {
      score -= 10;
      items.push({ type: 'negative', text: `美元指数偏高(${dxy.current.toFixed(2)})，压制金价` });
    } else {
      items.push({ type: 'neutral', text: `美元指数中性(${dxy.current.toFixed(2)})` });
    }
  }

  // 5. 内外盘价差
  const spreadInfo = calculatePriceSpread();
  if (spreadInfo.spread !== 0) {
    if (spreadInfo.status === 'premium') {
      items.push({ type: 'neutral', text: `国内溢价${spreadInfo.spread.toFixed(2)}%，需求旺盛` });
    } else if (spreadInfo.status === 'discount') {
      score += 5;
      items.push({ type: 'positive', text: `国内折价${Math.abs(spreadInfo.spread).toFixed(2)}%，配置价值高` });
    } else {
      items.push({ type: 'neutral', text: `内外盘价差正常` });
    }
  }

  // 设置结果
  midTerm.value.score = Math.min(100, Math.max(0, Math.round(score)));
  midTerm.value.class = score >= 58 ? 'bullish' : score <= 42 ? 'bearish' : 'neutral';
  midTerm.value.label = score >= 60 ? '偏多' : score <= 45 ? '偏空' : '震荡';

  if (score >= 60) midTerm.value.suggestion = '逢低分批建仓，目标1-4周';
  else if (score >= 50) midTerm.value.suggestion = '轻仓参与，回调加仓';
  else midTerm.value.suggestion = '观望等待，寻找更好入场点';

  midAnalysis.value = items;
};

// ========== 长线分析 (技术面30% + 基本面70%) ==========
const analyzeLongTerm = () => {
  const au = store.au9999;
  const rate = store.usdCny;
  const dxy = store.dxy;

  let score = 55;
  const items = [];
  const history = au.history || [];
  const prices = history.map(h => h.price);

  // ===== 基本面分析 (70%权重) =====

  // 1. 宏观环境 (权重30%)
  items.push({ type: 'positive', text: '全球央行持续增持黄金，长期支撑金价' });
  score += 12;

  items.push({ type: 'positive', text: '地缘政治风险持续，避险属性凸显' });
  score += 8;

  // 2. 美元周期 (权重20%)
  if (dxy.current > 0) {
    if (dxy.current < 102) {
      score += 10;
      items.push({ type: 'positive', text: `美元指数处于低位(${dxy.current.toFixed(2)})，利好黄金` });
    } else if (dxy.current > 108) {
      score -= 8;
      items.push({ type: 'negative', text: `美元指数高位(${dxy.current.toFixed(2)})，需关注回落信号` });
    } else {
      items.push({ type: 'neutral', text: `美元指数中性区间(${dxy.current.toFixed(2)})` });
    }
  }

  // 3. 汇率长期趋势 (权重20%)
  if (rate.current > 0) {
    if (rate.current < 7.1) {
      score += 8;
      items.push({ type: 'positive', text: `人民币汇率较低(${rate.current.toFixed(2)})，黄金性价比高` });
    } else if (rate.current > 7.3) {
      score -= 5;
      items.push({ type: 'neutral', text: `人民币汇率偏高(${rate.current.toFixed(2)})` });
    } else {
      items.push({ type: 'neutral', text: `汇率稳定区间(${rate.current.toFixed(2)})` });
    }
  }

  // ===== 技术面分析 (30%权重) =====

  // 4. 长期趋势 (权重15%)
  if (prices.length >= 15) {
    const ma5 = calculateSMA(prices, 5);
    const ma15 = calculateSMA(prices, 15);
    if (ma5 && ma15) {
      if (ma5 > ma15 * 1.005) {
        score += 8;
        items.push({ type: 'positive', text: '长期均线多头排列，趋势向上' });
      } else if (ma5 < ma15 * 0.995) {
        score -= 5;
        items.push({ type: 'negative', text: '长期均线空头排列，承压运行' });
      }
    }
  }

  // 5. 当前价格位置 (权重15%)
  if (au.current > 0 && prices.length >= 10) {
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const position = (au.current - low) / (high - low);

    if (position < 0.3) {
      score += 8;
      items.push({ type: 'positive', text: `价格处于区间低位(${(position * 100).toFixed(0)}%)，配置价值高` });
    } else if (position > 0.7) {
      score -= 5;
      items.push({ type: 'neutral', text: `价格处于区间高位(${(position * 100).toFixed(0)}%)，建议分批配置` });
    } else {
      items.push({ type: 'neutral', text: `价格处于区间中位(${(position * 100).toFixed(0)}%)` });
    }
  }

  // 设置结果
  longTerm.value.score = Math.min(100, Math.max(0, Math.round(score)));
  longTerm.value.class = score >= 58 ? 'bullish' : score <= 42 ? 'bearish' : 'neutral';
  longTerm.value.label = score >= 60 ? '看多' : score <= 45 ? '看空' : '中性';

  if (score >= 65) longTerm.value.suggestion = '建议定投配置，长期持有';
  else if (score >= 55) longTerm.value.suggestion = '逢低配置，长期持有';
  else longTerm.value.suggestion = '适度配置，控制仓位';

  longAnalysis.value = items;
};

// 执行完整分析
const performAnalysis = (force = false) => {
  const currentHash = calculateDataHash();
  if (!force && currentHash === lastDataHash.value) return;

  lastDataHash.value = currentHash;

  // 获取历史数据
  const history = store.au9999.history || [];
  const prices = history.map(h => h.price);
  const currentPrice = store.au9999.current;

  // 执行分析（传入 prices 避免重复提取）
  analyzeShortTerm(prices);
  analyzeMidTerm(prices);
  analyzeLongTerm();

  // 计算综合技术指标并追加信号到短线分析（追加而非替换）
  if (prices.length >= 10) {
    const analysis = analyzeTechnicalIndicators(prices, currentPrice);
    technicalIndicators.value = analysis.indicators;

    if (analysis.signals.length > 0 && shortAnalysis.value.length > 0) {
      const existingTexts = shortAnalysis.value.map(i => i.text);
      const newSignals = analysis.signals
        .filter(s => !existingTexts.includes(s.text))
        .slice(0, 3);
      shortAnalysis.value = [...shortAnalysis.value, ...newSignals];
    }
  }
};

// 监听数据变化
watch(() => store.lastUpdate, () => {
  if (store.lastUpdate) performAnalysis();
});

onMounted(() => {
  performAnalysis();
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.analysis-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid $color-border;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba($color-brand, 0.08) 0%, transparent 100%);
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
  font-size: 16px;
}

.panel-subtitle {
  font-size: 9px;
  font-weight: $font-weight-bold;
  color: $color-text-muted;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-left: 22px;
}

.analysis-content {
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

// 分析区域 - 垂直堆叠
.analysis-sections {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
}

.analysis-section {
  background: $color-bg-card-solid;
  border-radius: $border-radius-sm;
  border: 1px solid $color-border;
  overflow: hidden;
  transition: all $transition-fast;
  display: flex;
  flex-direction: column;
  flex: 1; // 填充空间

  &:hover {
    box-shadow: $shadow-md;
  }

  // 顶部：标题 + 分数
  .section-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }

  .term-info {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .term-icon {
    font-size: 18px;
  }

  .term-title {
    font-size: 18px;
    font-weight: $font-weight-semibold;
    color: $color-text;
  }

  .term-badge {
    font-size: 14px;
    color: $color-text-muted;
    background: rgba(255, 255, 255, 0.7);
    padding: 1px 5px;
    border-radius: $border-radius-xs;
  }

  .term-score {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .score-num {
    font-family: $font-display;
    font-size: 28px;
    font-weight: $font-weight-bold;
    line-height: 1;
  }

  .score-status {
    font-size: 16px;
    font-weight: $font-weight-semibold;
    padding: 2px 8px;
    border-radius: $border-radius-xs;

    &.bullish {
      color: $color-up;
      background: $color-up-bg;
    }
    &.neutral {
      color: $color-brand;
      background: rgba($color-brand, 0.1);
    }
    &.bearish {
      color: $color-down;
      background: $color-down-bg;
    }
  }

  // 分析内容
  .section-content {
    padding: 4px 8px;
    min-height: 200px; // 预留7行数据显示空间
    max-height: 200px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .analysis-list {
    .analysis-row {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 18px;
      line-height: 1.5;
      color: $color-text-secondary;
      margin-bottom: 3px;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        margin-top: 8px;
        flex-shrink: 0;

        &.positive { background: $color-up; box-shadow: 0 0 6px rgba($color-up, 0.5); }
        &.negative { background: $color-down; box-shadow: 0 0 6px rgba($color-down, 0.5); }
        &.neutral { background: $color-neutral; }
      }
    }
  }

  // 建议区域 - 分离显示
  .section-footer {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.6);
    border-top: 1px solid $color-border;
    flex-shrink: 0;
    min-height: fit-content;

    .suggestion-tag {
      font-size: 14px;
      color: $color-text-muted;
      background: rgba(255, 255, 255, 0.7);
      padding: 2px 6px;
      border-radius: $border-radius-xs;
      flex-shrink: 0;
    }

    .suggestion-text {
      font-size: 14px;
      font-weight: $font-weight-medium;
      color: $color-text;
      flex: 1;
      line-height: 1.4;
      word-wrap: break-word;
      word-break: break-all;

      &.bullish { color: $color-up; }
      &.neutral { color: $color-brand; }
      &.bearish { color: $color-down; }
    }
  }

  // 边框颜色 - 左边框
  &.short {
    border-left: 3px solid $color-brand;
    .term-icon { color: $color-brand; }
    .score-num { color: $color-brand; text-shadow: 0 0 16px rgba($color-brand, 0.3); }
  }

  &.mid {
    border-left: 3px solid $color-brand;
    .term-icon { color: $color-brand; }
    .score-num { color: $color-brand; text-shadow: 0 0 16px rgba($color-brand, 0.3); }
  }

  &.long {
    border-left: 3px solid #10b981;
    .term-icon { color: #10b981; }
    .score-num { color: #10b981; text-shadow: 0 0 16px rgba(#10b981, 0.3); }
  }

  // 动态分数颜色（覆盖默认）
  &.bullish .score-num { color: $color-up; text-shadow: 0 0 16px rgba($color-up, 0.3); }
  &.bearish .score-num { color: $color-down; text-shadow: 0 0 16px rgba($color-down, 0.3); }
}

// 响应式布局
@media (max-width: 1200px) {
  // 小屏幕下，所有元素垂直排列
  .top-indicators-row {
    flex-direction: column;
    align-items: stretch;
  }
}

// 滚动条
.analysis-content::-webkit-scrollbar,
.analysis-sections::-webkit-scrollbar {
  width: 4px;
}

.analysis-content::-webkit-scrollbar-track,
.analysis-sections::-webkit-scrollbar-track {
  background: transparent;
}

.analysis-content::-webkit-scrollbar-thumb,
.analysis-sections::-webkit-scrollbar-thumb {
  background: rgba($color-brand, 0.3);
  border-radius: 2px;

  &:hover {
    background: rgba($color-brand, 0.5);
  }
}
</style>
