# 黄金看盘项目全面优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 分三阶段修复 Bug、优化性能、重构代码质量，共 20 项改进

**Architecture:** 后端 Go (Gin) + 前端 Vue 3 (Pinia)，优化聚焦于 WebSocket 数据竞争、重复实例、IndexedDB 性能、代码冗余清理

**Tech Stack:** Go 1.26, Gin, gorilla/websocket, Vue 3, Pinia, IndexedDB, axios, ECharts

---

## 文件变更清单

| 文件 | 操作 | 负责任务 |
|------|------|---------|
| `backend/handlers/websocket.go` | 修改 | Task 1.1 |
| `backend/main.go` | 修改 | Task 1.2 |
| `src/components/StatsGrid.vue` | 修改 | Task 1.3, 1.5 |
| `src/components/AnalysisPanel.vue` | 修改 | Task 1.4, 2.5 |
| `src/services/dataRecovery.js` | 修改 | Task 1.6, 3.3 |
| `backend/services/sina.go` | 修改 | Task 2.1 |
| `backend/services/kline.go` | 修改 | Task 2.2 |
| `backend/handlers/gold.go` | 修改 | Task 2.3 |
| `src/services/offlineStorage.js` | 修改 | Task 2.4 |
| `src/App.vue` | 修改 | Task 2.6 |
| `src/utils/request.js` | 修改 | Task 3.1 |
| `src/components/KlineChart.vue` | 修改 | Task 3.1, 3.6 |
| `src/components/NewsPanel.vue` | 修改 | Task 3.1, 3.6 |
| `src/constants/index.js` | 修改 | Task 3.1, 3.5 |
| `src/services/api.js` | 修改 | Task 3.6 |
| `backend/cache/cache.go` | 修改 | Task 3.2 |
| `backend/handlers/news.go` | 修改 | Task 3.2 |
| `backend/services/dxy.go` | 修改 | Task 3.2 |
| `backend/services/paxg.go` | 修改 | Task 3.2, 3.7 |
| `src/utils/technicalIndicators.js` | 修改 | Task 3.3 |
| `src/stores/goldStore.js` | 修改 | Task 3.3, 3.5 |
| `src/services/websocket.js` | 修改 | Task 3.3 |
| `backend/models/gold.go` | 修改 | Task 3.4 |
| `backend/services/news.go` | 修改 | Task 3.4 |
| `backend/handlers/kline.go` | 修改 | Task 3.8 |

---

## 第一阶段：Bug 修复

### Task 1.1: 修复 WebSocket Hub 数据竞争

**Files:**
- Modify: `backend/handlers/websocket.go:116-128`

**问题:** broadcast 分支在 `RLock` 下调用 `delete(h.clients, client)` 和 `close(client.send)`，修改 map 但只持读锁，高并发下会 panic。

- [ ] **Step 1: 修改 Run() 方法中的 broadcast 分支**

将违规的 delete/close 操作收集到 pending 列表，退出 RLock 后再执行清理：

```go
case message := <-h.broadcast:
    h.mu.RLock()
    pendingDeletes := make([]*WSClient, 0)
    for client := range h.clients {
        select {
        case client.send <- message:
            client.LastMsg = time.Now()
        default:
            // Client buffer full, collect for cleanup (can't modify under RLock)
            pendingDeletes = append(pendingDeletes, client)
        }
    }
    h.mu.RUnlock()

    // Now cleanup under full Lock
    if len(pendingDeletes) > 0 {
        h.mu.Lock()
        for _, client := range pendingDeletes {
            if _, ok := h.clients[client]; ok {
                close(client.send)
                delete(h.clients, client)
            }
        }
        h.mu.Unlock()
        log.Printf("WebSocket: cleaned %d stale clients", len(pendingDeletes))
    }
```

- [ ] **Step 2: 验证修复**

编译并运行后端，确保无编译错误：

```bash
cd backend && go build -o gold-monitor-test . && ./gold-monitor-test -port 8082
```

在另一个终端测试 WebSocket 连接：

```bash
# 使用 wscat 或 websocat 测试
websocat ws://localhost:8082/api/ws
```

- [ ] **Step 3: Commit**

```bash
git add backend/handlers/websocket.go
git commit -m "fix(websocket): resolve data race in broadcast handler - defer map modifications to post-RLock phase"
```

---

### Task 1.2: 修复重复 GoldHandler 实例

**Files:**
- Modify: `backend/main.go:72-90`

**问题:** ticker goroutine（第 77 行）和 HTTP 路由（第 87 行）各创建独立的 `GoldHandler`，导致缓存、历史存储完全隔离。

- [ ] **Step 1: 创建单一 GoldHandler 实例**

修改 `main.go`，删除 ticker 内的重复创建：

```go
// 创建 WebSocket Hub 并启动
wsHub := handlers.NewWSHub()
go wsHub.Run()

// 创建处理器（单一实例）
goldHandler := handlers.NewGoldHandler(wsHub)
newsHandler := handlers.NewNewsHandler()
klineHandler := handlers.NewKlineHandler()

// 启动定时广播协程（每3秒推送一次数据）
go func() {
    ticker := time.NewTicker(3 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        if wsHub.ClientCount() > 0 {
            goldHandler.BroadcastPrices()
        }
    }
}()

// API 路由
api := r.Group("/api")
{
    // ... 路由注册使用同一个 goldHandler
}
```

