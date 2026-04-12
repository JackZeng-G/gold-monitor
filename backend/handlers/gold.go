package handlers

import (
	"math"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"gold-monitor-backend/cache"
	"gold-monitor-backend/models"
	"gold-monitor-backend/services"
)

// HistoryPoint 历史数据点
type HistoryPoint struct {
	Price     float64   `json:"price"`
	Timestamp time.Time `json:"timestamp"`
}

// HistoryStore 历史数据存储
type HistoryStore struct {
	mu          sync.RWMutex
	Au9999      []HistoryPoint `json:"au9999"`
	UsFutures   []HistoryPoint `json:"usFutures"`
	UkFutures   []HistoryPoint `json:"ukFutures"`
	UsdCny      []HistoryPoint `json:"usdCny"`
	Dxy         []HistoryPoint `json:"dxy"`
	Paxg        []HistoryPoint `json:"paxg"`
	MaxPoints   int            `json:"-"` // 最大存储点数
}

// NewHistoryStore 创建历史存储
func NewHistoryStore(maxPoints int) *HistoryStore {
	return &HistoryStore{
		Au9999:    make([]HistoryPoint, 0),
		UsFutures: make([]HistoryPoint, 0),
		UkFutures: make([]HistoryPoint, 0),
		UsdCny:    make([]HistoryPoint, 0),
		Dxy:       make([]HistoryPoint, 0),
		Paxg:      make([]HistoryPoint, 0),
		MaxPoints: maxPoints,
	}
}

// AddPoint 添加数据点
func (h *HistoryStore) AddPoint(key string, price float64, timestamp time.Time) {
	h.mu.Lock()
	defer h.mu.Unlock()

	point := HistoryPoint{Price: price, Timestamp: timestamp}

	switch key {
	case "au9999":
		h.Au9999 = append(h.Au9999, point)
		if len(h.Au9999) > h.MaxPoints {
			h.Au9999 = h.Au9999[len(h.Au9999)-h.MaxPoints:]
		}
	case "usFutures":
		h.UsFutures = append(h.UsFutures, point)
		if len(h.UsFutures) > h.MaxPoints {
			h.UsFutures = h.UsFutures[len(h.UsFutures)-h.MaxPoints:]
		}
	case "ukFutures":
		h.UkFutures = append(h.UkFutures, point)
		if len(h.UkFutures) > h.MaxPoints {
			h.UkFutures = h.UkFutures[len(h.UkFutures)-h.MaxPoints:]
		}
	case "usdCny":
		h.UsdCny = append(h.UsdCny, point)
		if len(h.UsdCny) > h.MaxPoints {
			h.UsdCny = h.UsdCny[len(h.UsdCny)-h.MaxPoints:]
		}
	case "dxy":
		h.Dxy = append(h.Dxy, point)
		if len(h.Dxy) > h.MaxPoints {
			h.Dxy = h.Dxy[len(h.Dxy)-h.MaxPoints:]
		}
	case "paxg":
		h.Paxg = append(h.Paxg, point)
		if len(h.Paxg) > h.MaxPoints {
			h.Paxg = h.Paxg[len(h.Paxg)-h.MaxPoints:]
		}
	}
}

// GetHistory 获取历史数据
func (h *HistoryStore) GetHistory(key string) []HistoryPoint {
	h.mu.RLock()
	defer h.mu.RUnlock()

	switch key {
	case "au9999":
		return h.Au9999
	case "usFutures":
		return h.UsFutures
	case "ukFutures":
		return h.UkFutures
	case "usdCny":
		return h.UsdCny
	case "dxy":
		return h.Dxy
	case "paxg":
		return h.Paxg
	}
	return nil
}

// GoldHandler 黄金价格处理器
type GoldHandler struct {
	sinaService  *services.SinaService
	dxyService   *services.DxyService
	paxgService  *services.PaxgService
	cache        *cache.Cache
	cacheTTL     time.Duration
	historyStore *HistoryStore
	wsHub        *WSHub
	lastPrices   *models.AllPricesResponse // 上次价格数据（用于增量推送）
	lastPricesMu sync.RWMutex
}

// NewGoldHandler 创建新的价格处理器
func NewGoldHandler(wsHub *WSHub) *GoldHandler {
	return &GoldHandler{
		sinaService:  services.NewSinaService(),
		dxyService:   services.NewDxyService(),
		paxgService:  services.NewPaxgService(),
		cache:        cache.NewCache(),
		cacheTTL:     3 * time.Second,
		historyStore: NewHistoryStore(1000),
		wsHub:        wsHub,
	}
}

