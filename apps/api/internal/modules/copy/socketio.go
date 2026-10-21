package copy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type SocketIOServer struct {
	upgrader websocket.Upgrader
	clients  map[*websocket.Conn]bool
	mu       sync.Mutex
}

func NewSocketIOServer(copySvc *Service) *SocketIOServer {
	s := &SocketIOServer{
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		clients: make(map[*websocket.Conn]bool),
	}

	copySvc.OnEvent(func(event string, job *domain.CopyJob) {
		s.Broadcast(event, job)
	})

	return s
}

func (s *SocketIOServer) Broadcast(event string, data interface{}) {
	payload, err := json.Marshal([]interface{}{event, data})
	if err != nil {
		return
	}
	msg := fmt.Sprintf("42%s", string(payload))

	s.mu.Lock()
	defer s.mu.Unlock()

	for conn := range s.clients {
		_ = conn.WriteMessage(websocket.TextMessage, []byte(msg))
	}
}

func (s *SocketIOServer) Handle(c *gin.Context) {
	// If transport is polling
	transport := c.Query("transport")

	if transport == "polling" && !websocket.IsWebSocketUpgrade(c.Request) {
		sid := c.Query("sid")
		if sid == "" {
			// Handshake
			newSID := uuid.New().String()
			handshake := fmt.Sprintf(`0{"sid":"%s","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000}`, newSID)
			c.Header("Content-Type", "text/plain; charset=UTF-8")
			c.String(http.StatusOK, handshake)
			return
		}

		if c.Request.Method == "POST" {
			c.Header("Content-Type", "text/plain; charset=UTF-8")
			c.String(http.StatusOK, "ok")
			return
		}

		// GET polling keep-alive
		c.Header("Content-Type", "text/plain; charset=UTF-8")
		c.String(http.StatusOK, "40")
		return
	}

	// WebSocket upgrade
	conn, err := s.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	s.mu.Lock()
	s.clients[conn] = true
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		delete(s.clients, conn)
		s.mu.Unlock()
		conn.Close()
	}()

	// Send initial Socket.IO connect packets
	sid := uuid.New().String()
	handshake := fmt.Sprintf(`0{"sid":"%s","upgrades":[],"pingInterval":25000,"pingTimeout":20000}`, sid)
	_ = conn.WriteMessage(websocket.TextMessage, []byte(handshake))
	_ = conn.WriteMessage(websocket.TextMessage, []byte("40"))

	// Keep-alive loop
	for {
		msgType, p, err := conn.ReadMessage()
		if err != nil {
			break
		}

		msg := string(p)
		if msg == "2" { // Ping from client
			_ = conn.WriteMessage(msgType, []byte("3")) // Pong back
		} else if msg == "3" { // Pong from client
			// ok
		}
		_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	}
}
