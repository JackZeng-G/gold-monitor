package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// NewsItem 新闻条目
type NewsItem struct {
	Title     string `json:"title"`
	Summary   string `json:"summary"`
	Source    string `json:"source"`
	Time      string `json:"time"`
	URL       string `json:"url"`
	Tag       string `json:"tag,omitempty"`
	TagClass  string `json:"tagClass,omitempty"`
	Timestamp int64  `json:"timestamp"`
}

// NewsService 新闻服务
type NewsService struct {
	client *http.Client
}

// NewNewsService 创建新闻服务
func NewNewsService() *NewsService {
	return &NewsService{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SinaNewsResponse 新浪新闻API响应
type SinaNewsResponse struct {
	Result struct {
		Data []struct {
			Title   string `json:"title"`
			Summary string `json:"summary"`
			Source  string `json:"media_name"`
			CTime   string `json:"ctime"`
			URL     string `json:"url"`
			ID      string `json:"docid"`
		} `json:"data"`
	} `json:"result"`
}

// FetchGoldNews 从新浪财经获取黄金相关新闻
func (s *NewsService) FetchGoldNews() ([]NewsItem, error) {
	// 使用贵金属和期货频道
	urls := []string{
		// 贵金属频道
		"https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2516&num=30&page=1&r=" + fmt.Sprintf("%d", time.Now().Unix()),
		// 期货频道
		"https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2508&num=30&page=1&r=" + fmt.Sprintf("%d", time.Now().Unix()),
	}

	var allNews []NewsItem

	for _, url := range urls {
		news, err := s.fetchFromSina(url)
		if err == nil && len(news) > 0 {
			allNews = append(allNews, news...)
		}
	}

	// 去重并限制数量
	if len(allNews) > 0 {
		return deduplicateNews(allNews, 50), nil
	}

	return nil, fmt.Errorf("no news fetched")
}

// fetchFromSina 从新浪API获取新闻（使用专门的贵金属/期货频道，不需要关键词过滤）
func (s *NewsService) fetchFromSina(url string) ([]NewsItem, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Referer", "https://finance.sina.com.cn")
	req.Header.Set("Accept", "application/json, text/plain, */*")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var sinaNews SinaNewsResponse
	if err := json.Unmarshal(body, &sinaNews); err != nil {
		return nil, err
	}

	// 转换为统一格式（不做关键词过滤，因为使用的是专门的贵金属/期货频道）
	news := make([]NewsItem, 0)

	for _, item := range sinaNews.Result.Data {
		// 解析时间
		timestamp := parseTime(item.CTime)
		timeStr := formatTimeAgo(timestamp)

		// 根据标题内容添加标签
		tag, tagClass := extractTag(item.Title + " " + item.Summary)

		news = append(news, NewsItem{
			Title:     item.Title,
			Summary:   item.Summary,
			Source:    item.Source,
			Time:      timeStr,
			URL:       item.URL,
			Tag:       tag,
			TagClass:  tagClass,
			Timestamp: timestamp,
		})
	}

	if len(news) == 0 {
		return nil, fmt.Errorf("no news from sina")
	}

	return news, nil
}

// deduplicateNews 去重并限制数量
func deduplicateNews(news []NewsItem, maxItems int) []NewsItem {
	seen := make(map[string]bool)
	result := make([]NewsItem, 0)

	for _, item := range news {
		if !seen[item.Title] {
			seen[item.Title] = true
			result = append(result, item)
		}
		if len(result) >= maxItems {
			break
		}
	}

	return result
}

// parseTime 解析时间字符串
func parseTime(timeStr string) int64 {
	// 尝试多种格式解析
	formats := []string{
		"2006-01-02 15:04:05",
		"2006年01月02日 15:04",
		"2006/01/02 15:04",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			return t.Unix()
		}
	}

	return time.Now().Unix()
}

// formatTimeAgo 格式化为具体时间
func formatTimeAgo(timestamp int64) string {
	t := time.Unix(timestamp, 0)
	now := time.Now()

	// 如果是今天，显示时:分
	if t.Format("2006-01-02") == now.Format("2006-01-02") {
		return t.Format("15:04")
	}
	// 如果是今年，显示月-日 时:分
	if t.Year() == now.Year() {
		return t.Format("01-02 15:04")
	}
	// 其他显示完整日期
	return t.Format("2006-01-02 15:04")
}

// extractTag 根据内容提取标签
func extractTag(content string) (string, string) {
	content = strings.ToLower(content)

	// 关键词匹配
	keywords := map[string][]string{
		"热点": {"热门", "新高", "历史", "暴涨", "暴跌", "突破"},
		"央行": {"央行", "购金", "储备", "增持"},
		"资金": {"基金", "资金", "流入", "流出", "持仓"},
		"避险": {"避险", "地缘", "风险", "战争", "冲突"},
		"机构": {"机构", "高盛", "摩根", "观点", "预测", "目标价"},
		"需求": {"需求", "消费", "购金", "金饰", "印度", "中国"},
	}

	for tag, words := range keywords {
		for _, word := range words {
			if strings.Contains(content, word) {
				return tag, getTagClass(tag)
			}
		}
	}

	return "", ""
}

// getTagClass 获取标签样式类
func getTagClass(tag string) string {
	classes := map[string]string{
		"热点": "hot",
		"央行": "bank",
		"资金": "money",
		"避险": "safe",
		"机构": "org",
		"需求": "demand",
	}
	if class, ok := classes[tag]; ok {
		return class
	}
	return ""
}