// GetAllPrices 获取所有价格数据
// GET /api/gold/prices
func (h *GoldHandler) GetAllPrices(c *gin.Context) {
	// 先尝试从缓存获取
	if cached, found := h.cache.Get("all_prices"); found {
		if response, ok := cached.(*models.AllPricesResponse); ok {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"data":    response,
				"cached":  true,
			})
			return
		}
	}

	// 从新浪API获取数据
	response, err := h.sinaService.FetchAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// 添加历史数据
	if response.Au9999 != nil {
		h.historyStore.AddPoint("au9999", response.Au9999.Current, response.Au9999.Timestamp)
		response.Au9999.History = convertHistory(h.historyStore.GetHistory("au9999"))
	}
	if response.UsFutures != nil {
		h.historyStore.AddPoint("usFutures", response.UsFutures.Current, response.UsFutures.Timestamp)
		response.UsFutures.History = convertHistory(h.historyStore.GetHistory("usFutures"))
	}
	if response.UkFutures != nil {
		h.historyStore.AddPoint("ukFutures", response.UkFutures.Current, response.UkFutures.Timestamp)
		response.UkFutures.History = convertHistory(h.historyStore.GetHistory("ukFutures"))
	}
	if response.UsdCny != nil {
		h.historyStore.AddPoint("usdCny", response.UsdCny.Current, response.UsdCny.Timestamp)
		response.UsdCny.History = convertHistory(h.historyStore.GetHistory("usdCny"))
	}
	if response.Dxy != nil {
		h.historyStore.AddPoint("dxy", response.Dxy.Current, response.Dxy.Timestamp)
		response.Dxy.History = convertHistory(h.historyStore.GetHistory("dxy"))
	}
	if response.Paxg != nil {
		h.historyStore.AddPoint("paxg", response.Paxg.Current, response.Paxg.Timestamp)
		response.Paxg.History = convertHistory(h.historyStore.GetHistory("paxg"))
	}

	// 存入缓存
	h.cache.Set("all_prices", response, h.cacheTTL)

	// 通过 WebSocket 广播数据
	if h.wsHub != nil {
		go h.wsHub.Broadcast(map[string]interface{}{
			"type": "prices",
			"data": response,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
		"cached":  false,
	})
}

// convertHistory 转换历史数据格式
func convertHistory(points []HistoryPoint) []map[string]interface{} {
	result := make([]map[string]interface{}, len(points))
	for i, p := range points {
		result[i] = map[string]interface{}{
			"price":     p.Price,
			"timestamp": p.Timestamp,
		}
	}
	return result
}

// BroadcastPrices 主动广播价格数据到 WebSocket（增量推送）
func (h *GoldHandler) BroadcastPrices() {
	response, err := h.sinaService.FetchAll()
	if err != nil {
		return
	}

	// 数据合理性校验
	h.validatePrices(response)

	// 添加历史数据
	if response.Au9999 != nil {
		h.historyStore.AddPoint("au9999", response.Au9999.Current, response.Au9999.Timestamp)
		response.Au9999.History = convertHistory(h.historyStore.GetHistory("au9999"))
	}
	if response.UsFutures != nil {
		h.historyStore.AddPoint("usFutures", response.UsFutures.Current, response.UsFutures.Timestamp)
		response.UsFutures.History = convertHistory(h.historyStore.GetHistory("usFutures"))
	}
	if response.UkFutures != nil {
		h.historyStore.AddPoint("ukFutures", response.UkFutures.Current, response.UkFutures.Timestamp)
		response.UkFutures.History = convertHistory(h.historyStore.GetHistory("ukFutures"))
	}
	if response.UsdCny != nil {
		h.historyStore.AddPoint("usdCny", response.UsdCny.Current, response.UsdCny.Timestamp)
		response.UsdCny.History = convertHistory(h.historyStore.GetHistory("usdCny"))
	}
	if response.Dxy != nil {
		h.historyStore.AddPoint("dxy", response.Dxy.Current, response.Dxy.Timestamp)
		response.Dxy.History = convertHistory(h.historyStore.GetHistory("dxy"))
	}
	if response.Paxg != nil {
		h.historyStore.AddPoint("paxg", response.Paxg.Current, response.Paxg.Timestamp)
		response.Paxg.History = convertHistory(h.historyStore.GetHistory("paxg"))
	}

	// 更新缓存
	h.cache.Set("all_prices", response, h.cacheTTL)

	// 计算增量数据
	incremental := h.calculateIncremental(response)

	// 广播到 WebSocket
	if h.wsHub != nil {
		if len(incremental) > 0 {
			// 有变化时推送增量数据
			h.wsHub.Broadcast(map[string]interface{}{
				"type": "prices_inc",
				"data": incremental,
			})
		} else {
			// 无变化时推送心跳
			h.wsHub.Broadcast(map[string]interface{}{
				"type": "heartbeat",
				"time": time.Now().Unix(),
			})
		}
	}

	// 更新上次价格
	h.lastPricesMu.Lock()
	h.lastPrices = response
	h.lastPricesMu.Unlock()
}

