package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"

	"gold-monitor-backend/handlers"
)

//go:embed static/*
var staticFiles embed.FS

// 版本信息（通过 -ldflags 注入）
var (
	Version   = "dev"
	BuildTime = "unknown"
)

func main() {
	// 禁用 stdout 缓冲，确保 Docker 日志实时输出
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)
	log.SetOutput(os.Stdout)

	// 命令行参数
	port := flag.Int("port", 8081, "HTTP server port")
	showVersion := flag.Bool("version", false, "Show version info")
	flag.Parse()

	// 显示版本信息
	if *showVersion {
		fmt.Printf("黄金看盘 v%s (built at %s)\n", Version, BuildTime)
		return
	}

	log.Printf("🚀 黄金看盘 v%s starting...", Version)

	// 设置 Gin 模式
	gin.SetMode(gin.ReleaseMode)

	// 创建 Gin 实例（健康检查智能日志：正常静默，异常最多3次，恢复1次）
	r := gin.New()
	r.Use(gin.Recovery(), healthAwareLogger())

	// 配置 CORS - 允许所有本地开发端口
	config := cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(config))

	// 启用 gzip 压缩（减少传输数据量 30%-50%）
	r.Use(gzip.Gzip(gzip.DefaultCompression))

	// 创建 WebSocket Hub 并启动
	wsHub := handlers.NewWSHub()
	go wsHub.Run()

	// 创建处理器（单一实例，ticker 和路由共享）
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
		// 黄金价格相关
		gold := api.Group("/gold")
		{
			gold.GET("/prices", goldHandler.GetAllPrices)
			gold.GET("/au9999", goldHandler.GetAu9999)
			gold.GET("/us", goldHandler.GetUsFutures)
			gold.GET("/uk", goldHandler.GetUkFutures)
			gold.GET("/usdcny", goldHandler.GetUsdCny)
			gold.GET("/dxy", goldHandler.GetDxy)
			gold.GET("/paxg", goldHandler.GetPaxg)
		}

		// K线数据
		kline := api.Group("/kline")
		{
			kline.GET("/au9999", klineHandler.GetAu9999Kline)
			kline.GET("/us", klineHandler.GetUsFuturesKline)
			kline.GET("/symbol/:symbol", klineHandler.GetKlineBySymbol)
			kline.GET("/symbol", klineHandler.GetKlineBySymbol)
		}

		// 新闻相关
		api.GET("/news", newsHandler.GetNews)

		// 健康检查
		api.GET("/health", goldHandler.HealthCheck)

		// WebSocket 实时数据
		api.GET("/ws", handlers.HandleWebSocket(wsHub))
	}

	// 内嵌静态文件服务
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal("Failed to load static files:", err)
	}
	httpFS := http.FS(staticFS)

	// 静态资源目录
	r.GET("/assets/*filepath", func(c *gin.Context) {
		filepath := c.Param("filepath")
		c.FileFromFS("/assets"+filepath, httpFS)
	})

	// 根目录静态文件
	r.GET("/favicon.svg", func(c *gin.Context) {
		data, err := fs.ReadFile(staticFS, "favicon.svg")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "favicon not found"})
			return
		}
		c.Data(200, "image/svg+xml", data)
	})
	r.GET("/icons.svg", func(c *gin.Context) {
		data, err := fs.ReadFile(staticFS, "icons.svg")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "icons not found"})
			return
		}
		c.Data(200, "image/svg+xml", data)
	})

	// 首页
	r.GET("/", func(c *gin.Context) {
		data, err := fs.ReadFile(staticFS, "index.html")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "index.html not found"})
			return
		}
		c.Data(200, "text/html; charset=utf-8", data)
	})

	// SPA 路由：所有其他非 API、非静态路由返回 index.html
	r.NoRoute(func(c *gin.Context) {
		// 如果请求的是 API 路径但不存在，返回 404
		if len(c.Request.URL.Path) >= 4 && c.Request.URL.Path[:4] == "/api" {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		data, err := fs.ReadFile(staticFS, "index.html")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "index.html not found"})
			return
		}
		c.Data(200, "text/html; charset=utf-8", data)
	})

	// 启动服务
	addr := fmt.Sprintf(":%d", *port)
	log.Printf("🚀 Server starting on http://localhost:%d", *port)
	log.Println("📊 API endpoints:")
	log.Println("   GET /api/gold/prices - 获取所有价格")
	log.Println("   GET /api/gold/au9999 - Au9999 黄金")
	log.Println("   GET /api/gold/us     - 美国期货")
	log.Println("   GET /api/gold/uk     - 英国/伦敦金")
	log.Println("   GET /api/gold/usdcny - 美元人民币汇率")
	log.Println("   GET /api/gold/dxy    - 美元指数")
	log.Println("   GET /api/gold/paxg   - PAXG 数字黄金")
	log.Println("   GET /api/news        - 黄金资讯")
	log.Println("   GET /api/health      - 健康检查")
	log.Printf("📱 Frontend: http://localhost:%d (embedded)", *port)

	if err := r.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// healthAwareLogger 健康检查智能日志中间件
// 正常请求正常记录；/api/health 正常时静默，异常最多记3次，恢复记1次
func healthAwareLogger() gin.HandlerFunc {
	stdLogger := gin.Logger()
	var (
		mu           sync.Mutex
		failureCount int
		wasUnhealthy bool
	)

	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// 非健康检查请求，走标准 gin logger
		if path != "/api/health" {
			stdLogger(c)
			return
		}

		// 健康检查请求，先执行handler拿到status
		c.Next()
		status := c.Writer.Status()

		mu.Lock()
		defer mu.Unlock()

		if status >= 400 {
			if failureCount < 3 {
				log.Printf("[HEALTH] ❌ 异常 status=%d (第%d次)", status, failureCount+1)
			}
			failureCount++
			wasUnhealthy = true
		} else if wasUnhealthy {
			log.Printf("[HEALTH] ✅ 恢复正常 (之前连续异常%d次)", failureCount)
			failureCount = 0
			wasUnhealthy = false
		}
		// 正常时不打日志
	}
}