- [ ] **Step 2: 验证修复**

```bash
cd backend && go build . && ./gold-monitor -port 8082
```

访问 `/api/gold/prices` 和 WebSocket，确认数据一致：

```bash
curl http://localhost:8082/api/gold/prices | jq '.data.lastUpdate'
```

- [ ] **Step 3: Commit**

```bash
git add backend/main.go
git commit -m "fix(main): use single GoldHandler instance for ticker and HTTP routes - shared cache/history"
```

---

### Task 1.3: 修复 StatsGrid 双 ¥ 符号

**Files:**
- Modify: `src/components/StatsGrid.vue:309-314`

**问题:** CSS `::before` 伪元素添加 ¥，模板第 22 行也渲染 ¥，导致双符号。

- [ ] **Step 1: 删除 CSS ::before 中的 ¥**

找到 `.price-main::before` 样式块（约第 309-314 行），删除 `content: '¥'`：

```scss
.price-main {
  font-family: $font-display;
  font-size: 28px;
  font-weight: $font-weight-bold;
  line-height: 1;
  color: $color-text;
  letter-spacing: -1px;

  // 移除 ::before 的 content: '¥'，仅保留模板中的条件渲染
  // 原代码：
  // &::before {
  //   content: '¥';
  //   font-size: 16px;
  //   margin-right: 2px;
  //   opacity: 0.6;
  // }
}
```

- [ ] **Step 2: 验证修复**

启动前端开发服务器：

```bash
npm run dev
```

打开浏览器检查价格卡片，确认非汇率项只显示一个 ¥。

- [ ] **Step 3: Commit**

```bash
git add src/components/StatsGrid.vue
git commit -m "fix(StatsGrid): remove duplicate ¥ symbol from CSS ::before pseudo-element"
```

---

### Task 1.4: 修复 AnalysisPanel 覆盖短期分析

**Files:**
- Modify: `src/components/AnalysisPanel.vue:636-664`

**问题:** `performAnalysis()` 第 654-658 行在 `analyzeShortTerm()` 设置完 `shortAnalysis` 后又覆盖了其 items。

- [ ] **Step 1: 修改 performAnalysis 中的合并逻辑**

将技术指标信号追加而非替换：

```javascript
// 执行完整分析
const performAnalysis = (force = false) => {
  const currentHash = calculateDataHash();
  if (!force && currentHash === lastDataHash.value) return;

  lastDataHash.value = currentHash;

  // 获取历史数据
  const history = store.au9999.history || [];
  const prices = history.map(h => h.price);
  const currentPrice = store.au9999.current;

  // 计算综合技术指标
  if (prices.length >= 10) {
    const analysis = analyzeTechnicalIndicators(prices, currentPrice);
    technicalIndicators.value = analysis.indicators;
  }

  // 执行分析（传入 prices 避免重复提取）
  analyzeShortTerm(prices);
  analyzeMidTerm(prices);
  analyzeLongTerm();

  // 技术指标信号合并到短线分析（追加而非替换）
  if (prices.length >= 10) {
    const analysis = analyzeTechnicalIndicators(prices, currentPrice);
    if (analysis.signals.length > 0 && shortAnalysis.value.length > 0) {
      // 在分析项后追加技术指标信号（最多3条）
      const existingTexts = shortAnalysis.value.map(i => i.text);
      const newSignals = analysis.signals
        .filter(s => !existingTexts.includes(s.text))
        .slice(0, 3);
      shortAnalysis.value = [...shortAnalysis.value, ...newSignals];
    }
  }
};
```

- [ ] **Step 2: 验证修复**

```bash
npm run dev
```

检查数据分析面板短线部分，确认分析项和技术指标信号共存。

- [ ] **Step 3: Commit**

```bash
git add src/components/AnalysisPanel.vue
git commit -m "fix(AnalysisPanel): merge technical signals into shortAnalysis instead of overwriting"
```

---

### Task 1.5: 修复 PAXG/DXY 硬编码零变动

**Files:**
- Modify: `src/components/StatsGrid.vue:103-137`

**问题:** PAXG 和 DXY 的 `change/percent/trend` 被硬编码为 `0/0/'flat'`。

- [ ] **Step 1: 从 props 数据读取真实变动**

修改 stats computed 中 paxg 和 dxy 的构建：

```javascript
const stats = computed(() => {
  const { au9999, usFutures, ukFutures, paxg, usdCny, dxy, priceFlash } = props;
  const rate = conversionRate.value;

  const items = [
    // ... au9999, usFutures, ukFutures 保持不变
    {
      key: 'paxg',
      label: '数字黄金', // 同时修复名称
      symbol: 'PAXG',
      cnyPrice: (paxg.current * rate).toFixed(2),
      usdPrice: paxg.current,
      change: paxg.change || 0,        // 使用真实数据
      percent: paxg.changePercent || 0, // 使用真实数据
      trend: getTrend(paxg.change),     // 使用真实数据
      isRate: false,
      flash: priceFlash.paxg
    },
    // ... usdCny 保持不变
    {
      key: 'dxy',
      label: '美元指数',
      symbol: 'DXY',
      cnyPrice: dxy.current,
      usdPrice: null,
      change: dxy.change || 0,          // 使用真实数据
      percent: dxy.changePercent || 0,   // 使用真实数据
      trend: getTrend(dxy.change),       // 使用真实数据
      isRate: true,
      flash: priceFlash.dxy
    }
  ];

  // NO_CHANGE_DISPLAY_KEYS 需要更新为空数组（现在都显示涨跌）
  return items.map(item => ({
    ...item,
    showChange: true // 所有项都显示涨跌
  }));
});
```

