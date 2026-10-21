package buckets

import (
	"net/http"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func computeLimitBytes(limit *int64, unit string) *int64 {
	if limit == nil {
		return nil
	}
	val := *limit
	var multiplier int64 = 1
	switch unit {
	case "KB":
		multiplier = 1024
	case "MB":
		multiplier = 1024 * 1024
	case "GB":
		multiplier = 1024 * 1024 * 1024
	case "TB":
		multiplier = 1024 * 1024 * 1024 * 1024
	}
	computed := val * multiplier
	return &computed
}

func (h *Handler) List(c *gin.Context) {
	var userID string
	if user := middleware.GetUser(c); user != nil {
		userID = user.UserID
	}

	result, err := h.svc.List(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *Handler) StatsMany(c *gin.Context) {
	var userID string
	if user := middleware.GetUser(c); user != nil {
		userID = user.UserID
	}

	stats, err := h.svc.StatsMany(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

type CreateBucketRequest struct {
	Name       string `json:"name" binding:"required"`
	ProviderID string `json:"providerId" binding:"required"`
	Limit      *int64 `json:"limit"`
	LimitUnit  string `json:"limitUnit"`
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateBucketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	limitBytes := computeLimitBytes(req.Limit, req.LimitUnit)
	if err := h.svc.Create(c.Request.Context(), req.ProviderID, req.Name, limitBytes); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) Remove(c *gin.Context) {
	providerID := c.Param("providerId")
	name := c.Param("name")

	if err := h.svc.Remove(c.Request.Context(), providerID, name); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

type PolicyRequest struct {
	IsPublic bool `json:"isPublic"`
}

func (h *Handler) SetPolicy(c *gin.Context) {
	providerID := c.Param("providerId")
	name := c.Param("name")

	var req PolicyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.SetVisibility(c.Request.Context(), providerID, name, req.IsPublic); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

type LimitRequest struct {
	Limit int64  `json:"limit" binding:"required"`
	Unit  string `json:"unit"`
}

func (h *Handler) SetLimit(c *gin.Context) {
	providerID := c.Param("providerId")
	name := c.Param("name")

	var req LimitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	limitBytes := computeLimitBytes(&req.Limit, req.Unit)
	if err := h.svc.SetLimit(providerID, name, limitBytes); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) Stats(c *gin.Context) {
	providerID := c.Param("providerId")
	name := c.Param("name")

	stats, err := h.svc.Stats(c.Request.Context(), providerID, name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *Handler) PublicEndpoint(c *gin.Context) {
	providerID := c.Param("providerId")
	name := c.Param("name")

	url, err := h.svc.PublicEndpoint(providerID, name)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"url": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": *url})
}
