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

// ========== 风险评估 ==========

/**
 * 计算风险等级 (1-5级)
 * @param {number[]} prices - 价格数组
 * @param {object} indicators - 技术指标对象
 * @returns {object} - { level, factors, description }
 */
export const calculateRiskLevel = (prices, indicators) => {
  if (prices.length < 10) {
    return { level: 3, factors: [], description: '数据不足，风险中等' };
  }

  const factors = [];
  let riskScore = 3; // 基准风险3级

  // 1. 波动率风险
  const slice = prices.slice(-20);
  const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
  const squaredDiffs = slice.map(p => Math.pow(p - avg, 2));
  const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / slice.length);
  const volatility = (stdDev / avg) * 100;

  if (volatility > 1.5) {
    riskScore += 0.5;
    factors.push({ type: 'volatility', level: 'high', text: `波动率较高(${volatility.toFixed(2)}%)` });
  } else if (volatility < 0.5) {
    riskScore -= 0.3;
    factors.push({ type: 'volatility', level: 'low', text: `波动率较低(${volatility.toFixed(2)}%)` });
  }

  // 2. 超买超卖风险
  if (indicators?.kdj?.signal === 'overbought' || indicators?.rsi?.signal === 'overbought') {
    riskScore += 0.5;
    factors.push({ type: 'momentum', level: 'high', text: '技术指标超买，回调风险' });
  }
  if (indicators?.kdj?.signal === 'oversold' || indicators?.rsi?.signal === 'oversold') {
    riskScore += 0.3;
    factors.push({ type: 'momentum', level: 'medium', text: '技术指标超卖，反弹可能' });
  }

  // 3. 趋势风险
  if (indicators?.macd?.trend === 'bearish' || indicators?.macd?.trend === 'bearish_weak') {
    riskScore += 0.3;
    factors.push({ type: 'trend', level: 'medium', text: 'MACD空头趋势' });
  }

  // 4. 布林带带宽风险
  if (indicators?.bollingerBands?.bandwidth > 4) {
    riskScore += 0.4;
    factors.push({ type: 'bandwidth', level: 'high', text: '布林带带宽扩大，波动加剧' });
  }

  // 确保风险等级在1-5之间
  const level = Math.max(1, Math.min(5, Math.round(riskScore)));

  // 风险描述
  const descriptions = {
    1: '风险极低，适合积极操作',
    2: '风险较低，可适度参与',
    3: '风险中等，谨慎操作',
    4: '风险较高，建议观望',
    5: '风险极高，建议回避'
  };

  return {
    level,
    factors,
    description: descriptions[level]
  };
};

// ========== 价格形态识别 ==========

/**
 * 识别价格形态（双底、双顶、三角形态等）
 * @param {number[]} prices - 价格数组
 * @returns {object} - { patterns, confidence, description }
 */
export const detectPricePatterns = (prices) => {
  if (prices.length < 30) {
    return {
      patterns: [],
      confidence: 'low',
      description: '数据不足，无法识别形态'
    };
  }

  const patterns = [];
  const recentPrices = prices.slice(-60); // 分析最近60个数据点

  // 1. 双底检测 (W底)
  const doubleBottom = detectDoubleBottom(recentPrices);
  if (doubleBottom.detected) {
    patterns.push({
      type: 'double_bottom',
      name: '双底 (W底)',
      direction: 'bullish',
      confidence: doubleBottom.confidence,
      description: '可能形成底部反转，关注突破颈线位',
      levels: doubleBottom.levels
    });
  }

  // 2. 双顶检测 (M头)
  const doubleTop = detectDoubleTop(recentPrices);
  if (doubleTop.detected) {
    patterns.push({
      type: 'double_top',
      name: '双顶 (M头)',
      direction: 'bearish',
      confidence: doubleTop.confidence,
      description: '可能形成顶部反转，注意跌破颈线位',
      levels: doubleTop.levels
    });
  }

  // 3. 上升三角形检测
  const ascendingTriangle = detectAscendingTriangle(recentPrices);
  if (ascendingTriangle.detected) {
    patterns.push({
      type: 'ascending_triangle',
      name: '上升三角形',
      direction: 'bullish',
      confidence: ascendingTriangle.confidence,
      description: '看涨形态，突破阻力位可追多',
      levels: ascendingTriangle.levels
    });
  }

  // 4. 下降三角形检测
  const descendingTriangle = detectDescendingTriangle(recentPrices);
  if (descendingTriangle.detected) {
    patterns.push({
      type: 'descending_triangle',
      name: '下降三角形',
      direction: 'bearish',
      confidence: descendingTriangle.confidence,
      description: '看跌形态，跌破支撑位宜观望',
      levels: descendingTriangle.levels
    });
  }

  // 5. 头肩底检测
  const headShouldersBottom = detectHeadShouldersBottom(recentPrices);
  if (headShouldersBottom.detected) {
    patterns.push({
      type: 'head_shoulders_bottom',
      name: '头肩底',
      direction: 'bullish',
      confidence: headShouldersBottom.confidence,
      description: '强烈看涨反转形态，突破颈线后确认',
      levels: headShouldersBottom.levels
    });
  }

  // 6. 头肩顶检测
  const headShouldersTop = detectHeadShouldersTop(recentPrices);
  if (headShouldersTop.detected) {
    patterns.push({
      type: 'head_shoulders_top',
      name: '头肩顶',
      direction: 'bearish',
      confidence: headShouldersTop.confidence,
      description: '强烈看跌反转形态，跌破颈线后确认',
      levels: headShouldersTop.levels
    });
  }

  // 按置信度排序
  patterns.sort((a, b) => b.confidence - a.confidence);

  // 计算整体置信度
  const overallConfidence = patterns.length > 0
    ? patterns[0].confidence
    : 'none';

  // 生成描述
  let description = '';
  if (patterns.length === 0) {
    description = '暂无明显价格形态';
  } else if (patterns.length === 1) {
    description = `检测到${patterns[0].name}`;
  } else {
    description = `检测到${patterns.length}种形态，主要: ${patterns[0].name}`;
  }

  return {
    patterns: patterns.slice(0, 3), // 最多返回3个形态
    confidence: overallConfidence,
    description
  };
};

