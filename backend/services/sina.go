package services

import (
	"fmt"
	"io"
	"math"
	"net/http"
	"regexp"
	"strings"
	"time"

	"gold-monitor-backend/models"
)

const sinaBaseURL = "http://hq.sinajs.cn/list="

// 预编译正则表达式，提升性能（支持大小写混合的 symbol）
var sinaDataRegex = regexp.MustCompile(`hq_str_([A-Za-z0-9_]+)="([^"]*)"`)

// SinaService Sina Finance API 服务
type SinaService struct {
	client      *http.Client
	dxyService  *DxyService  // 复用 DXY 服务实例
	paxgService *PaxgService // 复用 PAXG 服务实例
}

// NewSinaService 创建新的 Sina 服务实例
func NewSinaService() *SinaService {
	return &SinaService{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		dxyService:  NewDxyService(),
		paxgService: NewPaxgService(),
	}
}

// createRequest 创建带有必要头信息的请求
func (s *SinaService) createRequest(url string) (*http.Request, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Referer", "http://finance.sina.com.cn/")
	req.Header.Set("Accept", "*/*")
	return req, nil
}

// parseSinaData 解析 Sina API 返回的数据（使用预编译正则）
func (s *SinaService) parseSinaData(responseBody []byte, symbol string) ([]string, error) {
	matches := sinaDataRegex.FindSubmatch(responseBody)
	if len(matches) < 3 {
		return nil, fmt.Errorf("failed to parse data for symbol: %s", symbol)
	}

	// 验证 symbol 是否匹配（忽略大小写）
	if !strings.EqualFold(string(matches[1]), symbol) {
		return nil, fmt.Errorf("symbol mismatch: expected %s, got %s", symbol, string(matches[1]))
	}

	data := string(matches[2])
	if data == "" {
		return nil, fmt.Errorf("empty data for symbol: %s", symbol)
	}

	return strings.Split(data, ","), nil
}

// fetchSina 通用的新浪数据获取方法
func (s *SinaService) fetchSina(symbol string) ([]string, error) {
	url := sinaBaseURL + symbol
	req, err := s.createRequest(url)
	if err != nil {
		return nil, err
	}
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return s.parseSinaData(body, symbol)
}

// FetchAu9999 获取上海黄金价格
func (s *SinaService) FetchAu9999() (*models.GoldPrice, error) {
	data, err := s.fetchSina("SGE_AU9999")
	if err != nil {
		return nil, err
	}

	ask := parseFloat(data[3])
	bid := parseFloat(data[4])
	prevClose := parseFloat(data[5])

	current := ask
	if current == 0 {
		current = (bid + ask) / 2
	}
	if current == 0 {
		current = bid
	}

	change := current - prevClose
	changePercent := 0.0
	if prevClose > 0 {
		changePercent = (change / prevClose) * 100
	}

	return &models.GoldPrice{
		Name:          "上海黄金",
		Symbol:        "AU9999",
		Current:       round(current, 2),
		PrevClose:     prevClose,
		Change:        round(change, 2),
		ChangePercent: round(changePercent, 2),
		Currency:      "CNY",
		Timestamp:     time.Now(),
	}, nil
}

// FetchUsFutures 获取美国黄金期货价格
func (s *SinaService) FetchUsFutures() (*models.GoldPrice, error) {
	data, err := s.fetchSina("hf_GC")
	if err != nil {
		return nil, err
	}

	current := parseFloat(data[0])
	prevClose := parseFloat(data[5])
	if prevClose == 0 {
		prevClose = current
	}
	change := current - prevClose
	changePercent := 0.0
	if prevClose > 0 {
		changePercent = (change / prevClose) * 100
	}

	return &models.GoldPrice{
		Name:          "美国期货",
		Symbol:        "GC",
		Current:       current,
		PrevClose:     prevClose,
		Change:        change,
		ChangePercent: round(changePercent, 2),
		Currency:      "USD",
		Timestamp:     time.Now(),
	}, nil
}

// FetchUkFutures 获取英国/伦敦黄金现货价格
func (s *SinaService) FetchUkFutures() (*models.GoldPrice, error) {
	data, err := s.fetchSina("hf_XAU")
	if err != nil {
		return nil, err
	}

	current := parseFloat(data[0])
	prevClose := parseFloat(data[1])
	if prevClose == 0 {
		prevClose = current
	}
	change := current - prevClose
	changePercent := 0.0
	if prevClose > 0 {
		changePercent = (change / prevClose) * 100
	}

	return &models.GoldPrice{
		Name:          "伦敦金",
		Symbol:        "XAU",
		Current:       current,
		PrevClose:     prevClose,
		Change:        change,
		ChangePercent: round(changePercent, 2),
		Currency:      "USD",
		Timestamp:     time.Now(),
	}, nil
}