// validatePrices 数据合理性校验
func (h *GoldHandler) validatePrices(response *models.AllPricesResponse) {
	// 校验价格波动范围（超过10%视为异常）
	maxChangePercent := 0.10

	if response.Au9999 != nil && response.Au9999.Current > 0 {
		if h.lastPrices != nil && h.lastPrices.Au9999 != nil {
			change := math.Abs(response.Au9999.Current-h.lastPrices.Au9999.Current) / h.lastPrices.Au9999.Current
			if change > maxChangePercent {
				// 价格异常，使用上次价格
				response.Au9999.Current = h.lastPrices.Au9999.Current
			}
		}
	}

	// 同样校验其他品种
	if response.UsFutures != nil && response.UsFutures.Current > 0 {
		if h.lastPrices != nil && h.lastPrices.UsFutures != nil {
			change := math.Abs(response.UsFutures.Current-h.lastPrices.UsFutures.Current) / h.lastPrices.UsFutures.Current
			if change > maxChangePercent {
				response.UsFutures.Current = h.lastPrices.UsFutures.Current
			}
		}
	}
}

// calculateIncremental 计算增量数据
func (h *GoldHandler) calculateIncremental(response *models.AllPricesResponse) map[string]interface{} {
	h.lastPricesMu.RLock()
	defer h.lastPricesMu.RUnlock()

	incremental := make(map[string]interface{})

	if h.lastPrices == nil {
		// 首次推送全量数据
		return map[string]interface{}{
			"au9999":    response.Au9999,
			"usFutures": response.UsFutures,
			"ukFutures": response.UkFutures,
			"usdCny":    response.UsdCny,
			"dxy":       response.Dxy,
			"paxg":      response.Paxg,
		}
	}

	// 比较并只返回变化的数据
	if response.Au9999 != nil && (h.lastPrices.Au9999 == nil ||
		response.Au9999.Current != h.lastPrices.Au9999.Current) {
		incremental["au9999"] = response.Au9999
	}
	if response.UsFutures != nil && (h.lastPrices.UsFutures == nil ||
		response.UsFutures.Current != h.lastPrices.UsFutures.Current) {
		incremental["usFutures"] = response.UsFutures
	}
	if response.UkFutures != nil && (h.lastPrices.UkFutures == nil ||
		response.UkFutures.Current != h.lastPrices.UkFutures.Current) {
		incremental["ukFutures"] = response.UkFutures
	}
	if response.UsdCny != nil && (h.lastPrices.UsdCny == nil ||
		response.UsdCny.Current != h.lastPrices.UsdCny.Current) {
		incremental["usdCny"] = response.UsdCny
	}
	if response.Dxy != nil && (h.lastPrices.Dxy == nil ||
		response.Dxy.Current != h.lastPrices.Dxy.Current) {
		incremental["dxy"] = response.Dxy
	}
	if response.Paxg != nil && (h.lastPrices.Paxg == nil ||
		response.Paxg.Current != h.lastPrices.Paxg.Current) {
		incremental["paxg"] = response.Paxg
	}

	return incremental
}

// GetAu9999 获取 Au9999 价格
// GET /api/gold/au9999
func (h *GoldHandler) GetAu9999(c *gin.Context) {
	cacheKey := "au9999"
	if cached, found := h.cache.Get(cacheKey); found {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    cached,
			"cached":  true,
		})
		return
	}

	data, err := h.sinaService.FetchAu9999()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// 添加历史数据
	h.historyStore.AddPoint("au9999", data.Current, data.Timestamp)
	data.History = convertHistory(h.historyStore.GetHistory("au9999"))

	h.cache.Set(cacheKey, data, h.cacheTTL)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
		"cached":  false,
	})
}

