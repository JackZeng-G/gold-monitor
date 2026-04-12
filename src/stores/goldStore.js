import { defineStore } from 'pinia';
import { fetchAllPrices, setDataSource as setApiDataSource } from '@/services/api';
import { wsService } from '@/services/websocket';
import { offlineStorage } from '@/services/offlineStorage';
import { dataRecovery } from '@/services/dataRecovery';
import { networkService } from '@/services/networkService';
import { MAX_HISTORY_LENGTH, HISTORY_MAX_AGE, REFRESH_INTERVALS } from '@/constants';

// 智能轮询配置
const SMART_POLLING = {
  // 轮询间隔（毫秒）- 使用统一常量
  intervals: REFRESH_INTERVALS,
  // 模式切换阈值（毫秒）
  thresholds: {
    activeToNormal: 60000,   // 1分钟无变化 → 正常
    normalToCalm: 120000,    // 2分钟无变化 → 平静
    calmToInactive: 300000   // 5分钟无变化 → 不活跃
  }
};

// 防抖保存定时器 - 已废弃，改用 $subscribe
// let saveTimer = null;
// HTTP 轮询定时器
let httpPollingTimer = null;
// 请求去重
let pendingRequest = null;
let lastRequestTime = 0;
const REQUEST_DEDUP_INTERVAL = 1000; // 1秒内不重复请求
// 智能轮询状态
let lastDataChangeTime = Date.now();
let currentPollingMode = 'active';
// $subscribe 订阅器 ID
let subscribeSetup = false;

// 从 localStorage 加载历史数据
const loadHistoryFromStorage = () => {
  try {
    const stored = localStorage.getItem('gold-history-data');
    if (stored) {
      const data = JSON.parse(stored);
      // 检查数据是否过期
      if (data.timestamp && Date.now() - data.timestamp < HISTORY_MAX_AGE) {
        const history = data.history || {};
        // 过滤掉无效数据（价格<=0或时间过期）
        const now = Date.now();
        let hasValidData = false;
        for (const key in history) {
          if (Array.isArray(history[key])) {
            history[key] = history[key].filter(
              item => item.price > 0 && (now - item.timestamp < HISTORY_MAX_AGE)
            );
            // 检查是否有有效变化的价格（至少2个不同价格）
            const prices = history[key].map(h => h.price);
            const uniquePrices = [...new Set(prices)];
            if (uniquePrices.length >= 2) {
              hasValidData = true;
            } else if (prices.length > 0) {
              // 如果所有价格都一样，清空该历史
              console.log(`Clearing ${key} history: all prices are the same (${uniquePrices[0]})`);
              history[key] = [];
            }
          }
        }
        // 如果没有任何有效数据，返回空对象
        if (!hasValidData) {
          console.log('No valid history data found, starting fresh');
          return {};
        }
        return history;
      }
    }
  } catch (e) {
    console.warn('Failed to load history from storage:', e);
    localStorage.removeItem('gold-history-data');
  }
  return {};
};

// 保存历史数据到 localStorage
const saveHistoryToStorage = (historyData) => {
  try {
    localStorage.setItem('gold-history-data', JSON.stringify({
      timestamp: Date.now(),
      history: historyData
    }));
  } catch (e) {
    console.warn('Failed to save history to storage:', e);
  }
};

// 初始化历史数据
const initialHistory = loadHistoryFromStorage();

