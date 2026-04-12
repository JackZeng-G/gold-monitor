// 离线数据缓存服务
// 使用 IndexedDB 存储最近的价格数据，提供离线访问和快速恢复能力

import { compressionService } from './compressionService';

const DB_NAME = 'gold_monitor_db';
const STORE_NAME = 'price_history';
const META_STORE = 'cache_meta';
const MAX_RECORDS_PER_SOURCE = 500; // 每个数据源最多保存500条记录
const DATA_EXPIRY = 30 * 60 * 1000; // 30分钟有效期
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5分钟清理一次过期数据
const COMPRESSION_THRESHOLD = 512; // 超过512字节才压缩

class OfflineStorage {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.initPromise = this.init();
    this.cleanupTimer = null;
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      cleanups: 0
    };
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 3); // 升级版本号

      request.onerror = () => reject(new Error('Failed to open database'));

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // 创建对象存储并设置 keyPath
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('source', 'source', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        // 创建元数据存储
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isReady = true;
        console.log('[OfflineStorage] Database initialized (v3 with compression support)');

        // 启动定期清理
        this.startPeriodicCleanup();

        resolve();
      };
    });
  }

  // 启动定期清理过期数据
  startPeriodicCleanup() {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(async () => {
      try {
        const cleaned = await this.cleanExpiredData();
        if (cleaned > 0) {
          this.stats.cleanups++;
          console.log(`[OfflineStorage] Periodic cleanup: removed ${cleaned} expired records`);
        }
      } catch (e) {
        console.warn('[OfflineStorage] Periodic cleanup failed:', e);
      }
    }, CLEANUP_INTERVAL);
  }

  // 停止定期清理
  stopPeriodicCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // 压缩数据（如果数据量足够大）
  compressData(data) {
    const jsonStr = JSON.stringify(data);
    if (jsonStr.length < COMPRESSION_THRESHOLD) {
      return { data, compressed: false };
    }
    try {
      const compressed = compressionService.compress(data);
      return { data: compressed, compressed: true };
    } catch (e) {
      console.warn('[OfflineStorage] Compression failed, storing raw:', e);
      return { data, compressed: false };
    }
  }

  // 解压数据
  decompressData(record) {
    if (!record.compressed) {
      return record.data;
    }
    try {
      return compressionService.decompress(record.data);
    } catch (e) {
      console.warn('[OfflineStorage] Decompression failed:', e);
      return null;
    }
  }

  // 保存价格数据
  async savePriceData(source, data) {
    await this.initPromise;
    this.stats.writes++;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const newRecord = {
          id: `${source}_${Date.now()}`,
          source,
          timestamp: Date.now(),
          compressed: false
        };

        const rawData = {
          price: data.current,
          prevClose: data.prevClose,
          change: data.change,
          changePercent: data.changePercent,
          currency: data.currency
        };

        const { data: compressedData, compressed } = this.compressData(rawData);
        newRecord.data = compressedData;
        newRecord.compressed = compressed;

        if (!compressed) {
          newRecord.price = data.current;
          newRecord.prevClose = data.prevClose;
          newRecord.change = data.change;
          newRecord.changePercent = data.changePercent;
          newRecord.currency = data.currency;
        }

        store.put(newRecord);

        // Cleanup old records for this source using cursor
        const index = store.index('source');
        let count = 0;
        const countReq = index.count(IDBKeyRange.only(source));
        countReq.onsuccess = () => {
          const total = countReq.result;
          if (total > MAX_RECORDS_PER_SOURCE) {
            const toDelete = total - MAX_RECORDS_PER_SOURCE;
            let deleted = 0;
            const cursorReq = index.openCursor(IDBKeyRange.only(source));
            cursorReq.onsuccess = (event) => {
              const cursor = event.target.result;
              if (cursor && deleted < toDelete) {
                cursor.delete();
                deleted++;
                cursor.continue();
              }
            };
            cursorReq.onerror = () => {
              console.warn('[OfflineStorage] Cleanup cursor failed');
            };
          }
        };
        countReq.onerror = () => {
          console.warn('[OfflineStorage] Count request failed, skipping cleanup');
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(new Error('Transaction failed'));
      } catch (error) {
        reject(error);
      }
    });
  }

  // 获取历史数据
  async getHistoryData(source, limit = 100) {
    await this.initPromise;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('source');

      const now = Date.now();
      const minTimestamp = now - DATA_EXPIRY;
      const records = [];

      const cursorReq = index.openCursor(IDBKeyRange.only(source));

      cursorReq.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const record = cursor.value;
          if (record.timestamp >= minTimestamp) {
            if (record.compressed && record.data) {
              const data = this.decompressData(record);
              if (data) {
                records.push({ ...record, ...data });
              }
            } else {
              records.push(record);
            }
          }
          cursor.continue();
        } else {
          records.sort((a, b) => a.timestamp - b.timestamp);
          this.stats.hits++;
          resolve(records.slice(-limit));
        }
      };

      cursorReq.onerror = () => {
        this.stats.misses++;
        reject(new Error('Failed to get records'));
      };
    });
  }

  // 获取所有数据源的最新数据 - 使用游标优化
  async getLatestPrices() {
    await this.initPromise;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('source');

      const latestData = {};
      const sourceTimestamps = {};

      // 使用游标遍历所有记录
      const cursorReq = index.openCursor();

      cursorReq.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const record = cursor.value;
          const source = record.source;

          // 只保留该 source 的最新记录
          if (!sourceTimestamps[source] || record.timestamp > sourceTimestamps[source]) {
            sourceTimestamps[source] = record.timestamp;

            // 解压数据
            let data = record;
            if (record.compressed && record.data) {
              const decompressed = this.decompressData(record);
              if (decompressed) {
                data = { ...record, ...decompressed };
              }
            }

            latestData[source] = {
              price: data.price,
              timestamp: data.timestamp,
              prevClose: data.prevClose,
              change: data.change,
              changePercent: data.changePercent,
              currency: data.currency
            };
          }
          cursor.continue();
        } else {
          // 游标结束
          this.stats.hits++;
          resolve(latestData);
        }
      };

      cursorReq.onerror = () => {
        this.stats.misses++;
        reject(new Error('Failed to get records'));
      };
    });
  }

  // 清除过期数据
  async cleanExpiredData() {
    await this.initPromise;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');

      const expiryThreshold = Date.now() - DATA_EXPIRY;
      let expiredCount = 0;

      const cursorReq = index.openCursor(IDBKeyRange.upperBound(expiryThreshold));

      cursorReq.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          expiredCount++;
          cursor.continue();
        } else {
          if (expiredCount > 0) {
            console.log(`[OfflineStorage] Cleaned ${expiredCount} expired records`);
          }
          resolve(expiredCount);
        }
      };

      cursorReq.onerror = () => reject(new Error('Failed to clean expired data'));
    });
  }

  // 检查数据库状态
  async getStatus() {
    await this.initPromise;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const countRequest = store.count();
      countRequest.onsuccess = () => {
        resolve({
          isReady: this.isReady,
          totalRecords: countRequest.result,
          lastUpdated: Date.now(),
          stats: { ...this.stats },
          config: {
            maxRecordsPerSource: MAX_RECORDS_PER_SOURCE,
            dataExpiry: DATA_EXPIRY,
            compressionThreshold: COMPRESSION_THRESHOLD
          }
        });
      };
      countRequest.onerror = () => reject(new Error('Failed to count records'));
    });
  }

  // 获取缓存统计信息
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  // 重置统计
  resetStats() {
    this.stats = { hits: 0, misses: 0, writes: 0, cleanups: 0 };
  }

  // 清空所有数据
  async clearAll() {
    await this.initPromise;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        console.log('[OfflineStorage] All data cleared');
        resolve();
      };
      clearRequest.onerror = () => reject(new Error('Failed to clear store'));
    });
  }
}

// 单例导出
export const offlineStorage = new OfflineStorage();
