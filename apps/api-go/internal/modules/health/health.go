package health

import (
	"net/http"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	db *database.DB
}

func NewHandler(db *database.DB) *Handler {
	return &Handler{db: db}
}

func (h *Handler) Check(c *gin.Context) {
	if h.db == nil || h.db.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "error",
			"error":  "Database connection not established",
		})
		return
	}

	var one int
	if err := h.db.QueryRow("SELECT 1").Scan(&one); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "error",
			"error":  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"info": gin.H{
			"database": gin.H{
				"status": "up",
			},
		},
		"details": gin.H{
			"database": gin.H{
				"status": "up",
			},
		},
	})
}