// GetUsFutures 获取美国期货价格
// GET /api/gold/us
func (h *GoldHandler) GetUsFutures(c *gin.Context) {
	cacheKey := "us_futures"
	if cached, found := h.cache.Get(cacheKey); found {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    cached,
			"cached":  true,
		})
		return
	}

	data, err := h.sinaService.FetchUsFutures()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// 获取汇率计算人民币价格
	rate, _ := h.sinaService.FetchUsdCny()
	if rate != nil && rate.Current > 0 {
		data.CnyPrice = data.Current * rate.Current
	}

	// 添加历史数据
	h.historyStore.AddPoint("usFutures", data.Current, data.Timestamp)
	data.History = convertHistory(h.historyStore.GetHistory("usFutures"))

	h.cache.Set(cacheKey, data, h.cacheTTL)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
		"cached":  false,
	})
}

// GetUkFutures 获取英国/伦敦黄金价格
// GET /api/gold/uk
func (h *GoldHandler) GetUkFutures(c *gin.Context) {
	cacheKey := "uk_futures"
	if cached, found := h.cache.Get(cacheKey); found {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    cached,
			"cached":  true,
		})
		return
	}

	data, err := h.sinaService.FetchUkFutures()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// 获取汇率计算人民币价格
	rate, _ := h.sinaService.FetchUsdCny()
	if rate != nil && rate.Current > 0 {
		data.CnyPrice = data.Current * rate.Current
	}

	// 添加历史数据
	h.historyStore.AddPoint("ukFutures", data.Current, data.Timestamp)
	data.History = convertHistory(h.historyStore.GetHistory("ukFutures"))

	h.cache.Set(cacheKey, data, h.cacheTTL)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
		"cached":  false,
	})
}

// GetUsdCny 获取美元人民币汇率
// GET /api/gold/usdcny
func (h *GoldHandler) GetUsdCny(c *gin.Context) {
	cacheKey := "usd_cny"
	if cached, found := h.cache.Get(cacheKey); found {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    cached,
			"cached":  true,
		})
		return
	}

	data, err := h.sinaService.FetchUsdCny()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// 添加历史数据
	h.historyStore.AddPoint("usdCny", data.Current, data.Timestamp)
	data.History = convertHistory(h.historyStore.GetHistory("usdCny"))

	h.cache.Set(cacheKey, data, h.cacheTTL)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
		"cached":  false,
	})
}

// HealthCheck 健康检查
// GET /api/health
func (h *GoldHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"time":   time.Now(),
	})
}

// GetDxy 获取美元指数
// GET /api/gold/dxy
func (h *GoldHandler) GetDxy(c *gin.Context) {
	cacheKey := "dxy"
	if cached, found := h.cache.Get(cacheKey); found {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    cached,
			"cached":  true,
		})
		return
	}

	data, err := h.dxyService.FetchDxy()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// 添加历史数据
	h.historyStore.AddPoint("dxy", data.Current, data.Timestamp)
	data.History = convertHistory(h.historyStore.GetHistory("dxy"))

	h.cache.Set(cacheKey, data, h.cacheTTL)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
		"cached":  false,
	})
}

// GetPaxg 获取 PAXG (Paxos Gold) 价格
// GET /api/gold/paxg
func (h *GoldHandler) GetPaxg(c *gin.Context) {
	cacheKey := "paxg"
	if cached, found := h.cache.Get(cacheKey); found {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    cached,
			"cached":  true,
		})
		return
	}

	// 获取汇率用于计算人民币价格
	usdCnyRate := 6.9 // 默认汇率
	if rate, err := h.sinaService.FetchUsdCny(); err == nil && rate.Current > 0 {
		usdCnyRate = rate.Current
	}

	data, err := h.paxgService.FetchPaxg(usdCnyRate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// 添加历史数据
	h.historyStore.AddPoint("paxg", data.Current, data.Timestamp)
	data.History = convertHistory(h.historyStore.GetHistory("paxg"))

	h.cache.Set(cacheKey, data, h.cacheTTL)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
		"cached":  false,
	})
}