- [ ] **Step 2: 更新常量文件**

修改 `src/constants/index.js`：

```javascript
// 不显示涨跌的数据类型（现在全部显示）
export const NO_CHANGE_DISPLAY_KEYS = []; // 移除 paxg 和 dxy
```

- [ ] **Step 3: 验证修复**

```bash
npm run dev
```

检查 PAXG 和 DXY 卡片是否显示涨跌数据。

- [ ] **Step 4: Commit**

```bash
git add src/components/StatsGrid.vue src/constants/index.js
git commit -m "fix(StatsGrid): display real change data for PAXG and DXY instead of hardcoded zeros"
```

---

### Task 1.6: 清理 dataRecovery 无效逻辑

**Files:**
- Modify: `src/services/dataRecovery.js:20-178`

**问题:** `getRecoveryData` 按 `u.source` 过滤但 `savePendingUpdate` 从未设置 source，且只读仪表盘无需 pending-update。

- [ ] **Step 1: 精简 dataRecovery 为离线恢复功能**

删除 pending-update 相关代码，保留离线数据合并：

```javascript
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

      // 4. 清理过期的离线数据
      await offlineStorage.cleanExpiredData();

      // 5. 记录成功同步
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
```

- [ ] **Step 2: 验证修复**

```bash
npm run dev
```

确认应用正常启动，无 dataRecovery 相关错误。

- [ ] **Step 3: Commit**

```bash
git add src/services/dataRecovery.js
git commit -m "fix(dataRecovery): remove unused pending-update logic - keep only offline data merge"
```

---

### Task 1.7: 验证第一阶段并提交

- [ ] **Step 1: 运行完整验证**

```bash
# 后端
cd backend && go build . && go test ./... 2>/dev/null || echo "No tests"

# 前端
npm run build
```

- [ ] **Step 2: 确认所有 Bug 修复完成**

检查列表：
- WebSocket 数据竞争修复 ✓
- 单一 GoldHandler 实例 ✓
- 双 ¥ 符号修复 ✓
- AnalysisPanel 合并逻辑 ✓
- PAXG/DXY 真实数据 ✓
- dataRecovery 精简 ✓

---

## 第二阶段：性能优化

### Task 2.1: 消除 FetchAll 重复 USDCNY 请求

**Files:**
- Modify: `backend/services/sina.go:260-269`

**问题:** USDCNY 在 goroutine 和 PAXG goroutine 内各请求一次。

- [ ] **Step 1: 修改 FetchAll 共享 USDCNY 结果**

使用 channel 共享汇率结果：

```go
// FetchAll 并发获取所有数据
func (s *SinaService) FetchAll() (*models.AllPricesResponse, error) {
    var au9999, usFutures, ukFutures, paxg *models.GoldPrice
    var usdCny *models.ExchangeRate
    var dxy *models.ExchangeRate

    type result struct {
        name string
        data interface{}
        err  error
    }

    results := make(chan result, 6)

    // 汇率结果 channel，供 PAXG goroutine 使用
    rateChan := make(chan float64, 1)

    // 国内源
    go func() {
        data, err := s.FetchAu9999()
        results <- result{"au9999", data, err}
    }()

    go func() {
        data, err := s.FetchUsFutures()
        results <- result{"usFutures", data, err}
    }()

    go func() {
        data, err := s.FetchUkFutures()
        results <- result{"ukFutures", data, err}
    }()

    go func() {
        data, err := s.FetchUsdCny()
        if err == nil && data != nil && data.Current > 0 {
            rateChan <- data.Current // 发送汇率给 PAXG goroutine
        }
        results <- result{"usdCny", data, err}
    }()

    go func() {
        data, err := s.dxyService.FetchDxy()
        results <- result{"dxy", data, err}
    }()

    go func() {
        // 从 channel 接收汇率，避免重复请求
        rate := 6.9 // 默认值
        select {
        case r := <-rateChan:
            rate = r
        case <-time.After(2 * time.Second):
            // 超时使用默认值
        }
        data, err := s.paxgService.FetchPaxg(rate)
        results <- result{"paxg", data, err}
    }()

    // ... 其余超时处理逻辑保持不变
```

- [ ] **Step 2: 验证修复**

```bash
cd backend && go build . && ./gold-monitor -port 8082
```

监控日志确认 USDCNY 只请求一次。

- [ ] **Step 3: Commit**

```bash
git add backend/services/sina.go
git commit -m "perf(sina): share USDCNY rate between goroutines via channel - eliminate duplicate HTTP call"
```

---

### Task 2.2: 消除 K线正则循环编译

**Files:**
- Modify: `backend/services/kline.go:208`

**问题:** `regexp.MustCompile(",")` 在每条 K 线记录循环中调用。

- [ ] **Step 1: 改用 strings.Split**

找到第 208 行，替换正则：

```go
// 原代码：
// parts := regexp.MustCompile(",").Split(klineStr, -1)

// 新代码：
parts := strings.Split(klineStr, ",")
```

- [ ] **Step 2: 确保已导入 strings 包**

文件顶部 imports 已有 `strings`：

