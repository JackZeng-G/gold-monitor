# 黄金看盘 (Gold Monitor)

一个专业的实时黄金价格监控与分析平台，提供多维度金价数据、技术图表分析和市场资讯。

![Vue 3](https://img.shields.io/badge/Vue%203-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-FF6600?style=flat-square)

## 功能特性

### 实时价格监控
- **Au9999 现货** - 上海黄金交易所实时行情
- **美国期货** - COMEX 黄金期货价格
- **伦敦金** - 国际现货黄金价格
- **PAXG 数字黄金** - 加密货币锚定黄金
- **美元指数 (DXY)** - 美元强弱指标
- **人民币汇率** - USD/CNY 实时汇率

### 技术图表分析
- **K线图表** - 支持多时间周期切换
- **技术指标** - RSI、MACD、移动平均线
- **历史走势** - 实时更新价格曲线
- **数据对比** - 多品种价格关联分析

### 实时数据推送
- **WebSocket 连接** - 毫秒级数据更新
- **增量推送** - 仅传输变化数据，节省带宽
- **智能重连** - 网络恢复后自动重连
- **降级机制** - WebSocket 失败自动切换到 HTTP 轮询

### 用户体验
- **响应式设计** - 完美适配桌面和移动设备
- **骨架屏加载** - 流畅的初始加载体验
- **离线存储** - IndexedDB 缓存历史数据
- **数据压缩** - 传输数据压缩，节省流量
- **价格闪烁** - 涨跌实时视觉反馈

## 技术栈

### 前端
- **Vue 3** - 组合式 API，响应式数据
- **Pinia** - 状态管理
- **ECharts** - 专业图表库
- **Vite** - 快速构建工具
- **SCSS** - 样式预处理

### 后端
- **Go** - 高性能服务端
- **Gin** - Web 框架
- **WebSocket** - 实时双向通信
- **缓存层** - 内存缓存 + 环形缓冲区

## 项目结构

```
.
├── backend/                # Go 后端服务
│   ├── cache/              # 缓存实现
│   ├── handlers/           # HTTP 处理器
│   │   ├── gold.go         # 黄金价格 API
│   │   ├── kline.go        # K线数据 API
│   │   ├── news.go         # 新闻 API
│   │   └── websocket.go    # WebSocket 处理
│   ├── models/             # 数据模型
│   ├── services/           # 数据服务
│   │   ├── sina.go         # 新浪财经数据源
│   │   ├── dxy.go          # 美元指数服务
│   │   ├── paxg.go         # PAXG 服务
│   │   ├── kline.go        # K线数据服务
│   │   └── news.go         # 新闻服务
│   └── main.go             # 服务入口
├── src/                    # 前端源码
│   ├── components/         # Vue 组件
│   ├── services/           # 前端服务层
│   ├── stores/             # Pinia 状态存储
│   ├── utils/              # 工具函数
│   └── constants/          # 常量定义
├── dist/                   # 构建输出
└── index.html              # 入口页面
```

## 快速开始

### 环境要求
- Go 1.21+
- Node.js 18+

### 开发模式

1. 安装前端依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 启动后端服务（新终端）
```bash
cd backend
go run main.go
```

访问 http://localhost:5173 查看应用

### 生产构建

1. 构建前端
```bash
npm run build
```

2. 复制静态文件到后端
```bash
cp -r dist/* backend/static/
```

3. 构建后端二进制文件
```bash
cd backend
go build -ldflags "-X main.Version=1.0.0 -X 'main.BuildTime=$(date -Iseconds)'" -o gold-monitor
```

4. 运行
```bash
./gold-monitor -port 8081
```

## API 接口

### 黄金价格
| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/gold/prices` | GET | 获取所有价格 |
| `/api/gold/au9999` | GET | Au9999 现货 |
| `/api/gold/us` | GET | 美国期货 |
| `/api/gold/uk` | GET | 伦敦金 |
| `/api/gold/usdcny` | GET | 人民币汇率 |
| `/api/gold/dxy` | GET | 美元指数 |
| `/api/gold/paxg` | GET | PAXG 数字黄金 |

### K线数据
| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/kline/au9999` | GET | Au9999 K线 |
| `/api/kline/us` | GET | 美国期货 K线 |

### 其他
| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/news` | GET | 黄金资讯 |
| `/api/health` | GET | 健康检查 |
| `/api/ws` | WS | WebSocket 实时连接 |

## 数据源

- **新浪财经** - 国内黄金、外汇、期货数据
- **英为财情** - 美元指数、国际金价
- **金色财经** - 黄金新闻资讯
- **Sina Finance** - K线历史数据

## 许可证

[GNU General Public License v3.0](LICENSE)

---

*黄金价格瞬息万变，投资有风险，入市需谨慎。*