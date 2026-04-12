/**
 * 技术指标计算工具集
 * 用于黄金价格走势分析
 *
 * 注意：由于历史数据仅30分钟（360条），部分指标参数已调整
 */

// ========== 移动平均线 ==========

/**
 * 简单移动平均线 (SMA)
 * @param {number[]} prices - 价格数组
 * @param {number} period - 周期
 * @returns {number|null} - SMA值
 */
export const calculateSMA = (prices, period) => {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
};

/**
 * 指数移动平均线 (EMA)
 * @param {number[]} prices - 价格数组
 * @param {number} period - 周期
 * @returns {number|null} - EMA值
 */
export const calculateEMA = (prices, period) => {
  if (prices.length < period) return null;

  const k = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
};

// ========== MACD 指标 ==========

/**
 * 计算 MACD 指标
 * 适配30分钟数据：参数调整为 (6, 13, 4)
 * 标准参数：(12, 26, 9)
 *
 * @param {number[]} prices - 价格数组
 * @param {object} params - 参数 { fastPeriod, slowPeriod, signalPeriod }
 * @returns {object} - { dif, dea, macd, histogram, trend }
 */
export const calculateMACD = (prices, params = {}) => {
  const { fastPeriod = 6, slowPeriod = 13, signalPeriod = 4 } = params;

  if (prices.length < slowPeriod + signalPeriod) {
    return { dif: null, dea: null, macd: null, histogram: null, trend: 'neutral' };
  }

  // 计算 DIF (快线EMA - 慢线EMA)
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);

  if (emaFast === null || emaSlow === null) {
    return { dif: null, dea: null, macd: null, histogram: null, trend: 'neutral' };
  }

  const dif = emaFast - emaSlow;

  // 计算 DEA (DIF的EMA)
  const difArray = [];
  let tempEmaFast = calculateSMA(prices.slice(0, fastPeriod), fastPeriod);
  let tempEmaSlow = calculateSMA(prices.slice(0, slowPeriod), slowPeriod);

  for (let i = slowPeriod; i < prices.length; i++) {
    if (tempEmaFast === null || tempEmaSlow === null) break;

    const kFast = 2 / (fastPeriod + 1);
    const kSlow = 2 / (slowPeriod + 1);

    tempEmaFast = prices[i] * kFast + tempEmaFast * (1 - kFast);
    tempEmaSlow = prices[i] * kSlow + tempEmaSlow * (1 - kSlow);

    difArray.push(tempEmaFast - tempEmaSlow);
  }

  const dea = calculateEMA(difArray, signalPeriod) || 0;
  const macd = (dif - dea) * 2;
  const histogram = macd;

  // 判断趋势
  let trend = 'neutral';
  if (dif > 0 && dea > 0 && dif > dea) {
    trend = 'bullish';
  } else if (dif < 0 && dea < 0 && dif < dea) {
    trend = 'bearish';
  } else if (dif > dea) {
    trend = 'bullish_weak';
  } else if (dif < dea) {
    trend = 'bearish_weak';
  }

  return {
    dif: Number(dif.toFixed(4)),
    dea: Number(dea.toFixed(4)),
    macd: Number(macd.toFixed(4)),
    histogram: Number(histogram.toFixed(4)),
    trend
  };
};

// ========== KDJ 指标 ==========

/**
 * 计算 KDJ 随机指标
 * @param {number[]} prices - 价格数组
 * @param {object} params - 参数 { n, m1, m2 }
 * @returns {object} - { k, d, j, signal }
 */
export const calculateKDJ = (prices, params = {}) => {
  const { n = 9, m1 = 3, m2 = 3 } = params;

  if (prices.length < n) {
    return { k: null, d: null, j: null, signal: 'neutral' };
  }

  // 计算 RSV 序列
  const rsvArray = [];
  for (let i = n - 1; i < prices.length; i++) {
    const periodPrices = prices.slice(i - n + 1, i + 1);
    const highN = Math.max(...periodPrices);
    const lowN = Math.min(...periodPrices);
    const close = prices[i];

    const rsv = highN === lowN ? 50 : ((close - lowN) / (highN - lowN)) * 100;
    rsvArray.push(rsv);
  }

  // 计算 K 值 (RSV的SMA)
  const kArray = [];
  let k = 50; // 初始K值
  for (let i = 0; i < rsvArray.length; i++) {
    k = (k * (m1 - 1) + rsvArray[i]) / m1;
    kArray.push(k);
  }

  // 计算 D 值 (K的SMA)
  let d = 50; // 初始D值
  for (let i = 0; i < kArray.length; i++) {
    d = (d * (m2 - 1) + kArray[i]) / m2;
  }

  // 当前 K 值
  const currentK = kArray[kArray.length - 1];

  // 计算 J 值
  const j = 3 * currentK - 2 * d;

  // 判断信号
  let signal = 'neutral';
  if (j > 100 || currentK > 80) {
    signal = 'overbought'; // 超买
  } else if (j < 0 || currentK < 20) {
    signal = 'oversold'; // 超卖
  } else if (currentK > d && currentK > 50) {
    signal = 'bullish';
  } else if (currentK < d && currentK < 50) {
    signal = 'bearish';
  }

  return {
    k: Number(currentK.toFixed(2)),
    d: Number(d.toFixed(2)),
    j: Number(j.toFixed(2)),
    signal
  };
};

