package models

import "time"

// GoldPrice 黄金价格数据模型
type GoldPrice struct {
	Name          string                   `json:"name"`
	Symbol        string                   `json:"symbol"`
	Current       float64                  `json:"current"`
	PrevClose     float64                  `json:"prevClose"`
	Change        float64                  `json:"change"`
	ChangePercent float64                  `json:"changePercent"`
	Currency      string                   `json:"currency"`
	CnyPrice      float64                  `json:"cnyPrice"` // 人民币价格（如果需要）
	Timestamp     time.Time                `json:"timestamp"`
	History       []map[string]interface{} `json:"history"` // 历史数据
}

// ExchangeRate 汇率数据模型
type ExchangeRate struct {
	Name          string                   `json:"name"`
	Symbol        string                   `json:"symbol"`
	Current       float64                  `json:"current"`
	PrevClose     float64                  `json:"prevClose"`
	Change        float64                  `json:"change"`
	ChangePercent float64                  `json:"changePercent"`
	Currency      string                   `json:"currency"`
	Timestamp     time.Time                `json:"timestamp"`
	History       []map[string]interface{} `json:"history"` // 历史数据
}

// AllPricesResponse 返回所有价格数据的响应
type AllPricesResponse struct {
	Au9999     *GoldPrice    `json:"au9999"`
	UsFutures  *GoldPrice    `json:"usFutures"`
	UkFutures  *GoldPrice    `json:"ukFutures"`
	UsdCny     *ExchangeRate `json:"usdCny"`
	Dxy        *ExchangeRate `json:"dxy"`
	Paxg       *GoldPrice    `json:"paxg"`
	LastUpdate time.Time     `json:"lastUpdate"`
}