```go
import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "regexp"
    "strings"  // 已存在
    "time"
)
```

- [ ] **Step 3: 验证修复**

```bash
cd backend && go build .
curl http://localhost:8082/api/kline/us | jq '.data | length'
```

- [ ] **Step 4: Commit**

```bash
git add backend/services/kline.go
git commit -m "perf(kline): use strings.Split instead of regex in loop - eliminate 100+ regex compilations per request"
```

---

### Task 2.3: HistoryStore 改用环形缓冲区

**Files:**
- Modify: `backend/handlers/gold.go:16-108`

**问题:** `AddPoint` 使用 `slice[len-max:]` 截断，每次创建新切片。

- [ ] **Step 1: 重写 HistoryStore 为环形缓冲区**

```go
// HistoryPoint 历史数据点
type HistoryPoint struct {
    Price     float64   `json:"price"`
    Timestamp time.Time `json:"timestamp"`
}

// RingBuffer 环形缓冲区
type RingBuffer struct {
    data    []HistoryPoint
    head    int // 写入位置
    count   int // 当前数量
    maxSize int
    mu      sync.RWMutex
}

// NewRingBuffer 创建环形缓冲区
func NewRingBuffer(maxSize int) *RingBuffer {
    return &RingBuffer{
        data:    make([]HistoryPoint, maxSize),
        head:    0,
        count:   0,
        maxSize: maxSize,
    }
}

// Add 添加数据点
func (rb *RingBuffer) Add(price float64, timestamp time.Time) {
    rb.mu.Lock()
    defer rb.mu.Unlock()

    rb.data[rb.head] = HistoryPoint{Price: price, Timestamp: timestamp}
    rb.head = (rb.head + 1) % rb.maxSize
    if rb.count < rb.maxSize {
        rb.count++
    }
}

// GetAll 获取所有数据（有序）
func (rb *RingBuffer) GetAll() []HistoryPoint {
    rb.mu.RLock()
    defer rb.mu.RUnlock()

    if rb.count == 0 {
        return nil
    }

    result := make([]HistoryPoint, rb.count)
    // 从最旧的数据开始复制
    start := (rb.head - rb.count + rb.maxSize) % rb.maxSize
    for i := 0; i < rb.count; i++ {
        idx := (start + i) % rb.maxSize
        result[i] = rb.data[idx]
    }
    return result
}

// HistoryStore 历史数据存储（使用环形缓冲区）
type HistoryStore struct {
    buffers   map[string]*RingBuffer
    maxSize   int
    mu        sync.RWMutex
}

// NewHistoryStore 创建历史存储
func NewHistoryStore(maxPoints int) *HistoryStore {
    return &HistoryStore{
        buffers: make(map[string]*RingBuffer),
        maxSize: maxPoints,
    }
}

// getOrCreateBuffer 获取或创建缓冲区
func (h *HistoryStore) getOrCreateBuffer(key string) *RingBuffer {
    h.mu.Lock()
    defer h.mu.Unlock()

    if h.buffers[key] == nil {
        h.buffers[key] = NewRingBuffer(h.maxSize)
    }
    return h.buffers[key]
}

// AddPoint 添加数据点
func (h *HistoryStore) AddPoint(key string, price float64, timestamp time.Time) {
    buffer := h.getOrCreateBuffer(key)
    buffer.Add(price, timestamp)
}

// GetHistory 获取历史数据
func (h *HistoryStore) GetHistory(key string) []HistoryPoint {
    h.mu.RLock()
    buffer := h.buffers[key]
    h.mu.RUnlock()

    if buffer == nil {
        return nil
    }
    return buffer.GetAll()
}
```

- [ ] **Step 2: 验证修复**

```bash
cd backend && go build . && ./gold-monitor -port 8082
curl http://localhost:8082/api/gold/prices | jq '.data.au9999.history | length'
```

- [ ] **Step 3: Commit**

```bash
git add backend/handlers/gold.go
git commit -m "perf(HistoryStore): replace slice truncation with ring buffer - eliminate memory allocations"
```

---

### Task 2.4: 优化 IndexedDB 全量读写

**Files:**
- Modify: `src/services/offlineStorage.js:114-240`

**问题:** `savePriceData` 每次保存执行 `getAll()` → 内存过滤 → `clear()` → 批量 `put()`，写放大严重。

- [ ] **Step 1: 重写 savePriceData 为单条写入**

```javascript
// 保存价格数据 - 使用单条 put + 按时间索引删除旧记录
async savePriceData(source, data) {
  await this.initPromise;
  this.stats.writes++;

  return new Promise((resolve, reject) => {
    try {
      const transaction = this.db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // 准备新记录
      const newRecord = {
        id: `${source}_${Date.now()}`,
        source,
        timestamp: Date.now(),
        compressed: false
      };

      // 尝试压缩数据
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

      // 单条写入
      const putRequest = store.put(newRecord);

      // 删除该 source 的旧记录（保留最新 500 条）
      const index = store.index('source');
      const countReq = index.count(source);

      countReq.onsuccess = () => {
        const count = countReq.result;
        if (count > MAX_RECORDS_PER_SOURCE) {
          // 使用游标删除旧记录
          const cursorReq = index.openCursor(IDBKeyRange.only(source));
          const toDelete = count - MAX_RECORDS_PER_SOURCE;
          let deleted = 0;

          cursorReq.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor && deleted < toDelete) {
              cursor.delete();
              deleted++;
              cursor.continue();
            }
          };
        }
      };

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(new Error('Failed to save record'));
      transaction.onerror = () => reject(new Error('Transaction failed'));

    } catch (error) {
      reject(error);
    }
  });
}
```

