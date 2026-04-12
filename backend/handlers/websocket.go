package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// HandleWebSocket handles WebSocket connections
func HandleWebSocket(hub *WSHub) gin.HandlerFunc {
	return func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WebSocket upgrade error: %v", err)
			return
		}

		client := NewWSClient(hub)
		client.Register()
		defer func() {
			client.Unregister()
			conn.Close()
		}()

		// Start write goroutine
		go func() {
			for message := range client.send {
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					log.Printf("WebSocket write error: %v", err)
					return
				}
			}
		}()

		// Read messages (keep connection alive)
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("WebSocket read error: %v", err)
				}
				break
			}
		}
	}
}

// WSClient represents a WebSocket client
type WSClient struct {
	hub     *WSHub
	send    chan []byte
	LastMsg time.Time
}

// WSHub maintains the set of active clients and broadcasts messages to them
type WSHub struct {
	clients    map[*WSClient]bool
	broadcast  chan []byte
	register   chan *WSClient
	unregister chan *WSClient
	mu         sync.RWMutex
}

// ClientCount returns the number of connected clients
func (h *WSHub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// NewWSHub creates a new WebSocket hub
func NewWSHub() *WSHub {
	return &WSHub{
		clients:    make(map[*WSClient]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *WSClient),
		unregister: make(chan *WSClient),
	}
}

// Run starts the hub
func (h *WSHub) Run() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("WebSocket client connected. Total: %d", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("WebSocket client disconnected. Total: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			pendingDeletes := make([]*WSClient, 0)
			for client := range h.clients {
				select {
				case client.send <- message:
					client.LastMsg = time.Now()
				default:
					// Client buffer full, collect for cleanup (can't modify under RLock)
					pendingDeletes = append(pendingDeletes, client)
				}
			}
			h.mu.RUnlock()

			// Now cleanup under full Lock
			if len(pendingDeletes) > 0 {
				h.mu.Lock()
				for _, client := range pendingDeletes {
					if _, ok := h.clients[client]; ok {
						close(client.send)
						delete(h.clients, client)
					}
				}
				h.mu.Unlock()
				log.Printf("WebSocket: cleaned %d stale clients", len(pendingDeletes))
			}

		case <-ticker.C:
			// Cleanup inactive clients (no message sent in 2 minutes)
			h.mu.Lock()
			for client := range h.clients {
				if time.Since(client.LastMsg) > 2*time.Minute {
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}

// Broadcast sends a message to all connected clients
func (h *WSHub) Broadcast(message interface{}) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}
	h.broadcast <- data
	return nil
}

// NewWSClient creates a new WebSocket client
func NewWSClient(hub *WSHub) *WSClient {
	return &WSClient{
		hub:     hub,
		send:    make(chan []byte, 256),
		LastMsg: time.Now(),
	}
}

// Register registers the client with the hub
func (c *WSClient) Register() {
	c.hub.register <- c
}

// Unregister unregisters the client from the hub
func (c *WSClient) Unregister() {
	c.hub.unregister <- c
}
