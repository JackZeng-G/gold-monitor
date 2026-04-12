/**
 * 统一请求封装工具
 * 提供重试机制、错误处理、请求拦截等功能
 */

import axios from 'axios';

// 动态配置：开发环境用 localhost，生产环境用当前域名
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8081/api';
  }
  // 生产环境：使用当前页面的协议和主机名
  return `${window.location.protocol}//${window.location.host}/api`;
};

// 配置
const CONFIG = {
  baseURL: getBaseURL(),
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000,
  retryMultiplier: 2,
  maxRetryDelay: 5000
};

// 请求队列，避免重复请求
const requestQueue = new Map();

// 创建 axios 实例
const api = axios.create({
  baseURL: CONFIG.baseURL,
  timeout: CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 错误类型
class APIError extends Error {
  constructor(message, code, response) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.response = response;
    this.timestamp = Date.now();
  }

  toString() {
    return `[APIError ${this.code}] ${this.message}`;
  }
}

class NetworkError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加请求时间戳
    config.metadata = { startTime: Date.now() };

    // 生成请求指纹（用于去重）
    const requestKey = `${config.method}_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`;

    // 检查是否已经有相同的请求在处理中
    if (requestQueue.has(requestKey)) {
      console.debug(`[Request] Duplicate request detected: ${requestKey}`);
      return Promise.reject(new APIError('Duplicate request', 'DUPLICATE_REQUEST'));
    }

    requestQueue.set(requestKey, true);
    config.requestKey = requestKey;

    console.debug(`[Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    return config;
  },
  (error) => {
    console.error('[Request] Interceptor error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { config, data } = response;
    const duration = Date.now() - (config.metadata?.startTime || Date.now());

    // 清理请求队列
    if (config.requestKey) {
      requestQueue.delete(config.requestKey);
    }

    console.debug(`[Response] ${config.method?.toUpperCase()} ${config.url} ${duration}ms`, data);

    // 统一响应格式处理
    if (data.success === false) {
      throw new APIError(data.error || 'Request failed', data.code || 'UNKNOWN_ERROR', response);
    }

    return data.data !== undefined ? data.data : data;
  },
  (error) => {
    const { config } = error;

    // 清理请求队列
    if (config?.requestKey) {
      requestQueue.delete(config.requestKey);
    }

    // 处理取消的请求
    if (axios.isCancel(error)) {
      console.debug('[Request] Request cancelled:', config?.url);
      return Promise.reject(new APIError('Request cancelled', 'CANCELLED'));
    }

    // 网络错误
    if (!error.response) {
      console.error('[Request] Network error:', error.message);
      return Promise.reject(new NetworkError('Network error', error));
    }

    // HTTP 错误
    const { status, data } = error.response;
    let message = 'Request failed';
    let code = 'HTTP_ERROR';

    switch (status) {
      case 400:
        message = data?.error || 'Bad request';
        code = 'BAD_REQUEST';
        break;
      case 401:
        message = 'Unauthorized';
        code = 'UNAUTHORIZED';
        break;
      case 403:
        message = 'Forbidden';
        code = 'FORBIDDEN';
        break;
      case 404:
        message = 'Resource not found';
        code = 'NOT_FOUND';
        break;
      case 429:
        message = 'Too many requests';
        code = 'RATE_LIMITED';
        break;
      case 500:
        message = 'Server error';
        code = 'SERVER_ERROR';
        break;
      case 502:
      case 503:
      case 504:
        message = 'Service unavailable';
        code = 'SERVICE_UNAVAILABLE';
        break;
      default:
        message = `HTTP ${status}`;
    }

    console.error(`[Request] HTTP ${status} ${config?.url}:`, message);
    return Promise.reject(new APIError(message, code, error.response));
  }
);

/**
 * 带重试机制的请求
 * @param {Function} requestFn - 请求函数
 * @param {Object} options - 重试选项
 * @returns {Promise} 请求结果
 */
async function requestWithRetry(requestFn, options = {}) {
  const {
    maxRetries = CONFIG.maxRetries,
    retryDelay = CONFIG.retryDelay,
    retryMultiplier = CONFIG.retryMultiplier,
    maxRetryDelay = CONFIG.maxRetryDelay,
    shouldRetry = defaultShouldRetry
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // 检查是否应该重试
      if (attempt === maxRetries || !shouldRetry(error)) {
        break;
      }

      // 计算重试延迟（指数退避）
      const delay = Math.min(
        retryDelay * Math.pow(retryMultiplier, attempt),
        maxRetryDelay
      );

      console.warn(`[Request] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms:`, error.message);

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 默认重试条件
 * @param {Error} error - 错误对象
 * @returns {boolean} 是否应该重试
 */
function defaultShouldRetry(error) {
  // 网络错误、5xx 错误、429 错误应该重试
  if (error instanceof NetworkError) return true;
  if (error instanceof APIError) {
    return ['SERVER_ERROR', 'SERVICE_UNAVAILABLE', 'RATE_LIMITED'].includes(error.code);
  }
  return false;
}

/**
 * GET 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 查询参数
 * @param {Object} options - 请求选项
 * @returns {Promise} 请求结果
 */
export function get(url, params = {}, options = {}) {
  return requestWithRetry(
    () => api.get(url, { params, ...options }),
    options
  );
}

/**
 * POST 请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} options - 请求选项
 * @returns {Promise} 请求结果
 */
export function post(url, data = {}, options = {}) {
  return requestWithRetry(
    () => api.post(url, data, options),
    options
  );
}

/**
 * PUT 请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} options - 请求选项
 * @returns {Promise} 请求结果
 */
export function put(url, data = {}, options = {}) {
  return requestWithRetry(
    () => api.put(url, data, options),
    options
  );
}

/**
 * DELETE 请求
 * @param {string} url - 请求地址
 * @param {Object} params - 查询参数
 * @param {Object} options - 请求选项
 * @returns {Promise} 请求结果
 */
export function del(url, params = {}, options = {}) {
  return requestWithRetry(
    () => api.delete(url, { params, ...options }),
    options
  );
}

/**
 * 取消所有进行中的请求
 */
export function cancelAllRequests() {
  requestQueue.clear();
  console.debug('[Request] All requests cancelled');
}

/**
 * 获取请求统计信息
 */
export function getRequestStats() {
  return {
    activeRequests: requestQueue.size,
    config: CONFIG
  };
}

// 导出
export default {
  get,
  post,
  put,
  delete: del,
  cancelAllRequests,
  getRequestStats,
  APIError,
  NetworkError
};