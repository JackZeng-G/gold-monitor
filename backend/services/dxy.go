package services

import (
	"fmt"
	"io"
	"math"
	"net/http"
	"strings"
	"sync"
	"time"

	"gold-monitor-backend/cache"
	"gold-monitor-backend/models"
)

const sinaForexURL = "http://hq.sinajs.cn/list="

// 新浪外汇期货symbol (用于计算DXY)
var sinaForexFuturesSymbols = []string{
	"fx_seurusd", // EUR/USD
	"fx_sgbpusd", // GBP/USD
	"fx_susdjpy", // USD/JPY
	"fx_susdcad", // USD/CAD
	"fx_susdchf", // USD/CHF
	"fx_susdsek", // USD/SEK
}

// 新浪外汇期货symbol到标准symbol的映射
var forexSymbolMap = map[string]string{
	"fx_seurusd": "EURUSD",
	"fx_sgbpusd": "GBPUSD",
	"fx_susdjpy": "USDJPY",
	"fx_susdcad": "USDCAD",
	"fx_susdchf": "USDCHF",
	"fx_susdsek": "USDSEK",
}

// DXY 货币权重 (ICE 美元指数标准)
var dxyWeights = map[string]float64{
	"EURUSD": 0.576,
	"USDJPY": 0.136,
	"GBPUSD": 0.119,
	"USDCAD": 0.091,
	"USDSEK": 0.042,
	"USDCHF": 0.036,
}

// DxyService 美元指数服务
type DxyService struct {
	client    *http.Client
	prevClose float64
	mu        sync.RWMutex
	cache     *cache.Cache
}

// NewDxyService 创建新的美元指数服务实例
func NewDxyService() *DxyService {
	return &DxyService{
		client: &http.Client{Timeout: 5 * time.Second},
		cache:  cache.NewCache(),
	}
}

// FetchDxy 获取美元指数
// 使用新浪外汇期货数据计算近似DXY值（国内可访问）
func (s *DxyService) FetchDxy() (*models.ExchangeRate, error) {
	// 使用新浪外汇数据计算
	result, err := s.fetchAndCalculateFromSina()
	if err == nil {
		return result, nil
	}

	// 失败时返回缓存数据
	cached := s.getCachedData()
	if cached != nil {
		return cached, nil
	}
	return nil, err
}

// fetchAndCalculateFromSina 从新浪外汇期货获取货币对数据并计算近似DXY
func (s *DxyService) fetchAndCalculateFromSina() (*models.ExchangeRate, error) {
	// 使用新浪外汇期货API（国内可访问）
	url := sinaForexURL + strings.Join(sinaForexFuturesSymbols, ",")

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Referer", "http://finance.sina.com.cn/")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// 解析所有货币对
	rates := make(map[string]float64)

	// 使用 FindAllSubmatch 获取所有匹配
	matches := sinaDataRegex.FindAllSubmatch(body, -1)
	for _, match := range matches {
		if len(match) >= 3 {
			symbol := string(match[1])
			data := string(match[2])
			if data == "" {
				continue
			}
			parts := strings.Split(data, ",")
			if len(parts) >= 2 {
				// 新浪外汇期货格式: 时间,当前价,...
				rate := parseFloat(parts[1])
				if rate > 0 {
					// 转换为标准symbol
					standardSymbol := forexSymbolMap[strings.ToLower(symbol)]
					if standardSymbol != "" {
						rates[standardSymbol] = rate
					}
				}
			}
		}
	}

	// 至少需要4种货币对才能计算
	if len(rates) < 4 {
		return nil, fmt.Errorf("insufficient forex data, got %d, need at least 4", len(rates))
	}

	// DXY 计算公式：
	// DXY = 50.14348112 × EURUSD^(-0.576) × USDJPY^(0.136) × GBPUSD^(-0.119) × USDCAD^(0.091) × USDSEK^(0.042) × USDCHF^(0.036)
	dxy := 50.14348112

	// 欧元
	if rate, ok := rates["EURUSD"]; ok && rate > 0 {
		dxy *= math.Pow(rate, -dxyWeights["EURUSD"])
	}

	// 日元
	if rate, ok := rates["USDJPY"]; ok && rate > 0 {
		dxy *= math.Pow(rate, dxyWeights["USDJPY"])
	}

	// 英镑
	if rate, ok := rates["GBPUSD"]; ok && rate > 0 {
		dxy *= math.Pow(rate, -dxyWeights["GBPUSD"])
	}

	// 加元
	if rate, ok := rates["USDCAD"]; ok && rate > 0 {
		dxy *= math.Pow(rate, dxyWeights["USDCAD"])
	}

	// 瑞郎
	if rate, ok := rates["USDCHF"]; ok && rate > 0 {
		dxy *= math.Pow(rate, dxyWeights["USDCHF"])
	}

	// 瑞典克朗
	if rate, ok := rates["USDSEK"]; ok && rate > 0 {
		dxy *= math.Pow(rate, dxyWeights["USDSEK"])
	}

	// 防止异常值
	if dxy < 70 || dxy > 150 {
		return nil, fmt.Errorf("calculated DXY out of valid range: %.2f", dxy)
	}

	// 计算涨跌
	s.mu.RLock()
	prevClose := s.prevClose
	s.mu.RUnlock()

	if prevClose == 0 {
		prevClose = dxy // 首次使用时用当前值作为昨收
	}

	change := dxy - prevClose
	changePercent := 0.0
	if prevClose > 0 {
		changePercent = (change / prevClose) * 100
	}

	result := &models.ExchangeRate{
		Name:          "美元指数",
		Symbol:        "DXY",
		Current:       round(dxy, 2),
		PrevClose:     round(prevClose, 2),
		Change:        round(change, 2),
		ChangePercent: round(changePercent, 2),
		Currency:      "INDEX",
		Timestamp:     time.Now(),
	}

	// 缓存成功获取的数据（永不过期，用于fallback）
	s.mu.Lock()
	s.prevClose = dxy
	s.mu.Unlock()
	s.cache.Set("dxy_fallback", result, cache.NeverExpire)

	return result, nil
}

// getCachedData 获取缓存的DXY数据
func (s *DxyService) getCachedData() *models.ExchangeRate {
	if cached, ok := s.cache.Get("dxy_fallback"); ok {
		if data, ok := cached.(*models.ExchangeRate); ok {
			return data
		}
	}
	return nil
}