- [ ] **Step 2: 重写 getHistoryData 使用索引**

```javascript
// 获取历史数据 - 使用 source 索引
async getHistoryData(source, limit = 100) {
  await this.initPromise;

  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('source');

    const now = Date.now();
    const minTimestamp = now - DATA_EXPIRY;

    // 使用索引获取该 source 的所有记录
    const records = [];
    const cursorReq = index.openCursor(IDBKeyRange.only(source));

    cursorReq.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const record = cursor.value;
        // 检查是否过期
        if (record.timestamp >= minTimestamp) {
          // 解压数据
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
        // 游标结束，排序并返回
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
```

- [ ] **Step 3: 重写 cleanExpiredData 使用时间索引**

```javascript
// 清除过期数据 - 使用 timestamp 索引范围查询
async cleanExpiredData() {
  await this.initPromise;

  return new Promise((resolve, reject) => {
    const transaction = this.db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const now = Date.now();
    const expiryThreshold = now - DATA_EXPIRY;

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
```

- [ ] **Step 4: 验证修复**

```bash
npm run dev
```

检查浏览器 DevTools → Application → IndexedDB，确认数据正常存储。

- [ ] **Step 5: Commit**

```bash
git add src/services/offlineStorage.js
git commit -m "perf(offlineStorage): use indexed queries instead of getAll+filter - eliminate write amplification"
```

---

### Task 2.5: 消除 AnalysisPanel 重复计算函数

**Files:**
- Modify: `src/components/AnalysisPanel.vue:152-278`

**问题:** 本地定义了 `calculateRSI/ATR/EMA/MA` 等，同时从 `technicalIndicators.js` import 但被遮蔽。

- [ ] **Step 1: 删除本地重复函数**

删除第 152-278 行的本地函数定义：
- `calculateMA` (第 153-157 行)
- `calculateStdDev` (第 159-166 行)
- `calculateRSI` (第 169-182 行)
- `calculateMomentum` (第 185-189 行) - 保留（unique）
- `calculateBollingerPosition` (第 193-206 行) - 保留（unique）
- `calculateTrendStrength` (第 209-224 行) - 保留（unique）
- `calculateATR` (第 248-264 行)
- `calculateEMA` (第 267-278 行)

删除后，修改 import 使用 utils 版本：

```javascript
import {
  calculateMACD,
  calculateKDJ,
  calculateWilliamsR,
  calculateRSI,
  calculateBollingerBands,
  calculateATR,
  calculateEMA,
  calculateSMA,  // 新增：替代本地 calculateMA
  analyzeTechnicalIndicators
} from '@/utils/technicalIndicators';

// 本地保留的 unique 函数：
const calculateStdDev = (prices, period) => { ... };  // 保留
const calculateMomentum = (prices, period = 5) => { ... };  // 保留
const calculateBollingerPosition = ...;  // 保留
const calculateTrendStrength = ...;  // 保留
const calculatePriceSpread = ...;  // 保留
```

- [ ] **Step 2: 适配调用方**

修改使用 MA 的地方：

```javascript
// 原代码：calculateMA(priceArray, 5)
// 新代码：calculateSMA(priceArray, 5)
const ma5 = calculateSMA(priceArray, 5);
const ma10 = calculateSMA(priceArray, 10);
```

修改使用 RSI 的地方（utils 版本返回 `{ value, signal }`）：

```javascript
// 原代码直接用 number
const rsi = calculateRSI(priceArray, 14);

// 新代码提取 value
const rsiResult = calculateRSI(priceArray, 14);
const rsi = rsiResult.value;
```

- [ ] **Step 3: 验证修复**

```bash
npm run dev
```

检查分析面板正常显示，无报错。

- [ ] **Step 4: Commit**

```bash
git add src/components/AnalysisPanel.vue
git commit -m "perf(AnalysisPanel): remove duplicate calculation functions - use centralized technicalIndicators.js"
```

---

### Task 2.6: 优化 App.vue 深度 watcher

**Files:**
- Modify: `src/App.vue:86-105`

**问题:** `{ deep: true }` watch 复合对象，每次微变都触发深层比较。

- [ ] **Step 1: 改为 watch 单独属性**

删除深度 watcher，改为独立 watch：

```javascript
// 删除原深度 watcher：
// watch(() => ({
//   wsConnected: store.wsConnected,
//   wsReconnecting: store.wsReconnecting,
//   ...
// }, (status) => { ... }, { deep: true })

// 改为 watch lastUpdate 触发数据加载状态
watch(() => store.lastUpdate, (newTime) => {
  if (newTime && !isDataLoaded.value) {
    isDataLoaded.value = true;
  }
});

// SyncIndicator 改为 props 驱动（见 Step 2）
```

- [ ] **Step 2: 修改 SyncIndicator 为 props 驱动**

修改 App.vue 模板中的 SyncIndicator：

```vue
<SyncIndicator
  :connected="store.wsConnected"
  :reconnecting="store.wsReconnecting"
  :latency="store.syncStats.latency"
  :record-count="store.syncStats.recordCount"
  :last-update="store.lastUpdate"
  :source-status="store.sourceStatus"
/>
```

