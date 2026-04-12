# 黄金看盘项目全面优化设计文档

**日期：** 2026-04-12
**状态：** 待审核
**策略：** 分阶段顺序优化（Bug → 性能 → 代码质量）
**约束：** 保持 API 接口兼容，允许修复 UI bug，按阶段提交

---

## 项目概况

黄金看盘是一个 Vue 3 + Go (Gin) 的黄金价格实时监控系统。前端约 4000+ 行代码（14 个组件，6 个服务，1 个 store），后端约 2400+ 行代码（5 个 handler，5 个 service，1 个 cache 包）。数据源来自新浪财经、东方财富、Gate.io/Binance。

本次优化发现：6 个 Bug、6 个性能问题、8 个代码质量问题，共计 20 项改进。

---

## 第一阶段：Bug 修复

### 1.1 WebSocket Hub 数据竞争（严重）

**文件：** `backend/handlers/websocket.go`
**问题：** broadcast 分支在 `RLock` 下调用 `delete(h.clients, client)` 和 `close(client.send)`，修改 map 但只持读锁，高并发下会 panic。
**修复：** 在 broadcast 的 `RLock` 区间内，将需要清理的 client 收集到 `pendingDeletes` 切片中。退出 `RLock` 后，获取 `Lock` 统一执行 delete 和 close 操作。

### 1.2 重复 GoldHandler 实例（严重）

**文件：** `backend/main.go`
**问题：** ticker goroutine（第 77 行）和 HTTP 路由（第 87 行）各创建独立的 `GoldHandler`，导致缓存、历史存储、`lastPrices` 完全隔离，ticker 写入的数据对 HTTP 请求不可见。
**修复：** 只创建一个 `GoldHandler` 实例，传入 ticker goroutine 和路由注册。

### 1.3 StatsGrid 双 ¥ 符号（中等）

**文件：** `src/components/StatsGrid.vue`
**问题：** 模板第 22 行渲染 `{{ stat.isRate ? '' : '¥' }}`，CSS 第 309-314 行 `::before { content: '¥' }` 也添加 ¥，导致非汇率项显示 `¥¥`。
**修复：** 移除 CSS `::before` 伪元素中的 `content: '¥'`，仅保留模板中的条件渲染。

### 1.4 AnalysisPanel 覆盖短期分析（中等）

**文件：** `src/components/AnalysisPanel.vue`
**问题：** `performAnalysis()` 第 655-658 行在 `analyzeShortTerm()` 设置完 `shortAnalysis` 后又覆盖了其 `items`，导致短期分析项被技术指标信号错误替换。
**修复：** 将技术指标信号合并到现有分析项中（追加或更新对应项），而非整体替换 items 数组。

### 1.5 PAXG/DXY 硬编码零变动（低）

**文件：** `src/components/StatsGrid.vue`
**问题：** PAXG 和 DXY 的 `change`、`percent`、`trend` 被硬编码为 `0/0/'flat'`，store 中的真实变动数据被忽略。
**修复：** 从 store 的 `paxg` 和 `dxy` 数据中读取 `change`、`changePercent`，并据此计算 `trend`。

### 1.6 dataRecovery 过滤器失效（低）

**文件：** `src/services/dataRecovery.js`
**问题：** `getRecoveryData` 按 `u.source` 过滤，但 `savePendingUpdate` 从未设置 `source` 字段，过滤结果永远为空。此外，这是只读仪表盘，pending-update 机制本身无意义。
**修复：** 移除 pending-update 相关代码（`savePendingUpdate`、`startRecovery` 中的 pending 逻辑、`getRecoveryData`），仅保留离线数据恢复功能。

---

## 第二阶段：性能优化

### 2.1 FetchAll 重复请求 USDCNY（高）

**文件：** `backend/services/sina.go`
**问题：** `FetchAll` 中 USDCNY 在自己的 goroutine 和 PAXG goroutine 内各请求一次，每 3 秒多一次 HTTP 调用。
**修复：** USDCNY 只请求一次，结果通过 channel 传递给 PAXG goroutine，或在所有 goroutine 完成后统一计算 CNY 价格。