/**
 * 检测双底形态
 */
const detectDoubleBottom = (prices) => {
  const len = prices.length;
  if (len < 20) return { detected: false };

  // 寻找局部低点
  const lows = [];
  for (let i = 5; i < len - 5; i++) {
    if (prices[i] === Math.min(...prices.slice(i - 5, i + 6))) {
      lows.push({ index: i, price: prices[i] });
    }
  }

  if (lows.length < 2) return { detected: false };

  // 检查是否有两个相近的低点
  for (let i = 0; i < lows.length - 1; i++) {
    const low1 = lows[i];
    const low2 = lows[i + 1];

    // 两底高度差小于1%
    const heightDiff = Math.abs(low1.price - low2.price) / low1.price;
    // 两底之间有一定间隔（至少10个点）
    const distance = low2.index - low1.index;

    if (heightDiff < 0.01 && distance >= 10 && distance <= 30) {
      // 计算颈线位（两底之间的最高点）
      const necklineHigh = Math.max(...prices.slice(low1.index, low2.index + 1));
      const currentPrice = prices[len - 1];
      const proximityToNeckline = Math.abs(currentPrice - necklineHigh) / necklineHigh;

      let confidence = 'medium';
      if (heightDiff < 0.005 && proximityToNeckline < 0.01) {
        confidence = 'high';
      } else if (heightDiff > 0.008) {
        confidence = 'low';
      }

      return {
        detected: true,
        confidence,
        levels: {
          low1: low1.price,
          low2: low2.price,
          neckline: necklineHigh
        }
      };
    }
  }

  return { detected: false };
};

/**
 * 检测双顶形态
 */
const detectDoubleTop = (prices) => {
  const len = prices.length;
  if (len < 20) return { detected: false };

  // 寻找局部高点
  const highs = [];
  for (let i = 5; i < len - 5; i++) {
    if (prices[i] === Math.max(...prices.slice(i - 5, i + 6))) {
      highs.push({ index: i, price: prices[i] });
    }
  }

  if (highs.length < 2) return { detected: false };

  // 检查是否有两个相近的高点
  for (let i = 0; i < highs.length - 1; i++) {
    const high1 = highs[i];
    const high2 = highs[i + 1];

    // 两顶高度差小于1%
    const heightDiff = Math.abs(high1.price - high2.price) / high1.price;
    // 两顶之间有一定间隔
    const distance = high2.index - high1.index;

    if (heightDiff < 0.01 && distance >= 10 && distance <= 30) {
      // 计算颈线位（两顶之间的最低点）
      const necklineLow = Math.min(...prices.slice(high1.index, high2.index + 1));
      const currentPrice = prices[len - 1];
      const proximityToNeckline = Math.abs(currentPrice - necklineLow) / necklineLow;

      let confidence = 'medium';
      if (heightDiff < 0.005 && proximityToNeckline < 0.01) {
        confidence = 'high';
      } else if (heightDiff > 0.008) {
        confidence = 'low';
      }

      return {
        detected: true,
        confidence,
        levels: {
          high1: high1.price,
          high2: high2.price,
          neckline: necklineLow
        }
      };
    }
  }

  return { detected: false };
};

/**
 * 检测上升三角形
 */
const detectAscendingTriangle = (prices) => {
  const len = prices.length;
  if (len < 25) return { detected: false };

  // 检查是否有水平阻力位
  const recentSlice = prices.slice(-25);
  const maxHigh = Math.max(...recentSlice);
  const resistanceHits = recentSlice.filter(p => p >= maxHigh * 0.998).length;

  // 检查低点是否逐渐抬高
  const lows = [];
  for (let i = 5; i < recentSlice.length - 5; i++) {
    if (recentSlice[i] === Math.min(...recentSlice.slice(i - 5, i + 6))) {
      lows.push(recentSlice[i]);
    }
  }

  if (lows.length < 3) return { detected: false };

  // 检查低点上升趋势
  let risingLows = 0;
  for (let i = 1; i < lows.length; i++) {
    if (lows[i] > lows[i - 1]) risingLows++;
  }

  const hasRisingLows = risingLows >= lows.length * 0.6;
  const hasResistance = resistanceHits >= 2;

  if (hasRisingLows && hasResistance) {
    return {
      detected: true,
      confidence: risingLows >= lows.length * 0.8 ? 'high' : 'medium',
      levels: {
        resistance: maxHigh,
        support: lows[lows.length - 1]
      }
    };
  }

  return { detected: false };
};

