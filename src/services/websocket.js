// WebSocket 服务 - 实时数据推送
// 自动检测协议 (开发/生产环境自适应)
const WS_URL = (() => {
  // 开发环境使用本地后端
  if (import.meta.env.DEV) {
    return 'ws://localhost:8081/api/ws';
  }
  // 生产环境使用相对路径（同域）
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/api/ws`;
})();

// 指数退避重连配置
const RECONNECT_CONFIG = {
  initialDelay: 1000,      // 初始重连延迟 1s
  maxDelay: 30000,         // 最大重连延迟 30s
  multiplier: 2,           // 指数倍数
  jitter: 0.2,             // 随机抖动 20%，避免雪崩
  maxAttempts: Infinity,   // 最大重连次数（无限）
  resetTime: 60000         // 连接成功 60s 后重置重连计数
};

const HEARTBEAT_CONFIG = {
  interval: 25000,         // 心跳间隔 25s
  timeout: 15000,          // 心跳超时 15s
  maxMissed: 3             // 最大允许错过心跳次数
};

class WebSocketService {
  constructor() {
    this.ws = null;
    this.handlers = new Map();
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.heartbeatTimeout = null;
    this.missedHeartbeats = 0;
    this.statusCallback = null;
    this.isManualClose = false;
    this.lastConnectedTime = 0;
    this.networkUnsubscribe = null;
    this.connectionState = 'disconnected'; // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
  }

  // 计算重连延迟（指数退避 + 抖动）
  calculateReconnectDelay() {
    const delay = Math.min(
      RECONNECT_CONFIG.initialDelay * Math.pow(RECONNECT_CONFIG.multiplier, this.reconnectAttempts),
      RECONNECT_CONFIG.maxDelay
    );

    // 添加随机抖动
    const jitterRange = delay * RECONNECT_CONFIG.jitter;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;

    return Math.max(delay + jitter, RECONNECT_CONFIG.initialDelay);
  }

  // 连接 WebSocket
  async connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return true;
    }

    if (this.connectionState === 'connecting') {
      return false;
    }

    this.connectionState = 'connecting';
    this.isManualClose = false;
    this.notifyStatus({
      connected: false,
      connecting: true,
      reconnecting: this.reconnectAttempts > 0,
      attempts: this.reconnectAttempts,
      state: this.connectionState
    });

    try {
      this.ws = new WebSocket(WS_URL);

      // Promise 包装连接过程
      return new Promise((resolve) => {
        const connectionTimeout = setTimeout(() => {
          console.warn('[WS] Connection timeout');
          if (this.ws) {
            this.ws.close();
          }
          this.connectionState = 'disconnected';
          resolve(false);
        }, 10000); // 10秒连接超时

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);

          this.connectionState = 'connected';
          this.lastConnectedTime = Date.now();
          this.reconnectAttempts = 0;
          this.missedHeartbeats = 0;

          this.notifyStatus({
            connected: true,
            connecting: false,
            reconnecting: false,
            attempts: 0,
            state: 'connected'
          });

          this.startHeartbeat();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
            // 收到任何消息都视为连接活跃，重置心跳超时
            this.missedHeartbeats = 0;
            this.resetHeartbeatTimeout();
          } catch (e) {
            console.warn('[WS] Failed to parse message:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WS] Error:', error);
          clearTimeout(connectionTimeout);
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);

          this.connectionState = 'disconnected';
          this.stopHeartbeat();
          this.notifyStatus({
            connected: false,
            connecting: false,
            reconnecting: false,
            attempts: this.reconnectAttempts,
            state: 'disconnected'
          });

          if (!this.isManualClose) {
            this.scheduleReconnect();
          }
          resolve(false);
        };
      });

    } catch (error) {
      console.error('[WS] Failed to connect:', error);
      this.connectionState = 'disconnected';
      return false;
    }
  }

  // 断开连接
  disconnect() {
    this.isManualClose = true;
    this.connectionState = 'disconnected';
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.cleanupNetworkListener();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.notifyStatus({ connected: false, connecting: false, reconnecting: false, attempts: 0, state: 'disconnected' });
  }

  // 计划重连（指数退避）
  scheduleReconnect() {
    // 检查是否超过最大重连次数
    if (this.reconnectAttempts >= RECONNECT_CONFIG.maxAttempts) {
      console.error('[WS] Max reconnect attempts reached, giving up');
      this.notifyStatus({
        connected: false,
        connecting: false,
        reconnecting: false,
        attempts: this.reconnectAttempts,
        state: 'failed',
        error: 'max_attempts_reached'
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.calculateReconnectDelay();
    const delaySeconds = (delay / 1000).toFixed(1);


    this.connectionState = 'reconnecting';
    this.notifyStatus({
      connected: false,
      connecting: false,
      reconnecting: true,
      attempts: this.reconnectAttempts,
      nextRetryIn: delay,
      state: 'reconnecting'
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // 清除重连定时器
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // 立即重连（网络恢复时调用）
  reconnectNow() {
    this.clearReconnectTimer();
    this.reconnectAttempts = Math.max(0, this.reconnectAttempts - 1); // 减少一次计数
    this.connect();
  }

  // 开始心跳
  startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }));
          this.resetHeartbeatTimeout();
        } catch (e) {
          console.warn('[WS] Failed to send ping:', e);
        }
      }
    }, HEARTBEAT_CONFIG.interval);
  }

  // 重置心跳超时
  resetHeartbeatTimeout() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }

    this.heartbeatTimeout = setTimeout(() => {
      this.missedHeartbeats++;
      // 第一次超时只记录，不警告
      if (this.missedHeartbeats > 1) {
        console.warn(`[WS] Heartbeat timeout (missed: ${this.missedHeartbeats}/${HEARTBEAT_CONFIG.maxMissed})`);
      }

      if (this.missedHeartbeats >= HEARTBEAT_CONFIG.maxMissed) {
        console.error('[WS] Too many missed heartbeats, closing connection');
        if (this.ws) {
          this.ws.close(1000, 'heartbeat_timeout');
        }
      }
    }, HEARTBEAT_CONFIG.timeout);
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    this.missedHeartbeats = 0;
  }

  // 清理网络监听
  cleanupNetworkListener() {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = null;
    }
  }

  // 订阅消息
  on(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type).add(handler);
  }

  // 取消订阅
  off(type, handler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  // 设置状态回调
  onStatusChange(callback) {
    this.statusCallback = callback;
  }

  // 获取连接状态
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // 处理消息
  handleMessage(message) {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message.data));
    }

    // 也触发通配符处理器
    const allHandlers = this.handlers.get('*');
    if (allHandlers) {
      allHandlers.forEach(handler => handler(message));
    }
  }

  // 通知状态变化
  notifyStatus(status) {
    if (this.statusCallback) {
      this.statusCallback(status);
    }
  }

}

// 单例
export const wsService = new WebSocketService();