### 2.2 K线正则循环编译（高）

**文件：** `backend/services/kline.go`
**问题：** 第 208 行 `regexp.MustCompile(",")` 在每条 K 线记录的循环中调用，每请求 100+ 次正则编译。
**修复：** 改为 `strings.Split(klineStr, ",")`。

### 2.3 HistoryStore 切片截断（中）

**文件：** `backend/handlers/gold.go`
**问题：** `AddPoint` 使用 `slice[len-max:]` 截断，每次创建新切片头，高频写入下 GC 压力大。
**修复：** 改为环形缓冲区实现。固定容量底层数组，通过 `head`/`tail`/`count` 字段管理数据范围，`AddPoint` 只写入位置并移动指针，无内存分配。提供 `GetAll()` 方法返回有序快照。

### 2.4 IndexedDB 全量读写（高）

**文件：** `src/services/offlineStorage.js`
**问题：** `savePriceData` 每次保存执行 `getAll()` → 内存过滤 → `clear()` → 批量 `put()`，写放大严重。`getHistoryData` 和 `cleanExpiredData` 同样全量扫描。
**修复：**
- `savePriceData`：单条 `store.put()` 写入，然后用 `timestamp` 索引删除超出 500 条或 30 分钟的旧记录
- `getHistoryData`：使用 `source` 索引的游标查询
- `cleanExpiredData`：使用 `timestamp` 索引的范围查询（`IDBKeyRange.upperBound(expiryTime)`）

### 2.5 AnalysisPanel 重复计算函数（中）

**文件：** `src/components/AnalysisPanel.vue`, `src/utils/technicalIndicators.js`
**问题：** AnalysisPanel 本地定义了 `calculateRSI`、`calculateATR`、`calculateEMA`、`calculateMA`、`calculateStdDev`（约 150 行），同时从 `technicalIndicators.js` import 了同名函数但被遮蔽。
**修复：** 删除 AnalysisPanel 中所有本地计算函数，统一使用 `technicalIndicators.js` 的版本。调整调用方适配返回值差异（如 RSI 返回 `{ value, signal }` 对象而非纯数字）。

### 2.6 App.vue 深度 watcher（低）

**文件：** `src/App.vue`
**问题：** `{ deep: true }` watch 包含 syncStatus、latency、recordCount、lastUpdate、sourceStatus 的复合对象，每次微变都触发深层比较。
**修复：** 改为 watch 单独的响应式属性（如 `store.lastUpdate`），将 SyncIndicator 改为 props 驱动。移除 `defineExpose` 命令式调用。

---

## 第三阶段：代码质量重构

### 3.1 统一 API 基础地址（高）

**文件：** `src/utils/request.js`, `src/components/KlineChart.vue`, `src/components/NewsPanel.vue`, `src/constants/index.js`
**问题：** `getApiBase()` / `API_BASE` 在三处独立实现相同的 dev/prod 判断逻辑。
**修复：** 在 `constants/index.js` 中导出唯一的 `API_BASE` 常量，所有模块统一引用。删除其他位置的重复实现。

### 3.2 统一后端缓存机制（高）

**文件：** `backend/cache/cache.go`, `backend/handlers/news.go`, `backend/services/dxy.go`, `backend/services/paxg.go`, `backend/services/kline.go`
**问题：** 三套独立缓存机制（`cache.Cache`、`sync.Map + 手动 TTL`、per-service `cachedData` 字段），行为不一致，认知负担高。
**修复：** 全部统一使用 `cache.Cache` 包。为需要长 TTL 或无限缓存的场景，扩展 `cache.Cache` 支持永不过期选项。移除 news handler 中的 `sync.Map`，移除各 service 中的独立缓存字段。

### 3.3 清理前端死代码（中）