修改 SyncIndicator.vue 接收 props（不使用 defineExpose）：

```javascript
const props = defineProps({
  connected: Boolean,
  reconnecting: Boolean,
  latency: Number,
  recordCount: Number,
  lastUpdate: Number,
  sourceStatus: Object
});

// 使用 computed 计算显示状态
const connectionStatus = computed(() => {
  if (props.reconnecting) return 'reconnecting';
  if (props.connected) return 'connected';
  return 'disconnected';
});
```

- [ ] **Step 3: 验证修复**

```bash
npm run dev
```

检查同步指示器正常显示状态。

- [ ] **Step 4: Commit**

```bash
git add src/App.vue src/components/SyncIndicator.vue
git commit -m "perf(App): replace deep watcher with individual property watches - props-driven SyncIndicator"
```

---

### Task 2.7: 验证第二阶段并提交

- [ ] **Step 1: 运行完整验证**

```bash
cd backend && go build .
npm run build
```

- [ ] **Step 2: 确认所有性能优化完成**

检查列表：
- USDCNY 重复请求消除 ✓
- 正则循环编译消除 ✓
- HistoryStore 环形缓冲区 ✓
- IndexedDB 索引查询 ✓
- AnalysisPanel 重复函数消除 ✓
- App.vue 深度 watcher 优化 ✓

---

## 第三阶段：代码质量重构

### Task 3.1: 统一 API 基础地址

**Files:**
- Modify: `src/constants/index.js`
- Modify: `src/utils/request.js`
- Modify: `src/components/KlineChart.vue`
- Modify: `src/components/NewsPanel.vue`

**问题:** `getApiBase()` / `API_BASE` 在三处独立实现。

- [ ] **Step 1: 在 constants 导出唯一 API_BASE**

```javascript
// src/constants/index.js 新增：

// API 基础地址
export const API_BASE = (() => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8081/api';
  }
  return `${window.location.protocol}//${window.location.host}/api`;
})();
```

- [ ] **Step 2: 修改 request.js 使用常量**

```javascript
// src/utils/request.js
import { API_BASE } from '@/constants';

const CONFIG = {
  baseURL: API_BASE,  // 使用常量
  timeout: 10000,
  ...
};
```

- [ ] **Step 3: 修改 KlineChart.vue**

删除本地 API_BASE 计算：

```javascript
// 删除：
// const API_BASE = ...

// 新增 import：
import { API_BASE } from '@/constants';

// 使用：
axios.get(`${API_BASE}/kline/${symbol}`, { params: { period } })
```

- [ ] **Step 4: 修改 NewsPanel.vue**

删除本地 getApiBase：

```javascript
// 删除：
// const getApiBase = () => { ... }

// 新增 import：
import { API_BASE } from '@/constants';

// 使用：
fetch(`${API_BASE}/news`)
```

- [ ] **Step 5: Commit**

```bash
git add src/constants/index.js src/utils/request.js src/components/KlineChart.vue src/components/NewsPanel.vue
git commit -m "refactor: unify API_BASE in constants - eliminate 3 duplicate implementations"
```

---

### Task 3.2: 统一后端缓存机制

**Files:**
- Modify: `backend/cache/cache.go`
- Modify: `backend/handlers/news.go`
- Modify: `backend/services/dxy.go`
- Modify: `backend/services/paxg.go`

**问题:** 三套独立缓存机制。

- [ ] **Step 1: 扩展 cache.Cache 支持无限缓存**

```go
// backend/cache/cache.go 新增：

// SetForever 设置永不过期的缓存项
func (c *Cache) SetForever(key string, value interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()
    // 使用极大时间表示永不过期
    c.items[key] = CacheItem{
        Value:      value,
        Expiration: time.Now().Add(100 * 365 * 24 * time.Hour), // 100年
    }
}

// SetWithOptionalTTL 设置缓存，duration=0 表示永不过期
func (c *Cache) SetWithOptionalTTL(key string, value interface{}, duration time.Duration) {
    if duration == 0 {
        c.SetForever(key, value)
    } else {
        c.Set(key, value, duration)
    }
}
```

- [ ] **Step 2: 修改 NewsHandler 使用 cache.Cache**

```go
// backend/handlers/news.go

import "gold-monitor-backend/cache"

type NewsHandler struct {
    newsService *services.NewsService
    cache       *cache.Cache
    cacheTTL    time.Duration
}

func NewNewsHandler() *NewsHandler {
    return &NewsHandler{
        newsService: services.NewNewsService(),
        cache:       cache.NewCache(),
        cacheTTL:    5 * time.Minute,
    }
}

func (h *NewsHandler) GetNews(c *gin.Context) {
    cacheKey := "gold_news"

    if cached, found := h.cache.Get(cacheKey); found {
        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data":    cached,
            "cached":  true,
        })
        return
    }

    news, err := h.newsService.FetchGoldNews()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{...})
        return
    }

    h.cache.Set(cacheKey, news, h.cacheTTL)

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    news,
        "cached":  false,
    })
}
```

- [ ] **Step 3: 修改 DxyService/PaxgService 使用外部 cache**

创建共享缓存实例或让 handler 传入：

```go
// backend/services/dxy.go
type DxyService struct {
    client *http.Client
    cache  *cache.Cache  // 改用 cache.Cache
}

