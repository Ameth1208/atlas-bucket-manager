package health_test

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/health"
	"github.com/gin-gonic/gin"
)

func TestHealthCheck(t *testing.T) {
	gin.SetMode(gin.TestMode)
	tempDir, err := os.MkdirTemp("", "atlas-health-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	db, err := database.Connect(tempDir)
	if err != nil {
		t.Fatalf("failed to connect db: %v", err)
	}
	defer db.Close()

	handler := health.NewHandler(db)
	r := gin.New()
	r.GET("/health", handler.Check)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
}
