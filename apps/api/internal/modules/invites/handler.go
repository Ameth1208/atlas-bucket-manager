package invites

import (
	"fmt"
	"net/http"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/config"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/domain"
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
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_token", token, 7*24*60*60, "/", "", isProd, true)
}

type CreateInviteRequest struct {
	Role  domain.UserRole `json:"role"`
	Email *string         `json:"email"`
}

func (h *Handler) Create(c *gin.Context) {
	authUser := middleware.GetUser(c)
	var createdBy string
	if authUser != nil {
		createdBy = authUser.UserID
	}

	var req CreateInviteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	inv, err := h.svc.Create(req.Role, req.Email, createdBy)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	url := fmt.Sprintf("/invite?token=%s", inv.Token)
	c.JSON(http.StatusOK, gin.H{
		"invite": inv,
		"url":    url,
	})
}

func (h *Handler) List(c *gin.Context) {
	list, err := h.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.Delete(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (h *Handler) Validate(c *gin.Context) {
	token := c.Param("token")
	role, email, err := h.svc.Validate(token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"valid": false, "error": err.Error()})
		return
	}

	res := gin.H{
		"valid": true,
		"role":  string(role),
	}
	if email != nil {
		res["email"] = *email
	}
	c.JSON(http.StatusOK, res)
}

type AcceptInviteRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *Handler) Accept(c *gin.Context) {
	token := c.Param("token")
	var req AcceptInviteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, jwtToken, err := h.svc.Accept(token, req.Name, req.Password, req.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.setCookie(c, jwtToken)
	c.JSON(http.StatusOK, user)
}
