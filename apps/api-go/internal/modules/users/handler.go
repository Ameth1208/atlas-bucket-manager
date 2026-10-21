package users

import (
	"net/http"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/middleware"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) List(c *gin.Context) {
	users, err := h.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

type CreateUserRequest struct {
	Name       string          `json:"name" binding:"required"`
	Email      string          `json:"email" binding:"required,email"`
	Password   string          `json:"password" binding:"required,min=6"`
	Role       domain.UserRole `json:"role"`
	AvatarSeed *string         `json:"avatarSeed"`
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.svc.Create(req.Name, req.Email, req.Password, req.Role, req.AvatarSeed)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

type UpdateUserRequest struct {
	Name       *string          `json:"name"`
	Email      *string          `json:"email"`
	Password   *string          `json:"password"`
	Role       *domain.UserRole `json:"role"`
	AvatarSeed *string          `json:"avatarSeed"`
}

func (h *Handler) Update(c *gin.Context) {
	id := c.Param("id")
	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.svc.Update(id, req.Name, req.Email, req.Role, req.AvatarSeed, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *Handler) ResetPassword(c *gin.Context) {
	id := c.Param("id")
	resetURL, expiresAt, err := h.svc.ResetPassword(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"resetUrl":  resetURL,
		"expiresAt": expiresAt,
	})
}

type AcceptPasswordResetRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *Handler) AcceptPasswordReset(c *gin.Context) {
	var req AcceptPasswordResetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.AcceptPasswordReset(req.Token, req.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.Delete(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) DeleteSelf(c *gin.Context) {
	authUser := middleware.GetUser(c)
	if authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.svc.DeleteSelf(authUser.UserID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