**文件：** `src/utils/technicalIndicators.js`, `src/stores/goldStore.js`, `src/services/websocket.js`
**问题：**
- `technicalIndicators.js`：`detectPricePatterns`、`calculateRiskLevel`、多个 `detect*` 模式识别函数（约 300 行）从未被调用
- `goldStore.js`：`debouncedSave()` 空方法
- `websocket.js`：`setupNetworkListener()` 从未被调用
**修复：** 删除所有未调用函数。保留 `technicalIndicators.js` 中被 AnalysisPanel 实际使用的函数。

### 3.4 清理后端死代码（中）

**文件：** `backend/models/gold.go`, `backend/services/news.go`
**问题：**
- `models.NewsItem` 未被使用（service 定义了自己的版本）
- `FetchGoldNewsFromEastMoney()`、`getFallbackNews()` 从未被调用
- `extractTag` 中英文关键词匹配中文内容
**修复：** 删除 `models.NewsItem`。删除未调用的函数。将 `extractTag` 关键词改为中文匹配（如 `"hot"` → `"热门"`、`"new high"` → `"新高"`）。

### 3.5 消除重复常量（中）

**文件：** `src/stores/goldStore.js`, `src/constants/index.js`
**问题：** `MAX_HISTORY_LENGTH`、`HISTORY_MAX_AGE`、`REFRESH_INTERVALS` 在两处重复定义，store 使用本地副本。
**修复：** store 中删除本地定义，统一从 `constants/index.js` 导入。

### 3.6 KlineChart 和 NewsPanel 统一请求层（中）

**文件：** `src/components/KlineChart.vue`, `src/components/NewsPanel.vue`, `src/services/api.js`, `src/utils/request.js`
**问题：** KlineChart 直接用 `axios`，NewsPanel 直接用 `fetch()`，绕过了 `request.js` 的重试、去重和错误处理。
**修复：** 在 `api.js` 中增加 `getKlineData(symbol, period)` 和 `getNews()` 方法，通过 `request.js` 发起请求。KlineChart 和 NewsPanel 改为调用 `api.js`。

### 3.7 PAXG 名称错字（低）

**文件：** `backend/services/paxg.go`
**问题：** 第 124 行 PAXG 名称设为 `"国际暗金"`（暗金），应为合理描述。
**修复：** 改为 `"PAXG数字黄金"`。

### 3.8 后端错误响应规范化（低）

**文件：** `backend/handlers/kline.go`, `backend/main.go`
**问题：** kline handler 错误时返回 HTTP 200 + `success: false`。main.go 静态文件读取错误被静默忽略。
**修复：** kline handler 错误时返回 HTTP 500。静态文件读取失败返回 HTTP 500。

---

## 提交策略

按阶段提交，每阶段完成后验证：

1. **commit 1：** `fix: 修复 6 个关键和一般 Bug（数据竞争、双实例、UI 错误等）`
2. **commit 2：** `perf: 优化 6 个性能瓶颈（HTTP 重复请求、正则编译、IndexedDB 全量读写等）`
3. **commit 3：** `refactor: 代码质量重构（统一缓存、消除重复、清理死代码等）`

## 风险评估

| 阶段 | 风险 | 缓解措施 |
|------|------|---------|
| Bug 修复 | WebSocket 修复可能影响实时推送 | 修复后手动测试 WebSocket 连接和数据推送 |
| 性能优化 | IndexedDB 重构可能影响离线缓存 | 保留数据结构不变，只优化访问模式 |
| 代码重构 | 统一缓存可能引入新的 TTL 行为差异 | 保持原有 TTL 值，只统一实现机制 |

## 不在本次范围内

以下问题已识别但不纳入本次优化：
- CORS/WebSocket 允许所有来源（需配合部署环境决策）
- 无速率限制（需引入中间件）
- 无优雅关机（需引入 signal handling）
- Alpine 基础镜像未固定版本
- Docker 构建流程优化
- 前端 unit test / e2e test 建设
