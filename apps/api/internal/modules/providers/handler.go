package providers

import (
	"net/http"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/domain"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) List(c *gin.Context) {
	list, err := h.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *Handler) Get(c *gin.Context) {
	id := c.Param("id")
	p, err := h.svc.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Provider not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

type ProviderRequest struct {
	Name      string `json:"name" binding:"required"`
	Kind      string `json:"kind" binding:"required"`
	EndPoint  string `json:"endPoint" binding:"required"`
	Port      int    `json:"port" binding:"required"`
	UseSSL    bool   `json:"useSSL"`
	AccessKey string `json:"accessKey" binding:"required"`
	SecretKey string `json:"secretKey" binding:"required"`
	Region    string `json:"region"`
}

func (h *Handler) Create(c *gin.Context) {
	var req ProviderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	p := &domain.Provider{
		Name:      req.Name,
		Kind:      req.Kind,
		EndPoint:  req.EndPoint,
		Port:      req.Port,
		UseSSL:    req.UseSSL,
		AccessKey: req.AccessKey,
		SecretKey: req.SecretKey,
		Region:    req.Region,
	}

	created, err := h.svc.Create(c.Request.Context(), p)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, created)
}

func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	var req ProviderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	p := &domain.Provider{
		Name:      req.Name,
		Kind:      req.Kind,
		EndPoint:  req.EndPoint,
		Port:      req.Port,
		UseSSL:    req.UseSSL,
		AccessKey: req.AccessKey,
		SecretKey: req.SecretKey,
		Region:    req.Region,
	}

	updated, err := h.svc.Update(c.Request.Context(), id, p)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updated)
}

func (h *Handler) Remove(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.Remove(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}
