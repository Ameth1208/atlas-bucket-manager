package auth

import (
	"net/http"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/config"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
	cfg *config.Config
}

func NewHandler(svc *Service, cfg *config.Config) *Handler {
	return &Handler{svc: svc, cfg: cfg}
}

func (h *Handler) setCookie(c *gin.Context, token string) {
	isProd := h.cfg.NodeEnv == "production"
	// maxAge in seconds: 7 days
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_token", token, 7*24*60*60, "/", "", isProd, true)
}

func (h *Handler) Status(c *gin.Context) {
	complete, err := h.svc.IsSetupComplete()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"isSetup": complete})
}

type SetupRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *Handler) Setup(c *gin.Context) {
	var req SetupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, err := h.svc.Setup(req.Name, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	h.setCookie(c, token)
	c.JSON(http.StatusOK, gin.H{"success": true, "user": user})
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, err := h.svc.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	h.setCookie(c, token)
	c.JSON(http.StatusOK, gin.H{"success": true, "user": user})
}

func (h *Handler) Logout(c *gin.Context) {
	isProd := h.cfg.NodeEnv == "production"
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_token", "", -1, "/", "", isProd, true)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) Me(c *gin.Context) {
	authUser := middleware.GetUser(c)
	if authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, err := h.svc.Me(authUser.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=6"`
}

func (h *Handler) ChangePassword(c *gin.Context) {
	authUser := middleware.GetUser(c)
	if authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.ChangePassword(authUser.UserID, req.CurrentPassword, req.NewPassword); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