// FetchUsdCny 获取美元人民币汇率
func (s *SinaService) FetchUsdCny() (*models.ExchangeRate, error) {
	data, err := s.fetchSina("USDCNY")
	if err != nil {
		return nil, err
	}

	current := round(parseFloat(data[1]), 4)
	prevClose := round(parseFloat(data[5]), 4)
	if prevClose == 0 {
		prevClose = current
	}
	change := current - prevClose
	changePercent := 0.0
	if prevClose > 0 {
		changePercent = (change / prevClose) * 100
	}

	return &models.ExchangeRate{
		Name:          "人民币汇率",
		Symbol:        "USD/CNY",
		Current:       current,
		PrevClose:     prevClose,
		Change:        change,
		ChangePercent: round(changePercent, 2),
		Currency:      "RATE",
		Timestamp:     time.Now(),
	}, nil
}

// FetchAll 并发获取所有数据（国内源优先，总超时5秒，失败时使用缓存）
func (s *SinaService) FetchAll() (*models.AllPricesResponse, error) {
	var au9999, usFutures, ukFutures, paxg *models.GoldPrice
	var usdCny *models.ExchangeRate
	var dxy *models.ExchangeRate

	type result struct {
		name string
		data interface{}
		err  error
	}

	results := make(chan result, 6)

	// 国内源（新浪）- 优先快速获取
	go func() {
		data, err := s.FetchAu9999()
		results <- result{"au9999", data, err}
	}()

	go func() {
		data, err := s.FetchUsFutures()
		results <- result{"usFutures", data, err}
	}()

	go func() {
		data, err := s.FetchUkFutures()
		results <- result{"ukFutures", data, err}
	}()

	go func() {
		data, err := s.FetchUsdCny()
		results <- result{"usdCny", data, err}
	}()

	// 境外源 - 复用服务实例（它们有自己的缓存机制）
	go func() {
		data, err := s.dxyService.FetchDxy()
		// FetchDxy 内部已经有缓存fallback，err!=nil时data可能是缓存数据
		results <- result{"dxy", data, err}
	}()

	go func() {
		// 先获取汇率
		rate := 6.9
		if r, err := s.FetchUsdCny(); err == nil && r.Current > 0 {
			rate = r.Current
		}
		data, err := s.paxgService.FetchPaxg(rate)
		// FetchPaxg 内部已经有缓存fallback
		results <- result{"paxg", data, err}
	}()

	// 使用超时机制，最多等待5秒
	timeout := time.After(5 * time.Second)
	domesticReceived := 0
	totalReceived := 0

	for {
		select {
		case r := <-results:
			totalReceived++
			// 即使err!=nil，data也可能是缓存数据
			if r.data != nil {
				switch r.name {
				case "au9999":
					au9999 = r.data.(*models.GoldPrice)
					domesticReceived++
				case "usFutures":
					usFutures = r.data.(*models.GoldPrice)
					domesticReceived++
				case "ukFutures":
					ukFutures = r.data.(*models.GoldPrice)
					domesticReceived++
				case "usdCny":
					usdCny = r.data.(*models.ExchangeRate)
					domesticReceived++
				case "dxy":
					dxy = r.data.(*models.ExchangeRate)
				case "paxg":
					paxg = r.data.(*models.GoldPrice)
				}
			}
			if totalReceived >= 6 {
				goto done
			}
			if domesticReceived >= 4 && totalReceived >= 4 {
				// 国内数据已获取，额外等待1秒获取境外数据
				select {
				case r := <-results:
					totalReceived++
					if r.data != nil {
						switch r.name {
						case "dxy":
							dxy = r.data.(*models.ExchangeRate)
						case "paxg":
							paxg = r.data.(*models.GoldPrice)
						}
					}
				case <-time.After(1 * time.Second):
					goto done
				}
				if totalReceived >= 6 {
					goto done
				}
			}
		case <-timeout:
			goto done
		}
	}

done:
	// 如果DXY为空，尝试从缓存获取
	if dxy == nil {
		dxy = s.dxyService.getCachedData()
	}

	// 如果PAXG为空，尝试从缓存获取
	if paxg == nil {
		paxg = s.paxgService.getCachedData()
	}

	// 计算人民币价格
	if usdCny != nil && usdCny.Current > 0 {
		if usFutures != nil {
			usFutures.CnyPrice = usFutures.Current * usdCny.Current
		}
		if ukFutures != nil {
			ukFutures.CnyPrice = ukFutures.Current * usdCny.Current
		}
		if paxg != nil {
			paxg.CnyPrice = paxg.Current * usdCny.Current
		}
	}

	return &models.AllPricesResponse{
		Au9999:     au9999,
		UsFutures:  usFutures,
		UkFutures:  ukFutures,
		UsdCny:     usdCny,
		Dxy:        dxy,
		Paxg:       paxg,
		LastUpdate: time.Now(),
	}, nil
}

// parseFloat 安全地将字符串转换为 float64
func parseFloat(s string) float64 {
	var f float64
	fmt.Sscanf(s, "%f", &f)
	return f
}

// round 四舍五入到指定小数位（使用 math.Round）
func round(value float64, places int) float64 {
	multiplier := math.Pow10(places)
	return math.Round(value*multiplier) / multiplier
}
