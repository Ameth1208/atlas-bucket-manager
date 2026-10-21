package auth_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/config"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/middleware"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/modules/auth"
	"github.com/gin-gonic/gin"
)

func setupTestApp(t *testing.T) (*gin.Engine, *database.DB, *config.Config, func()) {
	gin.SetMode(gin.TestMode)
	tempDir, err := os.MkdirTemp("", "atlas-auth-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}

	db, err := database.Connect(tempDir)
	if err != nil {
		t.Fatalf("failed to connect db: %v", err)
	}

	cfg := &config.Config{
		JWTSecret:  "test-secret-key-1234567890",
		NodeEnv:    "development",
		CORSOrigin: "http://localhost:3000",
	}

	svc := auth.NewService(db, cfg)
	handler := auth.NewHandler(svc, cfg)

	r := gin.New()
	r.GET("/api/auth/status", handler.Status)
	r.POST("/api/auth/setup", handler.Setup)
	r.POST("/api/auth/login", handler.Login)

	authed := r.Group("/api/auth")
	authed.Use(middleware.AuthMiddleware(cfg, db))
	{
		authed.POST("/logout", handler.Logout)
		authed.GET("/me", handler.Me)
		authed.POST("/change-password", handler.ChangePassword)
	}

	cleanup := func() {
		db.Close()
		os.RemoveAll(tempDir)
	}

	return r, db, cfg, cleanup
}

func TestAuthFlow(t *testing.T) {
	r, _, _, cleanup := setupTestApp(t)
	defer cleanup()

	// 1. Initial status -> isSetup: false
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/auth/status", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var statusRes map[string]bool
	_ = json.Unmarshal(w.Body.Bytes(), &statusRes)
	if statusRes["isSetup"] != false {
		t.Fatalf("expected isSetup=false, got true")
	}

	// 2. Setup owner
	setupPayload := map[string]string{
		"name":     "Admin User",
		"email":    "admin@atlas.local",
		"password": "Password123!",
	}
	body, _ := json.Marshal(setupPayload)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/auth/setup", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 setup, got %d: %s", w.Code, w.Body.String())
	}

	// Extract auth_token cookie
	cookies := w.Result().Cookies()
	var authCookie *http.Cookie
	for _, c := range cookies {
		if c.Name == "auth_token" {
			authCookie = c
			break
		}
	}
	if authCookie == nil {
		t.Fatalf("expected auth_token cookie to be set")
	}

	// 3. Status after setup -> isSetup: true
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/auth/status", nil)
	r.ServeHTTP(w, req)
	_ = json.Unmarshal(w.Body.Bytes(), &statusRes)
	if statusRes["isSetup"] != true {
		t.Fatalf("expected isSetup=true, got false")
	}

	// 4. Me endpoint with cookie
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/auth/me", nil)
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 me, got %d: %s", w.Code, w.Body.String())
	}
	var meRes map[string]interface{}
	_ = json.Unmarshal(w.Body.Bytes(), &meRes)
	if meRes["email"] != "admin@atlas.local" || meRes["role"] != "owner" {
		t.Fatalf("unexpected user payload: %v", meRes)
	}

	// 5. Change password
	changePayload := map[string]string{
		"currentPassword": "Password123!",
		"newPassword":     "NewPassword456!",
	}
	body, _ = json.Marshal(changePayload)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/auth/change-password", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 change password, got %d: %s", w.Code, w.Body.String())
	}

	// 6. Login with new password
	loginPayload := map[string]string{
		"email":    "admin@atlas.local",
		"password": "NewPassword456!",
	}
	body, _ = json.Marshal(loginPayload)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 login, got %d: %s", w.Code, w.Body.String())
	}
}
