/**
 * 格式化工具函数
 */

/**
 * 格式化价格
 * @param {number|string} price - 价格值
 * @param {boolean} isRate - 是否为汇率（汇率显示4位小数）
 * @returns {string} 格式化后的价格
 */
export function formatPrice(price, isRate = false) {
  if (!price && price !== 0) return '--';
  if (typeof price === 'string') return price;
  return price.toFixed(isRate ? 4 : 2);
}

/**
 * 格式化涨跌值
 * @param {number} change - 涨跌值
 * @returns {string} 格式化后的涨跌值（带正负号）
 */
export function formatChange(change) {
  if (!change && change !== 0) return '--';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

/**
 * 格式化涨跌幅
 * @param {number} percent - 涨跌幅百分比
 * @returns {string} 格式化后的涨跌幅（带正负号和%）
 */
export function formatPercent(percent) {
  if (!percent && percent !== 0) return '--%';
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent?.toFixed(2) || '0.00'}%`;
}

/**
 * 格式化时间
 * @param {Date|number|string} date - 日期对象、时间戳或日期字符串
 * @param {string} format - 格式类型 'time'|'datetime'|'full'
 * @returns {string} 格式化后的时间
 */
export function formatTime(date, format = 'time') {
  if (!date) return '--';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '--';

  const pad = (n) => n.toString().padStart(2, '0');

  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (format) {
    case 'time':
      return time.slice(0, 5); // HH:MM
    case 'datetime':
      return `${dateStr} ${time.slice(0, 5)}`;
    case 'full':
      return `${dateStr} ${time}`;
    default:
      return time;
  }
}

/**
 * 格式化大数字（带单位）
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字
 */
export function formatLargeNumber(num) {
  if (!num && num !== 0) return '--';

  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T';
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}

/**
 * 计算趋势方向
 * @param {number} value - 数值
 * @returns {'up'|'down'|'flat'} 趋势方向
 */
export function getTrend(value) {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}
