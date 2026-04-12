package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"gold-monitor-backend/cache"
	"gold-monitor-backend/services"
)

// NewsHandler 新闻处理器
type NewsHandler struct {
	newsService *services.NewsService
	cache       *cache.Cache
	cacheTTL    time.Duration
}

// NewNewsHandler 创建新闻处理器
func NewNewsHandler() *NewsHandler {
	return &NewsHandler{
		newsService: services.NewNewsService(),
		cache:       cache.NewCache(),
		cacheTTL:    5 * time.Minute, // 新闻缓存5分钟
	}
}

// GetNews 获取黄金新闻
// GET /api/news
func (h *NewsHandler) GetNews(c *gin.Context) {
	cacheKey := "gold_news"

	// 检查缓存
	if cached, ok := h.cache.Get(cacheKey); ok {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    cached,
			"cached":  true,
		})
		return
	}

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
	h.cache.Set(cacheKey, news, h.cacheTTL)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    news,
		"cached":  false,
	})
}
