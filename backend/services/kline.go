package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"sync"
	"time"
)

// KlineData K线数据结构
type KlineData struct {
	Date     string  `json:"date"`     // 日期
	Open     float64 `json:"open"`     // 开盘价
	High     float64 `json:"high"`     // 最高价
	Low      float64 `json:"low"`      // 最低价
	Close    float64 `json:"close"`    // 收盘价
	Volume   float64 `json:"volume"`   // 成交量
	Position float64 `json:"position"` // 持仓量
}

// KlineService K线数据服务
type KlineService struct {
	client     *http.Client
	cachedData []KlineData // 缓存上次成功获取的数据
	mu         struct {
		sync.RWMutex
		cacheTime time.Time
	}
}

// NewKlineService 创建K线服务
func NewKlineService() *KlineService {
	return &KlineService{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// FetchDailyKline 获取日K线数据（上海黄金期货）
// symbol: 合约代码 (AU0=黄金主力, AU2504=具体合约)
func (s *KlineService) FetchDailyKline(symbol string) ([]KlineData, error) {
	url := fmt.Sprintf(
		"https://stock.finance.sina.com.cn/futures/api/jsonp.php/var=/InnerFuturesNewService.getDailyKLine?symbol=%s",
		symbol,
	)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Referer", "https://finance.sina.com.cn/")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// 解析JSONP响应
	content := string(body)

	// 移除JSONP包装: var=(...);
	re := regexp.MustCompile(`var=\((\[.*\])\);?`)
	matches := re.FindStringSubmatch(content)
	if len(matches) < 2 {
		return nil, fmt.Errorf("failed to parse JSONP response")
	}

	// 解析JSON数组
	var rawItems []struct {
		D string `json:"d"` // 日期
		O string `json:"o"` // 开盘
		H string `json:"h"` // 最高
		L string `json:"l"` // 最低
		C string `json:"c"` // 收盘
		V string `json:"v"` // 成交量
		P string `json:"p"` // 持仓量
	}

	if err := json.Unmarshal([]byte(matches[1]), &rawItems); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %v", err)
	}

	// 转换为K线数据，只取最近的数据
	result := make([]KlineData, 0, len(rawItems))

	// 取最近100条数据
	start := 0
	if len(rawItems) > 100 {
		start = len(rawItems) - 100
	}

	for i := start; i < len(rawItems); i++ {
		item := rawItems[i]
		kline := KlineData{
			Date:     item.D,
			Open:     parseFloatStr(item.O),
			High:     parseFloatStr(item.H),
			Low:      parseFloatStr(item.L),
			Close:    parseFloatStr(item.C),
			Volume:   parseFloatStr(item.V),
			Position: parseFloatStr(item.P),
		}
		result = append(result, kline)
	}

	return result, nil
}

// FetchAu9999Kline 获取上海黄金期货K线
func (s *KlineService) FetchAu9999Kline() ([]KlineData, error) {
	return s.FetchDailyKline("AU0")
}

// fetchEastMoneyKline 从东方财富获取美国期货日K线数据
func (s *KlineService) fetchEastMoneyKline() ([]KlineData, error) {
	return s.fetchEastMoneyKlineWithPeriod("day")
}

// fetchEastMoneyKlineWithPeriod 从东方财富获取美国期货K线数据（支持多周期）
// klt: 5=5分钟, 15=15分钟, 30=30分钟, 60=60分钟, 101=日线, 102=周线, 103=月线
func (s *KlineService) fetchEastMoneyKlineWithPeriod(period string) ([]KlineData, error) {
	// 根据周期确定klt参数
	var klt string
	var lmt int // 返回数据条数
	switch period {
	case "5":
		klt = "5"
		lmt = 200
	case "15":
		klt = "15"
		lmt = 200
	case "30":
		klt = "30"
		lmt = 200
	case "60":
		klt = "60"
		lmt = 200
	case "day":
		klt = "101"
		lmt = 100
	case "week":
		klt = "102"
		lmt = 100
	case "month":
		klt = "103"
		lmt = 100
	default:
		klt = "101"
		lmt = 100
	}

	url := fmt.Sprintf(
		"http://push2his.eastmoney.com/api/qt/stock/kline/get?secid=101.GC00Y&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57&klt=%s&fqt=0&end=20500101&lmt=%d",
		klt, lmt,
	)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Referer", "http://quote.eastmoney.com/")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var eastMoneyResp struct {
		Rc   int `json:"rc"`
		Data struct {
			Code   string   `json:"code"`
			Market int      `json:"market"`
			Name   string   `json:"name"`
			Klines []string `json:"klines"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &eastMoneyResp); err != nil {
		return nil, fmt.Errorf("failed to parse EastMoney response: %w", err)
	}

	if eastMoneyResp.Rc != 0 || len(eastMoneyResp.Data.Klines) == 0 {
		return nil, fmt.Errorf("no data from EastMoney")
	}

	result := make([]KlineData, 0, len(eastMoneyResp.Data.Klines))
	for _, klineStr := range eastMoneyResp.Data.Klines {
		// 格式: "时间,开盘,收盘,最高,最低,成交量,持仓量"
		parts := regexp.MustCompile(`,`).Split(klineStr, -1)
		if len(parts) < 6 {
			continue
		}

		kline := KlineData{
			Date:     parts[0],
			Open:     parseFloatStr(parts[1]),
			Close:    parseFloatStr(parts[2]),
			High:     parseFloatStr(parts[3]),
			Low:      parseFloatStr(parts[4]),
			Volume:   parseFloatStr(parts[5]),
			Position: 0,
		}
		if len(parts) >= 7 {
			kline.Position = parseFloatStr(parts[6])
		}
		result = append(result, kline)
	}

	return result, nil
}

// fetchSinaGlobalKline 从新浪国际期货获取美国期货日K线数据
func (s *KlineService) fetchSinaGlobalKline() ([]KlineData, error) {
	// symbol=GC&type=0: GC=COMEX黄金, 0=日K
	url := "http://stock.finance.sina.com.cn/futures/api/jsonp.php/var=/GlobalFuturesService.getGlobalFuturesDailyKLine?symbol=GC&type=0"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Referer", "https://finance.sina.com.cn/")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// 解析JSONP响应: var=[...];
	content := string(body)
	re := regexp.MustCompile(`var=\[(.*)\];?`)
	matches := re.FindStringSubmatch(content)
	if len(matches) < 2 {
		return nil, fmt.Errorf("failed to parse Sina Global JSONP response")
	}

	// 解析每个K线对象
	var rawItems []struct {
		D string `json:"d"` // 日期
		O string `json:"o"` // 开盘
		H string `json:"h"` // 最高
		L string `json:"l"` // 最低
		C string `json:"c"` // 收盘
		V string `json:"v"` // 成交量
	}

	if err := json.Unmarshal([]byte("["+matches[1]+"]"), &rawItems); err != nil {
		return nil, fmt.Errorf("failed to parse Sina Global JSON: %w", err)
	}

	result := make([]KlineData, 0, len(rawItems))
	for _, item := range rawItems {
		kline := KlineData{
			Date:     item.D,
			Open:     parseFloatStr(item.O),
			High:     parseFloatStr(item.H),
			Low:      parseFloatStr(item.L),
			Close:    parseFloatStr(item.C),
			Volume:   parseFloatStr(item.V),
			Position: 0,
		}
		result = append(result, kline)
	}

	return result, nil
}

// FetchUsFuturesKline 获取美国黄金期货日K线 (COMEX)
// 使用国内API：东方财富 → 新浪国际期货
func (s *KlineService) FetchUsFuturesKline() ([]KlineData, error) {
	// 首先尝试东方财富API（国内可访问）
	result, err := s.fetchEastMoneyKline()
	if err == nil && len(result) > 0 {
		s.cacheResult(result)
		return result, nil
	}

	// 东方财富失败，尝试新浪国际期货API
	result, err = s.fetchSinaGlobalKline()
	if err == nil && len(result) > 0 {
		s.cacheResult(result)
		return result, nil
	}

	// 全部失败，返回缓存数据
	cached := s.getCachedData()
	if len(cached) > 0 {
		return cached, nil
	}
	return nil, fmt.Errorf("all US futures APIs failed")
}

// FetchUsFuturesKlineWithPeriod 根据周期获取美国黄金期货K线
// 使用东方财富API（国内可访问，支持所有周期）
func (s *KlineService) FetchUsFuturesKlineWithPeriod(period string) ([]KlineData, error) {
	// 首先尝试东方财富API（支持所有周期）
	result, err := s.fetchEastMoneyKlineWithPeriod(period)
	if err == nil && len(result) > 0 {
		s.cacheResult(result)
		return result, nil
	}

	// 日线可以尝试新浪国际期货API作为备选
	if period == "day" {
		result, err = s.fetchSinaGlobalKline()
		if err == nil && len(result) > 0 {
			s.cacheResult(result)
			return result, nil
		}
	}

	// 全部失败，返回缓存数据
	cached := s.getCachedData()
	if len(cached) > 0 {
		return cached, nil
	}
	return nil, fmt.Errorf("failed to get US futures kline for period %s", period)
}

// FetchKlineBySymbolAndPeriod 根据symbol和周期获取K线数据
func (s *KlineService) FetchKlineBySymbolAndPeriod(symbol, period string) ([]KlineData, error) {
	// 如果是美国期货，使用东方财富API（支持多周期）
	if symbol == "GC" || symbol == "GC=F" {
		return s.FetchUsFuturesKlineWithPeriod(period)
	}

	// 上海黄金期货使用新浪API（目前只支持日线）
	return s.FetchDailyKline(symbol)
}

// cacheResult 缓存K线数据
func (s *KlineService) cacheResult(data []KlineData) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.cachedData = data
	s.mu.cacheTime = time.Now()
}

// getCachedData 获取缓存的K线数据
func (s *KlineService) getCachedData() []KlineData {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.cachedData
}
