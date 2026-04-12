// 数据恢复机制
// 当网络断开时保存当前状态，网络恢复后自动同步缺失数据

import { offlineStorage } from './offlineStorage';

class DataRecovery {
  constructor() {
    this.pendingUpdates = [];
    this.lastSyncTime = 0;
    this.recoveryInterval = 30000; // 30秒
    this.isRecovering = false;
    this.maxPendingUpdates = 1000;
    this.storageKey = 'gold_pending_updates';
    this.syncKey = 'gold_last_sync';

    // 从本地存储恢复待处理的更新
    this.restorePendingUpdates();
  }

  // 保存待处理的更新
  savePendingUpdate(type, data) {
    const update = {
      type,
      data,
      timestamp: Date.now(),
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.pendingUpdates.push(update);

    // 限制待处理更新的数量
    if (this.pendingUpdates.length > this.maxPendingUpdates) {
      // 保留最新的更新
      this.pendingUpdates = this.pendingUpdates.slice(-this.maxPendingUpdates);
    }

    // 保存到本地存储
    this.persistPendingUpdates();

    return update.id;
  }

  // 持久化待处理更新
  persistPendingUpdates() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.pendingUpdates));
    } catch (e) {
      console.warn('[DataRecovery] Failed to persist updates:', e);
    }
  }

  // 从本地存储恢复待处理更新
  restorePendingUpdates() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.pendingUpdates = JSON.parse(stored);
        console.log(`[DataRecovery] Restored ${this.pendingUpdates.length} pending updates`);
      }
    } catch (e) {
      console.warn('[DataRecovery] Failed to restore updates:', e);
      this.pendingUpdates = [];
    }

    // 恢复最后同步时间
    try {
      const lastSync = localStorage.getItem(this.syncKey);
      if (lastSync) {
        this.lastSyncTime = parseInt(lastSync);
      }
    } catch (e) {
      this.lastSyncTime = 0;
    }
  }

  // 记录同步时间
  recordSync() {
    this.lastSyncTime = Date.now();
    localStorage.setItem(this.syncKey, this.lastSyncTime.toString());
  }

  // 开始恢复流程
  async startRecovery(fetchFunction) {
    if (this.isRecovering) {
      console.log('[DataRecovery] Already recovering');
      return;
    }

    this.isRecovering = true;
    console.log('[DataRecovery] Starting recovery...');

    try {
      // 1. 尝试获取离线存储的数据
      const offlineData = await offlineStorage.getLatestPrices();
      console.log('[DataRecovery] Found offline data:', Object.keys(offlineData).length, 'sources');

      // 2. 获取网络数据
      const networkData = await fetchFunction();

      // 3. 合并数据，以网络数据为准
      const mergedData = this.mergeData(offlineData, networkData);

      // 4. 处理待处理的更新
      if (this.pendingUpdates.length > 0) {
        console.log(`[DataRecovery] Processing ${this.pendingUpdates.length} pending updates`);
        // 这里可以根据需要处理待处理的更新
        // 比如重新发送未同步的订单、操作等
        this.pendingUpdates = [];
        this.persistPendingUpdates();
      }

      // 5. 清理过期的离线数据
      await offlineStorage.cleanExpiredData();

      // 6. 记录成功同步
      this.recordSync();

      console.log('[DataRecovery] Recovery completed successfully');
      return mergedData;
    } catch (error) {
      console.error('[DataRecovery] Recovery failed:', error);
      throw error;
    } finally {
      this.isRecovering = false;
    }
  }

  // 合并离线数据和网络数据
  mergeData(offlineData, networkData) {
    const merged = { ...networkData };

    // 对于网络数据中缺失的源，使用离线数据补充
    for (const source of Object.keys(offlineData)) {
      if (!merged[source] || !merged[source].current) {
        // 使用离线数据
        const offlinePrice = offlineData[source];
        if (offlinePrice && offlinePrice.price > 0) {
          merged[source] = {
            current: offlinePrice.price,
            prevClose: offlinePrice.prevClose || 0,
            change: offlinePrice.change || 0,
            changePercent: offlinePrice.changePercent || 0,
            currency: offlinePrice.currency || 'CNY',
            timestamp: offlinePrice.timestamp,
            isOffline: true // 标记为离线数据
          };
        }
      }
    }

    return merged;
  }

  // 获取恢复状态
  getRecoveryStatus() {
    return {
      isRecovering: this.isRecovering,
      pendingCount: this.pendingUpdates.length,
      lastSync: this.lastSyncTime,
      offlineSince: this.lastSyncTime > 0 ? Date.now() - this.lastSyncTime : 0
    };
  }

  // 清除所有待处理更新
  clearPendingUpdates() {
    this.pendingUpdates = [];
    localStorage.removeItem(this.storageKey);
    console.log('[DataRecovery] Cleared all pending updates');
  }

  // 获取需要恢复的数据
  async getRecoveryData(source) {
    const history = await offlineStorage.getHistoryData(source, 50);
    return {
      history,
      pendingUpdates: this.pendingUpdates.filter(u => u.source === source)
    };
  }
}

// 单例导出
export const dataRecovery = new DataRecovery();
