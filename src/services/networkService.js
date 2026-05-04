// 网络状态服务
// 监听浏览器 online/offline 事件，管理网络连接状态

class NetworkService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    this.lastOnlineTime = this.isOnline ? Date.now() : 0;
    this.lastOfflineTime = !this.isOnline ? Date.now() : 0;
    this.offlineDuration = 0;

    this.init();
  }

  init() {
    // 监听网络状态变化
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

  }

  handleOnline() {
    const wasOffline = !this.isOnline;
    this.isOnline = true;
    this.lastOnlineTime = Date.now();

    if (wasOffline) {
      this.offlineDuration = this.lastOnlineTime - this.lastOfflineTime;
    }

    this.notifyListeners({
      isOnline: true,
      wasOffline,
      offlineDuration: this.offlineDuration
    });
  }

  handleOffline() {
    const wasOnline = this.isOnline;
    this.isOnline = false;
    this.lastOfflineTime = Date.now();

    if (wasOnline) {
    }

    this.notifyListeners({
      isOnline: false,
      wasOnline,
      offlineDuration: 0
    });
  }

  // 订阅网络状态变化
  subscribe(callback) {
    this.listeners.add(callback);
    // 立即返回当前状态
    callback({
      isOnline: this.isOnline,
      wasOffline: false,
      offlineDuration: 0
    });

    // 返回取消订阅函数
    return () => {
      this.listeners.delete(callback);
    };
  }

  // 通知所有监听器
  notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (e) {
        console.error('[Network] Listener error:', e);
      }
    });
  }

  // 获取当前状态
  getStatus() {
    return {
      isOnline: this.isOnline,
      lastOnlineTime: this.lastOnlineTime,
      lastOfflineTime: this.lastOfflineTime,
      offlineDuration: this.offlineDuration,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      downlink: navigator.connection?.downlink || null
    };
  }

  // 检查是否长时间离线
  wasOfflineFor(ms) {
    return this.offlineDuration >= ms;
  }
}

// 单例导出
export const networkService = new NetworkService();
