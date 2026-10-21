package integrations

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Service struct {
	db *database.DB
}

func NewService(db *database.DB) *Service {
	return &Service{db: db}
}

func (s *Service) ListWebhooks() ([]domain.Webhook, error) {
	rows, err := s.db.Query("SELECT id, url, events, created_at FROM webhooks ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Webhook
	for rows.Next() {
		var w domain.Webhook
		var eventsStr string
		if err := rows.Scan(&w.ID, &w.URL, &eventsStr, &w.CreatedAt); err != nil {
			return nil, err
		}
		w.Events = strings.Split(eventsStr, ",")
		result = append(result, w)
	}
	if result == nil {
		result = []domain.Webhook{}
	}
	return result, nil
}

func (s *Service) CreateWebhook(url string, events []string, createdBy string) (*domain.Webhook, error) {
	id := uuid.New().String()
	now := time.Now().Unix()
	eventsStr := strings.Join(events, ",")

	_, err := s.db.Exec(`
		INSERT INTO webhooks (id, url, events, created_by, created_at)
		VALUES (?, ?, ?, ?, ?)
	`, id, url, eventsStr, createdBy, now)
	if err != nil {
		return nil, err
	}

	return &domain.Webhook{
		ID:        id,
		URL:       url,
		Events:    events,
		CreatedAt: now,
	}, nil
}

func (s *Service) DeleteWebhook(id string) error {
	res, err := s.db.Exec("DELETE FROM webhooks WHERE id = ?", id)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return errors.New("webhook not found")
	}
	return nil
}

func (s *Service) TestWebhook(id string) error {
	var url string
	err := s.db.QueryRow("SELECT url FROM webhooks WHERE id = ?", id).Scan(&url)
	if err != nil {
		return errors.New("webhook not found")
	}

	payload := map[string]interface{}{
		"event":     "test",
		"timestamp": time.Now().Unix(),
		"message":   "Atlas Bucket Manager Webhook Test",
	}
	body, _ := json.Marshal(payload)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return errors.New("webhook server returned error status")
	}
	return nil
}

func (s *Service) GetNotificationPrefs(userID string) (*domain.NotificationPrefs, error) {
	var emailEnabled, onUpload, onDelete int
	err := s.db.QueryRow(`
		SELECT email_enabled, on_upload, on_delete FROM notification_prefs WHERE user_id = ?
	`, userID).Scan(&emailEnabled, &onUpload, &onDelete)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Default values
			return &domain.NotificationPrefs{
				EmailEnabled: true,
				OnUpload:     true,
				OnDelete:     true,
			}, nil
		}
		return nil, err
	}

	return &domain.NotificationPrefs{
		EmailEnabled: emailEnabled == 1,
		OnUpload:     onUpload == 1,
		OnDelete:     onDelete == 1,
	}, nil
}

func (s *Service) UpdateNotificationPrefs(userID string, prefs *domain.NotificationPrefs) error {
	emailVal := 0
	if prefs.EmailEnabled {
		emailVal = 1
	}
	uploadVal := 0
	if prefs.OnUpload {
		uploadVal = 1
	}
	deleteVal := 0
	if prefs.OnDelete {
		deleteVal = 1
	}

	_, err := s.db.Exec(`
		INSERT INTO notification_prefs (user_id, email_enabled, on_upload, on_delete, updated_at)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(user_id) DO UPDATE SET
			email_enabled = excluded.email_enabled,
			on_upload = excluded.on_upload,
			on_delete = excluded.on_delete,
			updated_at = excluded.updated_at
	`, userID, emailVal, uploadVal, deleteVal, time.Now().Unix())
	return err
}

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) ListWebhooks(c *gin.Context) {
	hooks, err := h.svc.ListWebhooks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, hooks)
}

type CreateWebhookRequest struct {
	URL    string   `json:"url" binding:"required,url"`
	Events []string `json:"events" binding:"required"`
}

func (h *Handler) CreateWebhook(c *gin.Context) {
	var req CreateWebhookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	actor := "system"
	if u := middleware.GetUser(c); u != nil {
		actor = u.UserID
	}

	hook, err := h.svc.CreateWebhook(req.URL, req.Events, actor)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, hook)
}

func (h *Handler) DeleteWebhook(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteWebhook(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) TestWebhook(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.TestWebhook(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) GetNotificationPrefs(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	prefs, err := h.svc.GetNotificationPrefs(user.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, prefs)
}

type UpdateNotificationPrefsRequest struct {
	EmailEnabled *bool `json:"emailEnabled"`
	OnUpload     *bool `json:"onUpload"`
	OnDelete     *bool `json:"onDelete"`
}

func (h *Handler) UpdateNotificationPrefs(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req UpdateNotificationPrefsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	current, err := h.svc.GetNotificationPrefs(user.UserID)
	if err != nil {
		current = &domain.NotificationPrefs{EmailEnabled: true, OnUpload: true, OnDelete: true}
	}

	if req.EmailEnabled != nil {
		current.EmailEnabled = *req.EmailEnabled
	}
	if req.OnUpload != nil {
		current.OnUpload = *req.OnUpload
	}
	if req.OnDelete != nil {
		current.OnDelete = *req.OnDelete
	}

	if err := h.svc.UpdateNotificationPrefs(user.UserID, current); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, current)
}
