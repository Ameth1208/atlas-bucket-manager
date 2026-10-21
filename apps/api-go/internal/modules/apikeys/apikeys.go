package apikeys

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/http"
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

func (s *Service) List(userID string) ([]domain.ApiKeyInfo, error) {
	rows, err := s.db.Query(`
		SELECT id, name, prefix, scopes, user_id, bucket_filter, last_used, created_at, revoked_at
		FROM api_keys WHERE user_id = ? ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.ApiKeyInfo
	for rows.Next() {
		var k domain.ApiKeyInfo
		if err := rows.Scan(&k.ID, &k.Name, &k.Prefix, &k.Scopes, &k.UserID, &k.BucketFilter, &k.LastUsed, &k.CreatedAt, &k.RevokedAt); err != nil {
			return nil, err
		}
		result = append(result, k)
	}
	if result == nil {
		result = []domain.ApiKeyInfo{}
	}
	return result, nil
}

func (s *Service) Create(userID, name, scopes string, bucketFilter *string) (*domain.CreatedApiKey, error) {
	if scopes == "" {
		scopes = "read"
	}

	bytes := make([]byte, 24)
	if _, err := rand.Read(bytes); err != nil {
		return nil, err
	}
	randomPart := hex.EncodeToString(bytes)
	fullKey := "atl_" + randomPart
	prefix := "atl_" + randomPart[:8]

	hashBytes := sha256.Sum256([]byte(fullKey))
	keyHash := hex.EncodeToString(hashBytes[:])

	id := uuid.New().String()
	now := time.Now().Unix()

	_, err := s.db.Exec(`
		INSERT INTO api_keys (id, name, key_hash, prefix, scopes, user_id, bucket_filter, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, id, name, keyHash, prefix, scopes, userID, bucketFilter, now)
	if err != nil {
		return nil, err
	}

	return &domain.CreatedApiKey{
		ApiKeyInfo: domain.ApiKeyInfo{
			ID:           id,
			Name:         name,
			Prefix:       prefix,
			Scopes:       scopes,
			UserID:       userID,
			BucketFilter: bucketFilter,
			CreatedAt:    now,
		},
		FullKey: fullKey,
	}, nil
}

func (s *Service) Revoke(id string) error {
	now := time.Now().Unix()
	res, err := s.db.Exec("UPDATE api_keys SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL", now, id)
	if err != nil {
		return err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return errors.New("key not found or already revoked")
	}
	return nil
}

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) List(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	keys, err := h.svc.List(user.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, keys)
}

type CreateApiKeyRequest struct {
	Name         string  `json:"name" binding:"required"`
	Scopes       string  `json:"scopes"`
	BucketFilter *string `json:"bucketFilter"`
}

func (h *Handler) Create(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req CreateApiKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	created, err := h.svc.Create(user.UserID, req.Name, req.Scopes, req.BucketFilter)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, created)
}

func (h *Handler) Revoke(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.Revoke(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}