/**
 * 检测下降三角形
 */
const detectDescendingTriangle = (prices) => {
  const len = prices.length;
  if (len < 25) return { detected: false };

  // 检查是否有水平支撑位
  const recentSlice = prices.slice(-25);
  const minLow = Math.min(...recentSlice);
  const supportHits = recentSlice.filter(p => p <= minLow * 1.002).length;

  // 检查高点是否逐渐降低
  const highs = [];
  for (let i = 5; i < recentSlice.length - 5; i++) {
    if (recentSlice[i] === Math.max(...recentSlice.slice(i - 5, i + 6))) {
      highs.push(recentSlice[i]);
    }
  }

  if (highs.length < 3) return { detected: false };

  // 检查高点下降趋势
  let fallingHighs = 0;
  for (let i = 1; i < highs.length; i++) {
    if (highs[i] < highs[i - 1]) fallingHighs++;
  }

  const hasFallingHighs = fallingHighs >= highs.length * 0.6;
  const hasSupport = supportHits >= 2;

  if (hasFallingHighs && hasSupport) {
    return {
      detected: true,
      confidence: fallingHighs >= highs.length * 0.8 ? 'high' : 'medium',
      levels: {
        support: minLow,
        resistance: highs[highs.length - 1]
      }
    };
  }

  return { detected: false };
};

/**
 * 检测头肩底形态
 */
const detectHeadShouldersBottom = (prices) => {
  const len = prices.length;
  if (len < 35) return { detected: false };

  // 寻找关键点：左肩、头、右肩
  const lows = [];
  for (let i = 5; i < len - 5; i++) {
    if (prices[i] === Math.min(...prices.slice(i - 5, i + 6))) {
      lows.push({ index: i, price: prices[i] });
    }
  }

  if (lows.length < 3) return { detected: false };

  // 尝试找到三个低点模式：左肩 - 头 - 右肩
  for (let i = 0; i < lows.length - 2; i++) {
    const leftShoulder = lows[i];
    const head = lows[i + 1];
    const rightShoulder = lows[i + 2];

    // 头应该比两肩都低
    const headLower = head.price < leftShoulder.price && head.price < rightShoulder.price;
    // 两肩高度相近
    const shouldersSimilar = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price < 0.02;
    // 头比两肩明显更低
    const headSignificantlyLower = (leftShoulder.price - head.price) / leftShoulder.price > 0.005;

    if (headLower && shouldersSimilar && headSignificantlyLower) {
      // 计算颈线位（左肩前的最高点）
      const necklineStart = Math.max(...prices.slice(0, leftShoulder.index));
      const currentPrice = prices[len - 1];

      return {
        detected: true,
        confidence: shouldersSimilar && Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price < 0.01 ? 'high' : 'medium',
        levels: {
          leftShoulder: leftShoulder.price,
          head: head.price,
          rightShoulder: rightShoulder.price,
          neckline: necklineStart
        }
      };
    }
  }

  return { detected: false };
};

/**
 * 检测头肩顶形态
 */
const detectHeadShouldersTop = (prices) => {
  const len = prices.length;
  if (len < 35) return { detected: false };

  // 寻找关键点：左肩、头、右肩
  const highs = [];
  for (let i = 5; i < len - 5; i++) {
    if (prices[i] === Math.max(...prices.slice(i - 5, i + 6))) {
      highs.push({ index: i, price: prices[i] });
    }
  }

  if (highs.length < 3) return { detected: false };

  // 尝试找到三个高点模式：左肩 - 头 - 右肩
  for (let i = 0; i < highs.length - 2; i++) {
    const leftShoulder = highs[i];
    const head = highs[i + 1];
    const rightShoulder = highs[i + 2];

    // 头应该比两肩都高
    const headHigher = head.price > leftShoulder.price && head.price > rightShoulder.price;
    // 两肩高度相近
    const shouldersSimilar = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price < 0.02;
    // 头比两肩明显更高
    const headSignificantlyHigher = (head.price - leftShoulder.price) / leftShoulder.price > 0.005;

    if (headHigher && shouldersSimilar && headSignificantlyHigher) {
      // 计算颈线位（左肩前的最低点）
      const necklineStart = Math.min(...prices.slice(0, leftShoulder.index));
      const currentPrice = prices[len - 1];

      return {
        detected: true,
        confidence: shouldersSimilar && Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price < 0.01 ? 'high' : 'medium',
        levels: {
          leftShoulder: leftShoulder.price,
          head: head.price,
          rightShoulder: rightShoulder.price,
          neckline: necklineStart
        }
      };
    }
  }

  return { detected: false };
};