// ========== 威廉指标 ==========

/**
 * 计算威廉指标 (Williams %R)
 * @param {number[]} prices - 价格数组
 * @param {number} period - 周期，默认14
 * @returns {object} - { value, signal }
 */
export const calculateWilliamsR = (prices, period = 14) => {
  if (prices.length < period) {
    return { value: null, signal: 'neutral' };
  }

  const periodPrices = prices.slice(-period);
  const highN = Math.max(...periodPrices);
  const lowN = Math.min(...periodPrices);
  const close = prices[prices.length - 1];

  // Williams %R = (HighN - Close) / (HighN - LowN) * -100
  const value = lowN === highN ? -50 : ((highN - close) / (highN - lowN)) * -100;

  // 判断信号
  let signal = 'neutral';
  if (value > -20) {
    signal = 'overbought'; // 超买
  } else if (value < -80) {
    signal = 'oversold'; // 超卖
  } else if (value > -50) {
    signal = 'bullish';
  } else {
    signal = 'bearish';
  }

  return {
    value: Number(value.toFixed(2)),
    signal
  };
};

// ========== RSI 指标 ==========

/**
 * 计算相对强弱指标 (RSI)
 * @param {number[]} prices - 价格数组
 * @param {number} period - 周期，默认14
 * @returns {object} - { value, signal }
 */
export const calculateRSI = (prices, period = 14) => {
  if (prices.length < period + 1) {
    return { value: null, signal: 'neutral' };
  }

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  if (losses === 0) {
    return { value: 100, signal: 'overbought' };
  }

  const rs = gains / losses;
  const value = 100 - (100 / (1 + rs));

  // 判断信号
  let signal = 'neutral';
  if (value > 70) {
    signal = 'overbought';
  } else if (value < 30) {
    signal = 'oversold';
  } else if (value > 50) {
    signal = 'bullish';
  } else {
    signal = 'bearish';
  }

  return {
    value: Number(value.toFixed(2)),
    signal
  };
};

// ========== 布林带 ==========

/**
 * 计算布林带
 * @param {number[]} prices - 价格数组
 * @param {number} period - 周期，默认20
 * @param {number} stdDevMultiplier - 标准差倍数，默认2
 * @returns {object} - { upper, middle, lower, bandwidth, position }
 */
export const calculateBollingerBands = (prices, period = 20, stdDevMultiplier = 2) => {
  const adjustedPeriod = Math.min(period, prices.length);
  if (adjustedPeriod < 5) {
    return { upper: null, middle: null, lower: null, bandwidth: null, position: null };
  }

  const slice = prices.slice(-adjustedPeriod);
  const middle = slice.reduce((a, b) => a + b, 0) / adjustedPeriod;

  // 计算标准差
  const squaredDiffs = slice.map(p => Math.pow(p - middle, 2));
  const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / adjustedPeriod);

  const upper = middle + stdDevMultiplier * stdDev;
  const lower = middle - stdDevMultiplier * stdDev;
  const bandwidth = ((upper - lower) / middle) * 100;

  // 计算当前价格在布林带中的位置 (0-1)
  const currentPrice = prices[prices.length - 1];
  const position = (currentPrice - lower) / (upper - lower);

  return {
    upper: Number(upper.toFixed(2)),
    middle: Number(middle.toFixed(2)),
    lower: Number(lower.toFixed(2)),
    bandwidth: Number(bandwidth.toFixed(2)),
    position: Number(position.toFixed(3))
  };
};

// ========== ATR (真实波动幅度) ==========

/**
 * 计算 ATR
 * @param {number[]} prices - 价格数组
 * @param {number} period - 周期，默认14
 * @returns {number} - ATR值
 */
export const calculateATR = (prices, period = 14) => {
  if (prices.length < 2) {
    return prices[0] * 0.008 || 5;
  }

  const tr = [];
  for (let i = 1; i < prices.length; i++) {
    const prevClose = prices[i - 1];
    const currPrice = prices[i];
    const high = Math.max(currPrice, prevClose);
    const low = Math.min(currPrice, prevClose);
    tr.push(high - low);
  }

  const lookback = Math.min(period, tr.length);
  const sum = tr.slice(-lookback).reduce((a, b) => a + b, 0);
  return sum / lookback || prices[prices.length - 1] * 0.005;
};

// ========== 综合分析 ==========

