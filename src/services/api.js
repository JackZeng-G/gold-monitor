import request from '@/utils/request';

// API 端点路径
const ENDPOINTS = {
  allPrices: '/gold/prices',
  source: '/gold/source'
};

/**
 * 获取所有黄金价格数据
 */
export async function fetchAllPrices(options = {}) {
  return request.get(ENDPOINTS.allPrices, {}, options);
}

/**
 * 设置数据源
 */
export async function setDataSource(source) {
  return request.post(ENDPOINTS.source, { source });
}

/**
 * 获取K线数据
 */
export async function fetchKlineData(symbol, period = 'day') {
  return request.get(`/kline/symbol/${symbol}`, { period });
}

/**
 * 获取黄金资讯
 */
export async function fetchNews() {
  return request.get('/news');
}