export const useGoldStore = defineStore('gold', {
  state: () => ({
    // 数据源
    dataSource: localStorage.getItem('dataSource') || 'sina',
    // Au9999 上海黄金现货
    au9999: {
      name: 'Au9999',
      symbol: 'AU9999',
      current: 0,
      prevClose: 0,
      change: 0,
      changePercent: 0,
      currency: 'CNY',
      history: initialHistory.au9999 || []
    },
    // 美国黄金期货
    usFutures: {
      name: '美国期货',
      symbol: 'GC',
      current: 0,
      prevClose: 0,
      change: 0,
      changePercent: 0,
      currency: 'USD',
      history: initialHistory.usFutures || []
    },
    // 英国/伦敦黄金
    ukFutures: {
      name: '伦敦金',
      symbol: 'XAU',
      current: 0,
      prevClose: 0,
      change: 0,
      changePercent: 0,
      currency: 'USD',
      history: initialHistory.ukFutures || []
    },
    // 美元人民币汇率
    usdCny: {
      name: '人民币汇率',
      symbol: 'USD/CNY',
      current: 0,
      prevClose: 0,
      change: 0,
      changePercent: 0,
      currency: 'RATE',
      history: initialHistory.usdCny || []
    },
    // 美元指数
    dxy: {
      name: '美元指数',
      symbol: 'DXY',
      current: 0,
      prevClose: 0,
      change: 0,
      changePercent: 0,
      currency: 'INDEX',
      history: initialHistory.dxy || []
    },
    // PAXG (Paxos Gold) - 国际暗金
    paxg: {
      name: '国际暗金',
      symbol: 'PAXG',
      current: 0,
      prevClose: 0,
      change: 0,
      changePercent: 0,
      currency: 'USD',
      history: initialHistory.paxg || []
    },
    lastUpdate: null,
    isLoading: false,
    error: null,
    // WebSocket 状态
    wsConnected: false,
    wsReconnecting: false,
    useWebSocket: true, // 是否使用 WebSocket
    // 价格变动闪烁状态
    priceFlash: {
      au9999: false,
      usFutures: false,
      ukFutures: false,
      usdCny: false,
      dxy: false,
      paxg: false
    },
    // 同步状态
    syncStatus: 'offline', // offline, connecting, connected, error
    syncStats: {
      recordCount: 0,
      lastUpdate: null,
      latency: '--'
    },
    isOfflineMode: false,
    lastFetchTime: null, // 用于计算延迟
    // 智能轮询状态
    pollingMode: 'active', // active, normal, calm, inactive
    // 网络状态
    networkStatus: {
      isOnline: navigator.onLine,
      connectionType: 'unknown',
      offlineDuration: 0
    },
    // 数据源状态
    sourceStatus: {
      sina: 'ok',       // 新浪 - au9999, ukFutures, usdCny, dxy
      eastmoney: 'ok',  // 东财 - usFutures K线
      gate: 'ok'        // Gate.io - paxg
    }
  }),

  getters: {
    // 格式化的最后更新时间
    formattedLastUpdate: (state) => {
      if (!state.lastUpdate) return '--';
      const date = new Date(state.lastUpdate);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    // 是否显示离线模式
    showOfflineWarning: (state) => {
      return state.syncStatus === 'offline' || state.syncStatus === 'error';
    },
    // 获取正常数据源数量
    healthySourceCount: (state) => {
      return Object.values(state.sourceStatus).filter(s => s === 'ok').length;
    }
  },

  actions: {
    /**
     * 保存数据到离线存储
     */
    async saveToOfflineStorage(key, data) {
      try {
        const sourceMap = {
          au9999: 'au9999',
          usFutures: 'usFutures',
          ukFutures: 'ukFutures',
          usdCny: 'usdCny',
          dxy: 'dxy',
          paxg: 'paxg'
        };
        const source = sourceMap[key];
        if (source && data.current > 0) {
          await offlineStorage.savePriceData(source, data);
        }
      } catch (error) {
        console.warn(`[Store] Failed to save ${key} to offline storage:`, error);
      }
    },

    /**
     * 更新同步状态
     */
    updateSyncStatus(status, latency = null) {
      this.syncStatus = status;
      if (latency !== null) {
        this.syncStats.latency = latency;
      }
      this.isOfflineMode = status === 'offline' || status === 'error';
    },

    /**
     * 从离线存储恢复数据
     */
    async recoverFromOffline() {
      try {
        console.log('[Store] Starting offline recovery...');
        const offlineData = await offlineStorage.getLatestPrices();

        // 更新各个数据源
        const keyMap = {
          au9999: 'au9999',
          usFutures: 'usFutures',
          ukFutures: 'ukFutures',
          usdCny: 'usdCny',
          dxy: 'dxy',
          paxg: 'paxg'
        };

        for (const [source, key] of Object.entries(keyMap)) {
          if (offlineData[source] && offlineData[source].price > 0) {
            const data = offlineData[source];
            this[key] = {
              ...this[key],
              current: data.price,
              prevClose: data.prevClose || this[key].prevClose,
              change: data.change || 0,
              changePercent: data.changePercent || 0,
              currency: data.currency || this[key].currency
            };
          }
        }

        this.lastUpdate = Date.now();
        console.log('[Store] Offline recovery completed');
      } catch (error) {
        console.error('[Store] Offline recovery failed:', error);
      }
    },

    /**
     * 更新缓存统计
     */
    async updateCacheStats() {
      try {
        const status = await offlineStorage.getStatus();
        this.syncStats.recordCount = status.totalRecords;
      } catch (error) {
        console.warn('[Store] Failed to update cache stats:', error);
      }
    },

    /**
     * 更新数据源状态
     */
    updateSourceStatus(source, status) {
      if (this.sourceStatus[source] !== undefined) {
        this.sourceStatus[source] = status;
      }
    },

    /**
     * 根据API响应更新所有数据源状态
     */
    updateAllSourceStatus(data) {
      // 根据各数据是否有效更新状态
      // 新浪数据源：au9999, ukFutures, usdCny, dxy
      const sinaOk = data.au9999?.current > 0 || data.ukFutures?.current > 0 ||
                     data.usdCny?.current > 0 || data.dxy?.current > 0;
      this.updateSourceStatus('sina', sinaOk ? 'ok' : 'error');

      // 东财数据源：usFutures K线 (通过 /kline/us 接口单独获取)
      // 这里暂时保持ok，因为K线数据是独立的

      // Gate.io数据源：paxg
      const gateOk = data.paxg?.current > 0;
      this.updateSourceStatus('gate', gateOk ? 'ok' : 'error');
    },

    /**
     * 启动数据恢复流程
     */
    async startDataRecovery(fetchFunction) {
      try {
        const mergedData = await dataRecovery.startRecovery(fetchFunction);
        return mergedData;
      } catch (error) {
        console.error('[Store] Data recovery failed:', error);
        throw error;
      }
    },

    /**
     * 获取恢复状态
     */
    getRecoveryStatus() {
      return dataRecovery.getRecoveryStatus();
    },

    /**
     * 获取所有数据
     */
    async fetchAllData() {
      // 请求去重： 如果已有待处理请求，直接返回
      const now = Date.now();
      if (pendingRequest && (now - lastRequestTime < REQUEST_DEDUP_INTERVAL)) {
        console.log('[Store] Request deduplicated, Time since last:', now - lastRequestTime, 'ms');
        return pendingRequest;
      }

      // 记录请求时间
      lastRequestTime = now;
      this.isLoading = true;
      this.error = null;
      const startTime = Date.now();

      // 创建新的请求 Promise
      pendingRequest = (async () => {
        try {
          const data = await fetchAllPrices();

          // 计算延迟
          const latency = Date.now() - startTime;
          this.syncStats.latency = latency;

          // 更新 Au9999
          if (data.au9999) {
            this.updateData('au9999', data.au9999);
          }

          // 更新美国期货
          if (data.usFutures) {
            this.updateData('usFutures', data.usFutures);
          }

          // 更新英国/伦敦金
          if (data.ukFutures) {
            this.updateData('ukFutures', data.ukFutures);
          }

          // 更新汇率
          if (data.usdCny) {
            this.updateData('usdCny', data.usdCny);
          }

          // 更新美元指数
          if (data.dxy) {
            this.updateData('dxy', data.dxy);
          }

          // 更新 PAXG
          if (data.paxg) {
            this.updateData('paxg', data.paxg);
          }

          // 更新数据源状态
          this.updateAllSourceStatus(data);

          this.lastUpdate = Date.now();

          // 更新缓存统计
          this.updateCacheStats();

          // 记录价格变化（用于智能轮询）
          this.recordPriceChange();

          return data;
        } catch (error) {
          this.error = error.message || '获取数据失败';
          console.error('Store: Error fetching data:', error);
          throw error;
        } finally {
          this.isLoading = false;
          pendingRequest = null;
        }
      })();

      return pendingRequest;
    },

    /**
     * 更新数据
     */
    updateData(key, data) {
      if (!this[key] || !data) return;

      // 检测价格变化，触发闪烁动画
      if (this[key].current !== data.current && data.current > 0) {
        this.triggerFlash(key);
        // 记录价格变化（用于智能轮询）
        this.recordPriceChange();
      }

      this[key] = {
        ...this[key],
        ...data,
        history: this.addToHistory(this[key].history, data)
      };

      // 保存到离线存储
      this.saveToOfflineStorage(key, data);

      // 历史数据保存已通过 $subscribe 自动处理
    },

    /**
     * 触发价格闪烁动画
     */
    triggerFlash(key) {
      // 设置闪烁状态
      this.priceFlash[key] = true;

      // 300ms 后清除闪烁状态
      setTimeout(() => {
        this.priceFlash[key] = false;
      }, 300);
    },

    /**
     * 设置状态订阅（使用 Pinia $subscribe）
     */
    setupSubscribe() {
      if (subscribeSetup) return;
      subscribeSetup = true;

      // 使用 $subscribe 监听状态变化，自动保存历史数据
      // { detached: true } 使得订阅在组件卸载后仍然保持
      this.$subscribe(({ storeName, events }, state) => {
        // 只在历史数据变化时保存
        // 使用防抖避免频繁写入
        this.scheduleHistorySave();
      }, { detached: true, deep: false });
    },

    // 防抖保存定时器
    _historySaveTimer: null,

    /**
     * 计划历史数据保存（防抖）
     */
    scheduleHistorySave() {
      if (this._historySaveTimer) {
        clearTimeout(this._historySaveTimer);
      }
      this._historySaveTimer = setTimeout(() => {
        this.saveHistoryData();
        this._historySaveTimer = null;
      }, 5000); // 5秒防抖
    },

    /**
     * 添加到历史数据
     */
    addToHistory(history, data) {
      const now = Date.now();

      // 过滤掉无效价格（0或负数）
      if (!data.current || data.current <= 0) {
        return history;
      }

      const newEntry = {
        price: data.current,
        timestamp: data.timestamp || now
      };

      // 过滤掉过期数据
      const filteredHistory = history.filter(
        item => now - item.timestamp < HISTORY_MAX_AGE && item.price > 0
      );

      // 添加新数据
      const newHistory = [...filteredHistory, newEntry];

      // 限制历史数据长度
      const trimmedHistory = newHistory.length > MAX_HISTORY_LENGTH
        ? newHistory.slice(-MAX_HISTORY_LENGTH)
        : newHistory;

      return trimmedHistory;
    },

    /**
     * 保存历史数据到 localStorage
     */
    saveHistoryData() {
      const historyData = {
        au9999: this.au9999.history,
        usFutures: this.usFutures.history,
        ukFutures: this.ukFutures.history,
        usdCny: this.usdCny.history,
        dxy: this.dxy.history,
        paxg: this.paxg.history
      };
      saveHistoryToStorage(historyData);
    },

    /**
     * 设置数据源
     */
    async setDataSource(source) {
      try {
        await setApiDataSource(source);
        this.dataSource = source;
        localStorage.setItem('dataSource', source);
        // 切换数据源后立即刷新数据
        await this.fetchAllData();
      } catch (error) {
        console.error('Error setting data source:', error);
        // 即使API调用失败，也更新本地状态
        this.dataSource = source;
        localStorage.setItem('dataSource', source);
      }
    },

    /**
     * 清除所有历史数据
     */
    clearHistory() {
      this.au9999.history = [];
      this.usFutures.history = [];
      this.ukFutures.history = [];
      this.usdCny.history = [];
      this.dxy.history = [];
      this.paxg.history = [];
      localStorage.removeItem('gold-history-data');
      console.log('History cleared');
    },

    /**
     * 初始化 WebSocket 连接
     */
    initWebSocket() {
      // 设置状态订阅（用于自动保存历史数据）
      this.setupSubscribe();

      // 更新状态为连接中
      this.updateSyncStatus('connecting');

      // 初始化网络状态监听
      this.initNetworkListener();

      // 订阅价格更新
      wsService.on('prices', (data) => {
        this.handleWebSocketData(data);
      });

      // 监听连接状态
      wsService.onStatusChange((status) => {
        this.wsConnected = status.connected;
        this.wsReconnecting = status.reconnecting;

        // 更新同步状态
        if (status.connected) {
          this.updateSyncStatus('connected');
          dataRecovery.recordSync();
        } else if (status.reconnecting) {
          this.updateSyncStatus('connecting');
        } else {
          this.updateSyncStatus('error');
          // 如果 WebSocket 断开，启用 HTTP 轮询作为备份
          this.startHttpPolling();
        }

        // 如果 WebSocket 断开，启用 HTTP 轮询作为备份
        if (!status.connected && !status.reconnecting) {
          this.startHttpPolling();
        } else if (status.connected) {
          this.stopHttpPolling();
        }
      });

      // 尝试连接 WebSocket
      wsService.connect().then((connected) => {
        if (!connected) {
          console.log('WebSocket connection failed, falling back to HTTP polling');
          this.updateSyncStatus('offline');
          this.startHttpPolling();
          // 尝试从离线存储恢复
          this.recoverFromOffline();
        }
      });
    },

    /**
     * 初始化网络状态监听
     */
    initNetworkListener() {
      networkService.subscribe((status) => {
        this.networkStatus = {
          isOnline: status.isOnline,
          connectionType: navigator.connection?.effectiveType || 'unknown',
          offlineDuration: status.offlineDuration || 0
        };

        if (status.isOnline && status.wasOffline) {
          // 网络恢复，尝试同步数据
          console.log('[Store] Network recovered, syncing data...');
          this.handleNetworkRecovery(status.offlineDuration);
        } else if (!status.isOnline) {
          // 网络断开
          console.log('[Store] Network disconnected');
          this.updateSyncStatus('offline');
        }
      });
    },

    /**
     * 处理网络恢复
     */
    async handleNetworkRecovery(offlineDuration) {
      // 如果离线超过5分钟，进行完整数据恢复
      if (offlineDuration > 5 * 60 * 1000) {
        console.log('[Store] Long offline period, performing full recovery...');
        try {
          await this.startDataRecovery(() => this.fetchAllData());
        } catch (error) {
          console.error('[Store] Recovery failed:', error);
          // 回退到普通刷新
          await this.fetchAllData();
        }
      } else {
        // 短暂离线，直接刷新数据
        await this.fetchAllData();
      }

      // 尝试重新连接 WebSocket
      if (!this.wsConnected) {
        wsService.connect();
      }
    },

    /**
     * 断开 WebSocket
     */
    disconnectWebSocket() {
      wsService.disconnect();
      this.stopHttpPolling();
    },

    /**
     * 处理 WebSocket 数据
     */
    handleWebSocketData(data) {
      if (!data) return;

      const now = Date.now();

      // 更新 Au9999
      if (data.au9999) {
        this.updateData('au9999', data.au9999);
      }

      // 更新美国期货
      if (data.usFutures) {
        this.updateData('usFutures', data.usFutures);
      }

      // 更新英国/伦敦金
      if (data.ukFutures) {
        this.updateData('ukFutures', data.ukFutures);
      }

      // 更新汇率
      if (data.usdCny) {
        this.updateData('usdCny', data.usdCny);
      }

      // 更新美元指数
      if (data.dxy) {
        this.updateData('dxy', data.dxy);
      }

      // 更新 PAXG
      if (data.paxg) {
        this.updateData('paxg', data.paxg);
      }

      this.lastUpdate = now;

      // 计算延迟（基于数据更新间隔，WebSocket推送到来的间隔）
      if (this.lastFetchTime) {
        const latency = now - this.lastFetchTime;
        // WebSocket延迟通常较低，取最小值避免异常
        this.syncStats.latency = Math.min(latency, 1000);
      }
      this.lastFetchTime = now;

      // 每次更新后异步更新缓存统计
      this.updateCacheStats();
    },

    /**
     * 启动 HTTP 轮询（智能间隔）
     */
    startHttpPolling() {
      if (httpPollingTimer) return; // 已经在运行

      console.log('[SmartPolling] Starting with intelligent intervals');
      // 立即获取一次
      this.fetchAllData();

      // 智能轮询
      const doPoll = async () => {
        if (!httpPollingTimer) return; // 已停止

        await this.fetchAllData();
        this.adjustPollingMode();

        // 根据当前模式获取下次轮询间隔
        const interval = SMART_POLLING.intervals[currentPollingMode];
        console.log(`[SmartPolling] Next poll in ${interval / 1000}s (${currentPollingMode} mode)`);
        httpPollingTimer = setTimeout(doPoll, interval);
      };

      // 首次使用活跃模式间隔
      httpPollingTimer = setTimeout(doPoll, SMART_POLLING.intervals.active);
    },

    /**
     * 调整轮询模式
     */
    adjustPollingMode() {
      const now = Date.now();
      const timeSinceLastChange = now - lastDataChangeTime;
      const thresholds = SMART_POLLING.thresholds;

      let newMode = currentPollingMode;

      // 根据距离上次数据变化的时间决定模式
      if (timeSinceLastChange >= thresholds.calmToInactive) {
        newMode = 'inactive';
      } else if (timeSinceLastChange >= thresholds.normalToCalm) {
        newMode = 'calm';
      } else if (timeSinceLastChange >= thresholds.activeToNormal) {
        newMode = 'normal';
      } else {
        newMode = 'active';
      }

      // 模式变化时记录日志
      if (newMode !== currentPollingMode) {
        console.log(`[SmartPolling] Mode changed: ${currentPollingMode} -> ${newMode} (no change for ${Math.round(timeSinceLastChange / 1000)}s)`);
        currentPollingMode = newMode;
        // 更新状态显示
        this.pollingMode = newMode;
      }
    },

    /**
     * 记录数据变化（用于智能轮询）
     */
    recordPriceChange() {
      const prevMode = currentPollingMode;
      lastDataChangeTime = Date.now();

      // 如果当前不是活跃模式，切回活跃模式
      if (currentPollingMode !== 'active') {
        currentPollingMode = 'active';
        this.pollingMode = 'active';
        console.log(`[SmartPolling] Data changed, switching to active mode (was: ${prevMode})`);
      }
    },

    /**
     * 获取当前轮询间隔
     */
    getCurrentPollingInterval() {
      return SMART_POLLING.intervals[currentPollingMode];
    },

    /**
     * 获取当前轮询模式
     */
    getCurrentPollingMode() {
      return currentPollingMode;
    },

    /**
     * 停止 HTTP 轮询
     */
    stopHttpPolling() {
      if (httpPollingTimer) {
        clearTimeout(httpPollingTimer);
        httpPollingTimer = null;
        currentPollingMode = 'active'; // 重置为活跃模式
        this.pollingMode = 'active';
        console.log('[SmartPolling] Stopped');
      }
    }
  }
});