// 数据恢复机制 - 离线数据合并
import { offlineStorage } from './offlineStorage';

class DataRecovery {
  constructor() {
    this.lastSyncTime = 0;
    this.isRecovering = false;
    this.syncKey = 'gold_last_sync';

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
      return;
    }

    this.isRecovering = true;

    try {
      // 1. 尝试获取离线存储的数据
      const offlineData = await offlineStorage.getLatestPrices();

      // 2. 获取网络数据
      const networkData = await fetchFunction();

      // 3. 合并数据，以网络数据为准
      const mergedData = this.mergeData(offlineData, networkData);

      // 4. 清理过期的离线数据
      await offlineStorage.cleanExpiredData();

      // 5. 记录成功同步
      this.recordSync();

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
        const offlinePrice = offlineData[source];
        if (offlinePrice && offlinePrice.price > 0) {
          merged[source] = {
            current: offlinePrice.price,
            prevClose: offlinePrice.prevClose || 0,
            change: offlinePrice.change || 0,
            changePercent: offlinePrice.changePercent || 0,
            currency: offlinePrice.currency || 'CNY',
            timestamp: offlinePrice.timestamp,
            isOffline: true
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
      lastSync: this.lastSyncTime,
      offlineSince: this.lastSyncTime > 0 ? Date.now() - this.lastSyncTime : 0
    };
  }
}

export const dataRecovery = new DataRecovery();
