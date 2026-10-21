package favorites

import (
	"net/http"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/middleware"
	"github.com/gin-gonic/gin"
)

type Service struct {
	db *database.DB
}

func NewService(db *database.DB) *Service {
	return &Service{db: db}
}

func (s *Service) List(userID string) ([]domain.Favorite, error) {
	rows, err := s.db.Query("SELECT provider_id, bucket_name FROM favorites WHERE user_id = ?", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []domain.Favorite
	for rows.Next() {
		var f domain.Favorite
		if err := rows.Scan(&f.ProviderID, &f.BucketName); err != nil {
			return nil, err
		}
		result = append(result, f)
	}
	if result == nil {
		result = []domain.Favorite{}
	}
	return result, nil
}

func (s *Service) Add(userID, providerID, bucketName string) error {
	_, err := s.db.Exec(`
		INSERT INTO favorites (user_id, provider_id, bucket_name, created_at)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(user_id, provider_id, bucket_name) DO NOTHING
	`, userID, providerID, bucketName, time.Now().Unix())
	return err
}

func (s *Service) Remove(userID, providerID, bucketName string) error {
	_, err := s.db.Exec(`
		DELETE FROM favorites WHERE user_id = ? AND provider_id = ? AND bucket_name = ?
	`, userID, providerID, bucketName)
	return err
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

	favs, err := h.svc.List(user.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, favs)
}

type FavoriteRequest struct {
	ProviderID string `json:"providerId" binding:"required"`
	BucketName string `json:"bucketName" binding:"required"`
}

func (h *Handler) Add(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req FavoriteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.Add(user.UserID, req.ProviderID, req.BucketName); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) Remove(c *gin.Context) {
	user := middleware.GetUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	providerID := c.Param("providerId")
	bucketName := c.Param("bucketName")

	if err := h.svc.Remove(user.UserID, providerID, bucketName); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}