/**
 * 综合技术指标分析
 * @param {number[]} prices - 价格数组
 * @param {number} currentPrice - 当前价格
 * @returns {object} - 综合分析结果
 */
export const analyzeTechnicalIndicators = (prices, currentPrice) => {
  const macd = calculateMACD(prices);
  const kdj = calculateKDJ(prices);
  const williamsR = calculateWilliamsR(prices);
  const rsi = calculateRSI(prices);
  const bollingerBands = calculateBollingerBands(prices);

  // 计算综合分数
  let score = 50;
  const signals = [];

  // MACD 信号 (权重 25%)
  if (macd.trend === 'bullish') {
    score += 12;
    signals.push({ indicator: 'MACD', type: 'positive', text: `MACD多头运行，DIF=${macd.dif.toFixed(2)}` });
  } else if (macd.trend === 'bearish') {
    score -= 12;
    signals.push({ indicator: 'MACD', type: 'negative', text: `MACD空头运行，DIF=${macd.dif.toFixed(2)}` });
  } else if (macd.trend === 'bullish_weak') {
    score += 5;
    signals.push({ indicator: 'MACD', type: 'positive', text: 'MACD金叉形成中' });
  } else if (macd.trend === 'bearish_weak') {
    score -= 5;
    signals.push({ indicator: 'MACD', type: 'negative', text: 'MACD死叉风险' });
  }

  // KDJ 信号 (权重 25%)
  if (kdj.signal === 'overbought') {
    score -= 10;
    signals.push({ indicator: 'KDJ', type: 'negative', text: `KDJ超买(K=${kdj.k.toFixed(1)})，回调风险` });
  } else if (kdj.signal === 'oversold') {
    score += 10;
    signals.push({ indicator: 'KDJ', type: 'positive', text: `KDJ超卖(K=${kdj.k.toFixed(1)})，反弹机会` });
  } else if (kdj.signal === 'bullish') {
    score += 8;
    signals.push({ indicator: 'KDJ', type: 'positive', text: `KDJ多头(K=${kdj.k.toFixed(1)})` });
  } else if (kdj.signal === 'bearish') {
    score -= 8;
    signals.push({ indicator: 'KDJ', type: 'negative', text: `KDJ空头(K=${kdj.k.toFixed(1)})` });
  }

  // RSI 信号 (权重 20%)
  if (rsi.signal === 'overbought') {
    score -= 8;
    signals.push({ indicator: 'RSI', type: 'negative', text: `RSI超买(${rsi.value.toFixed(1)})` });
  } else if (rsi.signal === 'oversold') {
    score += 8;
    signals.push({ indicator: 'RSI', type: 'positive', text: `RSI超卖(${rsi.value.toFixed(1)})` });
  } else if (rsi.signal === 'bullish') {
    score += 5;
    signals.push({ indicator: 'RSI', type: 'positive', text: `RSI偏强(${rsi.value.toFixed(1)})` });
  } else if (rsi.signal === 'bearish') {
    score -= 5;
    signals.push({ indicator: 'RSI', type: 'negative', text: `RSI偏弱(${rsi.value.toFixed(1)})` });
  }

  // 布林带位置 (权重 15%)
  if (bollingerBands.position !== null) {
    if (bollingerBands.position > 0.9) {
      score -= 6;
      signals.push({ indicator: 'BOLL', type: 'negative', text: '触及布林上轨，回调压力' });
    } else if (bollingerBands.position < 0.1) {
      score += 6;
      signals.push({ indicator: 'BOLL', type: 'positive', text: '触及布林下轨，反弹机会' });
    } else if (bollingerBands.position > 0.7) {
      score += 3;
      signals.push({ indicator: 'BOLL', type: 'positive', text: '布林带上行区间' });
    } else if (bollingerBands.position < 0.3) {
      score -= 3;
      signals.push({ indicator: 'BOLL', type: 'negative', text: '布林带下行区间' });
    }
  }

  // 威廉指标 (权重 15%)
  if (williamsR.signal === 'overbought') {
    score -= 5;
    signals.push({ indicator: 'W%R', type: 'negative', text: `威廉指标超买(${williamsR.value.toFixed(1)})` });
  } else if (williamsR.signal === 'oversold') {
    score += 5;
    signals.push({ indicator: 'W%R', type: 'positive', text: `威廉指标超卖(${williamsR.value.toFixed(1)})` });
  }

  // 确保分数在0-100之间
  score = Math.max(0, Math.min(100, Math.round(score)));

  // 判断整体趋势
  let overallTrend = 'neutral';
  if (score >= 65) overallTrend = 'strong_bullish';
  else if (score >= 55) overallTrend = 'bullish';
  else if (score <= 35) overallTrend = 'strong_bearish';
  else if (score <= 45) overallTrend = 'bearish';

  return {
    score,
    overallTrend,
    signals,
    indicators: {
      macd,
      kdj,
      rsi,
      williamsR,
      bollingerBands
    }
  };
};

