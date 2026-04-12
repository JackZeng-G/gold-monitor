package handlers

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"gold-monitor-backend/services"
)

// NewsHandler 新闻处理器
type NewsHandler struct {
	newsService *services.NewsService
	cache       *sync.Map
	cacheTime   map[string]time.Time
	cacheTTL    time.Duration
	mu          sync.RWMutex
}

// NewNewsHandler 创建新闻处理器
func NewNewsHandler() *NewsHandler {
	return &NewsHandler{
		newsService: services.NewNewsService(),
		cache:       &sync.Map{},
		cacheTime:   make(map[string]time.Time),
		cacheTTL:    5 * time.Minute, // 新闻缓存5分钟
	}
}

// GetNews 获取黄金新闻
// GET /api/news
func (h *NewsHandler) GetNews(c *gin.Context) {
	cacheKey := "gold_news"

	// 检查缓存
	h.mu.RLock()
	if cacheTime, ok := h.cacheTime[cacheKey]; ok {
		if time.Since(cacheTime) < h.cacheTTL {
			if cached, ok := h.cache.Load(cacheKey); ok {
				h.mu.RUnlock()
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"data":    cached,
					"cached":  true,
				})
				return
			}
		}
	}
	h.mu.RUnlock()

	// 从新浪财经获取新闻
	news, err := h.newsService.FetchGoldNews()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "获取新闻失败: " + err.Error(),
		})
		return
	}

	// 更新缓存
	h.mu.Lock()
	h.cache.Store(cacheKey, news)
	h.cacheTime[cacheKey] = time.Now()
	h.mu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    news,
		"cached":  false,
	})
}
