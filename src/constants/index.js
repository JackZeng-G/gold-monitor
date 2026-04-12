/**
 * 应用常量配置
 */

// API 基础地址
export const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8081'
  : window.location.origin;

// 单位换算
export const OZ_TO_GRAM = 31.1035; // 1盎司 = 31.1035克
export const DEFAULT_USD_CNY_RATE = 7.2; // 默认美元人民币汇率

// 数据源名称映射
export const DATA_SOURCE_NAMES = {
  sina: '新浪财经',
  eastmoney: '东方财富',
  gate: 'Gate.io',
  mixed: '混合数据源'
};

// 刷新间隔配置（毫秒）
export const REFRESH_INTERVALS = {
  active: 5000,
  normal: 10000,
  calm: 20000,
  inactive: 30000
};

// 历史数据配置
export const MAX_HISTORY_LENGTH = 360; // 约30分钟，5秒刷新一次
export const HISTORY_MAX_AGE = 30 * 60 * 1000; // 30分钟

// 不显示涨跌的数据类型
export const NO_CHANGE_DISPLAY_KEYS = [];

// Toast 自动消失时间（毫秒）
export const TOAST_AUTO_DISMISS = 5000;
