package cache

import (
	"sync"
	"time"
)

// NeverExpire 永不过期的TTL标记，用于fallback缓存
const NeverExpire time.Duration = -1

// CacheItem 缓存项
type CacheItem struct {
	Value      interface{}
	Expiration time.Time
	NeverExpire bool
}

// Cache 简单的内存缓存
type Cache struct {
	items map[string]CacheItem
	mu    sync.RWMutex
}

// NewCache 创建新的缓存实例
func NewCache() *Cache {
	c := &Cache{
		items: make(map[string]CacheItem),
	}
	// 启动清理定时器
	go c.cleanup()
	return c
}

// Set 设置缓存项
// duration 为 NeverExpire 时永不过期
func (c *Cache) Set(key string, value interface{}, duration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if duration == NeverExpire {
		c.items[key] = CacheItem{
			Value:       value,
			NeverExpire: true,
		}
	} else {
		c.items[key] = CacheItem{
			Value:      value,
			Expiration: time.Now().Add(duration),
		}
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
	if item.NeverExpire {
		return item.Value, true
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
			if !item.NeverExpire && time.Now().After(item.Expiration) {
				delete(c.items, key)
			}
		}
		c.mu.Unlock()
	}
}
