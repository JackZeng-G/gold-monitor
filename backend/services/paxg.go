package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"gold-monitor-backend/cache"
	"gold-monitor-backend/models"
)

const (
	binanceAPI = "https://api.binance.com/api/v3/ticker/price"
	gateAPI    = "https://api.gateio.ws/api/v4/spot/tickers"
)

// PaxgService PAXG (Paxos Gold) 服务
type PaxgService struct {
	client    *http.Client
	prevClose float64
	mu        sync.RWMutex
	cache     *cache.Cache
}

// NewPaxgService 创建新的 PAXG 服务实例
func NewPaxgService() *PaxgService {
	return &PaxgService{
		client: &http.Client{
			Timeout: 3 * time.Second,
		},
		cache: cache.NewCache(),
	}
}

// binancePriceResponse Binance API 响应结构
type binancePriceResponse struct {
	Symbol string `json:"symbol"`
	Price  string `json:"price"`
}

// gatePriceResponse Gate.io API 响应结构
type gatePriceResponse struct {
	CurrencyPair     string `json:"currency_pair"`
	Last             string `json:"last"`
	ChangePercentage string `json:"change_percentage"`
	High24h          string `json:"high_24h"`
	Low24h           string `json:"low_24h"`
}

// FetchPaxg 获取 PAXG (Paxos Gold) 价格
// 优先使用 Gate.io（国内可访问），失败时尝试 Binance
func (s *PaxgService) FetchPaxg(usdCnyRate float64) (*models.GoldPrice, error) {
	// 首先尝试 Gate.io（国内可访问）
	result, err := s.fetchFromGate(usdCnyRate)
	if err == nil {
		return result, nil
	}

	// Gate.io 失败，尝试 Binance
	result, err = s.fetchFromBinance(usdCnyRate)
	if err == nil {
		return result, nil
	}

	// 都失败时返回缓存数据
	return s.getCachedData(), fmt.Errorf("all PAXG APIs failed")
}

// fetchFromGate 从 Gate.io 获取 PAXG 价格
func (s *PaxgService) fetchFromGate(usdCnyRate float64) (*models.GoldPrice, error) {
	url := gateAPI + "?currency_pair=PAXG_USDT"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var priceResp []gatePriceResponse
	if err := json.Unmarshal(body, &priceResp); err != nil {
		return nil, fmt.Errorf("failed to parse Gate.io response: %w", err)
	}

	if len(priceResp) == 0 || priceResp[0].Last == "" {
		return nil, fmt.Errorf("empty price from Gate.io")
	}

	current := parseFloatStr(priceResp[0].Last)
	changePercent := parseFloatStr(priceResp[0].ChangePercentage)

	// 计算昨收价
	var prevClose float64
	if changePercent != 0 && current > 0 {
		prevClose = current / (1 + changePercent/100)
	} else {
		s.mu.RLock()
		prevClose = s.prevClose
		s.mu.RUnlock()
	}
	if prevClose == 0 {
		prevClose = current
	}

	change := current - prevClose

	// 计算人民币价格
	var cnyPrice float64
	if usdCnyRate > 0 {
		cnyPrice = current * usdCnyRate
	}

	result := &models.GoldPrice{
		Name:          "PAXG数字黄金",
		Symbol:        "PAXG",
		Current:       round(current, 2),
		PrevClose:     round(prevClose, 2),
		Change:        round(change, 2),
		ChangePercent: round(changePercent, 2),
		Currency:      "USD",
		CnyPrice:      round(cnyPrice, 2),
		Timestamp:     time.Now(),
	}

	// 缓存成功获取的数据（永不过期，用于fallback）
	s.mu.Lock()
	s.prevClose = prevClose
	s.mu.Unlock()
	s.cache.Set("paxg_fallback", result, cache.NeverExpire)

	return result, nil
}

// fetchFromBinance 从 Binance 获取 PAXG 价格
func (s *PaxgService) fetchFromBinance(usdCnyRate float64) (*models.GoldPrice, error) {
	url := binanceAPI + "?symbol=PAXGUSDT"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var priceResp binancePriceResponse
	if err := json.Unmarshal(body, &priceResp); err != nil {
		return nil, fmt.Errorf("failed to parse Binance response: %w", err)
	}

	if priceResp.Price == "" {
		return nil, fmt.Errorf("empty price from Binance")
	}

	current := parseFloatStr(priceResp.Price)

	// Binance 不提供昨收价，使用缓存的昨收价
	s.mu.RLock()
	prevClose := s.prevClose
	s.mu.RUnlock()
	if prevClose == 0 {
		prevClose = current
	}

	change := current - prevClose
	changePercent := 0.0
	if prevClose > 0 {
		changePercent = (change / prevClose) * 100
	}

	// 计算人民币价格
	var cnyPrice float64
	if usdCnyRate > 0 {
		cnyPrice = current * usdCnyRate
	}

	result := &models.GoldPrice{
		Name:          "PAXG数字黄金",
		Symbol:        "PAXG",
		Current:       round(current, 2),
		PrevClose:     round(prevClose, 2),
		Change:        round(change, 2),
		ChangePercent: round(changePercent, 2),
		Currency:      "USD",
		CnyPrice:      round(cnyPrice, 2),
		Timestamp:     time.Now(),
	}

	// 缓存成功获取的数据（永不过期，用于fallback）
	s.mu.Lock()
	s.prevClose = prevClose
	s.mu.Unlock()
	s.cache.Set("paxg_fallback", result, cache.NeverExpire)

	return result, nil
}

// getCachedData 获取缓存的PAXG数据
func (s *PaxgService) getCachedData() *models.GoldPrice {
	if cached, ok := s.cache.Get("paxg_fallback"); ok {
		if data, ok := cached.(*models.GoldPrice); ok {
			return data
		}
	}
	return nil
}

// parseFloatStr 解析价格字符串
func parseFloatStr(s string) float64 {
	var f float64
	for _, c := range s {
		if c >= '0' && c <= '9' || c == '.' || c == '-' {
			continue
		}
		return 0
	}
	fmt.Sscanf(s, "%f", &f)
	return f
}
