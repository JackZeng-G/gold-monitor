package handlers

import (
	"net/http"

	"gold-monitor-backend/services"

	"github.com/gin-gonic/gin"
)

// KlineHandler K线处理器
type KlineHandler struct {
	klineService *services.KlineService
}

// NewKlineHandler 创建K线处理器
func NewKlineHandler() *KlineHandler {
	return &KlineHandler{
		klineService: services.NewKlineService(),
	}
}

// GetAu9999Kline 获取Au9999 K线数据
func (h *KlineHandler) GetAu9999Kline(c *gin.Context) {
	data, err := h.klineService.FetchAu9999Kline()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

// GetKlineBySymbol 根据symbol获取K线
func (h *KlineHandler) GetKlineBySymbol(c *gin.Context) {
	symbol := c.Param("symbol")
	if symbol == "" {
		symbol = c.Query("symbol")
	}
	if symbol == "" {
		symbol = "AU0"
	}

	period := c.Query("period")
	if period == "" {
		period = "day"
	}

	data, err := h.klineService.FetchKlineBySymbolAndPeriod(symbol, period)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
		"symbol":  symbol,
		"period":  period,
	})
}

// GetUsFuturesKline 获取美国黄金期货K线
func (h *KlineHandler) GetUsFuturesKline(c *gin.Context) {
	period := c.Query("period")
	if period == "" {
		period = "day"
	}

	data, err := h.klineService.FetchUsFuturesKlineWithPeriod(period)

	// 即使有错误，如果data不为空，仍然返回数据
	if data != nil && len(data) > 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    data,
			"symbol":  "GC",
			"period":  period,
			"cached":  err != nil, // 如果有错误说明是缓存数据
		})
		return
	}

	// 确实没有数据
	c.JSON(http.StatusOK, gin.H{
		"success": false,
		"error":   err.Error(),
		"data":    nil,
	})
}