func (s *DxyService) cacheResult(data *models.ExchangeRate) {
    s.cache.SetForever("dxy", data)  // 永不过期
}

func (s *DxyService) getCachedData() *models.ExchangeRate {
    if cached, found := s.cache.Get("dxy"); found {
        if data, ok := cached.(*models.ExchangeRate); ok {
            return data
        }
    }
    return nil
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/cache/cache.go backend/handlers/news.go backend/services/dxy.go backend/services/paxg.go
git commit -m "refactor(cache): unify caching to cache.Cache - remove sync.Map and per-service caches"
```

---

### Task 3.3: 清理前端死代码

**Files:**
- Modify: `src/utils/technicalIndicators.js`
- Modify: `src/stores/goldStore.js`
- Modify: `src/services/websocket.js`

**问题:** 多处函数从未被调用。

- [ ] **Step 1: 清理 technicalIndicators.js 死代码**

删除以下从未调用的函数（约 300 行）：
- `detectPricePatterns` (第 630+ 行)
- `calculateRiskLevel` (第 580+ 行)
- `detectDoubleBottom`、`detectDoubleTop`、`detectAscendingTriangle`、`detectDescendingTriangle`、`detectHeadShouldersBottom`、`detectHeadShouldersTop`

保留实际使用的函数：
- `calculateSMA`、`calculateEMA`、`calculateMACD`、`calculateKDJ`、`calculateWilliamsR`、`calculateRSI`、`calculateBollingerBands`、`calculateATR`
- `analyzeTechnicalIndicators`

- [ ] **Step 2: 清理 goldStore.js 死代码**

删除空方法 `debouncedSave()`：

```javascript
// 删除第 30-31 行注释和后续空方法
// 防抖保存定时器 - 已废弃，改用 $subscribe
```

- [ ] **Step 3: 清理 websocket.js 死代码**

删除从未调用的 `setupNetworkListener()`：

```javascript
// 删除整个 setupNetworkListener 方法（约 30 行）
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/technicalIndicators.js src/stores/goldStore.js src/services/websocket.js
git commit -m "refactor: remove dead code - unused pattern detection, empty methods, unconnected network listener"
```

---

### Task 3.4: 清理后端死代码

**Files:**
- Modify: `backend/models/gold.go`
- Modify: `backend/services/news.go`

**问题:** `models.NewsItem` 未使用，`FetchGoldNewsFromEastMoney` 和 `getFallbackNews` 从未调用。

- [ ] **Step 1: 删除 models.NewsItem**

```go
// backend/models/gold.go - 删除 NewsItem 结构体

// 保留：
// - GoldPrice
// - ExchangeRate
// - AllPricesResponse

// 删除：
// type NewsItem struct { ... }
```

- [ ] **Step 2: 删除 news.go 死代码**

删除以下函数：
- `FetchGoldNewsFromEastMoney` (从未调用)
- `getFallbackNews` (从未调用)

- [ ] **Step 3: 修复 extractTag 中文关键词**

```go
// backend/services/news.go - extractTag 函数

func extractTag(title string) (string, string) {
    titleLower := strings.ToLower(title)

    // 修改为中文关键词
    if strings.Contains(title, "热门") || strings.Contains(title, "关注") {
        return "hot", "热门"
    }
    if strings.Contains(title, "新高") || strings.Contains(title, "突破") {
        return "new_high", "新高"
    }
    // ... 其他关键词改为中文匹配
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/models/gold.go backend/services/news.go
git commit -m "refactor: remove dead code - unused NewsItem model, uncalled news fetchers, fix Chinese keywords"
```

---

### Task 3.5: 消除重复常量

**Files:**
- Modify: `src/stores/goldStore.js:8-28`
- Modify: `src/constants/index.js`

**问题:** `MAX_HISTORY_LENGTH`、`REFRESH_INTERVALS` 在两处重复定义。

- [ ] **Step 1: 删除 goldStore.js 本地常量**

```javascript
// src/stores/goldStore.js
import {
  MAX_HISTORY_LENGTH,
  HISTORY_MAX_AGE,
  REFRESH_INTERVALS
} from '@/constants';

// 删除第 8-28 行的本地定义：
// const MAX_HISTORY_LENGTH = 360;
// const HISTORY_MAX_AGE = 30 * 60 * 1000;
// const SMART_POLLING = { ... };
```

- [ ] **Step 2: 更新使用处**

```javascript
// 原代码使用 SMART_POLLING.intervals
// 新代码使用 REFRESH_INTERVALS
const intervals = REFRESH_INTERVALS;
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/goldStore.js src/constants/index.js
git commit -m "refactor: import shared constants from constants/index.js - eliminate duplicate definitions"
```

---

### Task 3.6: KlineChart 和 NewsPanel 统一请求层

**Files:**
- Modify: `src/services/api.js`
- Modify: `src/components/KlineChart.vue`
- Modify: `src/components/NewsPanel.vue`

**问题:** 直接用 axios/fetch，绕过 request.js 的重试和去重。

- [ ] **Step 1: 扩展 api.js**

```javascript
// src/services/api.js

import request from '@/utils/request';

const ENDPOINTS = {
  allPrices: '/gold/prices',
  source: '/gold/source',
  kline: '/kline',           // 新增
  news: '/news'              // 新增
};

// 获取 K 线数据
export async function fetchKlineData(symbol, period = 'day') {
  return request.get(`${ENDPOINTS.kline}/${symbol}`, { period });
}

// 获取新闻数据
export async function fetchNews() {
  return request.get(ENDPOINTS.news);
}

// 原有函数保持不变
export async function fetchAllPrices(options = {}) {
  return request.get(ENDPOINTS.allPrices, {}, options);
}

export async function setDataSource(source) {
  return request.post(ENDPOINTS.source, { source });
}
```

- [ ] **Step 2: 修改 KlineChart.vue**

```javascript
import { fetchKlineData } from '@/services/api';

// 删除 axios 直接调用
// 原：axios.get(`${API_BASE}/kline/${symbol}`)
// 新：
const response = await fetchKlineData(symbol, period);
if (response.success) {
  // 处理数据
}
```

- [ ] **Step 3: 修改 NewsPanel.vue**

```javascript
import { fetchNews } from '@/services/api';

// 删除 fetch 直接调用
// 原：fetch(`${API_BASE}/news`)
// 新：
const response = await fetchNews();
if (response.success) {
  news.value = response.data;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/services/api.js src/components/KlineChart.vue src/components/NewsPanel.vue
git commit -m "refactor: route KlineChart and NewsPanel requests through api.js - unified retry/dedupe handling"
```

---

### Task 3.7: 修复 PAXG 名称错字

**Files:**
- Modify: `backend/services/paxg.go:124`

**问题:** PAXG 名称设为 `"国际暗金"`（暗金应为合理描述）。

- [ ] **Step 1: 修改名称**

```go
// 第 124 行
result := &models.GoldPrice{
    Name:          "PAXG数字黄金",  // 改为合理名称
    Symbol:        "PAXG",
    ...
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/services/paxg.go
git commit -m "fix(paxg): correct display name to 'PAXG数字黄金'"
```

---

### Task 3.8: 后端错误响应规范化

**Files:**
- Modify: `backend/handlers/kline.go`
- Modify: `backend/main.go:140-162`

**问题:** K线 handler 错误时返回 HTTP 200，静态文件错误被静默忽略。

- [ ] **Step 1: 修改 kline.go 错误状态码**

```go
// GetAu9999Kline
func (h *KlineHandler) GetAu9999Kline(c *gin.Context) {
    data, err := h.klineService.FetchAu9999Kline()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{  // 改为 500
            "success": false,
            "error":   err.Error(),
        })
        return
    }
    // ...
}

// GetKlineBySymbol
func (h *KlineHandler) GetKlineBySymbol(c *gin.Context) {
    // ...
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{  // 改为 500
            "success": false,
            "error":   err.Error(),
        })
        return
    }
    // ...
}

