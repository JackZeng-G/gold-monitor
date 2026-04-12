package cache

import (
	"sync"
	"time"
)

// CacheItem 缓存项
type CacheItem struct {
	Value      interface{}
	Expiration time.Time
}

// Cache 简单的内存缓存
type Cache struct {
	items map[string]CacheItem
	mu    sync.RWMutex
}

// NewCache 创建新的缓存实例
func NewCache() *Cache {
	cache := &Cache{
		items: make(map[string]CacheItem),
	}
	// 启动清理定时器
	go cache.cleanup()
	return cache
}

// Set 设置缓存项
func (c *Cache) Set(key string, value interface{}, duration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = CacheItem{
		Value:      value,
		Expiration: time.Now().Add(duration),
	}
}

// Get 获取缓存项
func (c *Cache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	item, found := c.items[key]
	if !found {
		return nil, false
	}
	if time.Now().After(item.Expiration) {
		return nil, false
	}
	return item.Value, true
}

// Delete 删除缓存项
func (c *Cache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, key)
}

// Clear 清除所有缓存项
func (c *Cache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items = make(map[string]CacheItem)
}

// cleanup 定期清理过期缓存
func (c *Cache) cleanup() {
	for {
		time.Sleep(1 * time.Minute)
		c.mu.Lock()
		for key, item := range c.items {
			if time.Now().After(item.Expiration) {
				delete(c.items, key)
			}
		}
		c.mu.Unlock()
	}
}