// GetUsFuturesKline - 确实无数据时返回 500
errMsg := "no data available"
if err != nil {
    errMsg = err.Error()
}
if data == nil || len(data) == 0 {
    c.JSON(http.StatusInternalServerError, gin.H{
        "success": false,
        "error":   errMsg,
    })
    return
}
```

- [ ] **Step 2: 修改 main.go 静态文件错误处理**

```go
r.GET("/favicon.svg", func(c *gin.Context) {
    data, err := fs.ReadFile(staticFS, "favicon.svg")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "file not found"})
        return
    }
    c.Data(200, "image/svg+xml", data)
})
// 同样修改 icons.svg 和 index.html 的 handler
```

- [ ] **Step 3: Commit**

```bash
git add backend/handlers/kline.go backend/main.go
git commit -m "refactor: return proper HTTP error codes - 500 for kline errors, handle static file errors"
```

---

### Task 3.9: 验证第三阶段并提交

- [ ] **Step 1: 运行完整验证**

```bash
cd backend && go build . && go vet ./...
npm run build
```

- [ ] **Step 2: 确认所有代码重构完成**

检查列表：
- API_BASE 统一 ✓
- 后端缓存统一 ✓
- 前端死代码清理 ✓
- 后端死代码清理 ✓
- 重复常量消除 ✓
- 请求层统一 ✓
- PAXG 名称修复 ✓
- 错误响应规范 ✓

---

## 最终验证与提交

### Task 4.1: 完整项目验证

- [ ] **Step 1: 后端验证**

```bash
cd backend
go build .
go vet ./...
./gold-monitor -port 8081
```

测试所有 API：

```bash
curl http://localhost:8081/api/health
curl http://localhost:8081/api/gold/prices | jq '.success'
curl http://localhost:8081/api/kline/au9999 | jq '.success'
curl http://localhost:8081/api/news | jq '.success'
```

- [ ] **Step 2: 前端验证**

```bash
npm run build
npm run preview
```

打开浏览器测试：
- 首页加载正常
- WebSocket 连接成功
- 价格卡片显示正确（无双 ¥）
- 分析面板显示完整
- K 线图正常加载
- 新闻列表正常显示

- [ ] **Step 3: 创建最终提交标签**

```bash
git add -A
git commit -m "optimization complete: 6 bug fixes, 6 performance improvements, 8 code quality refactorings"
git tag -a v1.0.0-optimized -m "黄金看盘全面优化版本"
```

---

## 不在范围内的改进

以下问题已识别但不纳入本次优化：

- CORS/WebSocket 允许所有来源（需配合部署环境决策）
- 无速率限制（需引入 gin 中间件）
- 无优雅关机（需引入 signal handling）
- Alpine 基础镜像未固定版本（需修改 Dockerfile）
- 前端测试体系建设