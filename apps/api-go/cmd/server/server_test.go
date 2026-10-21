package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/config"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/gin-gonic/gin"
)

func setupTestServer(t *testing.T) (*gin.Engine, *database.DB, func()) {
	gin.SetMode(gin.TestMode)
	tempDir, err := os.MkdirTemp("", "atlas-server-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}

	db, err := database.Connect(tempDir)
	if err != nil {
		t.Fatalf("failed to connect db: %v", err)
	}

	cfg := &config.Config{
		Port:       3001,
		JWTSecret:  "server-test-jwt-secret-9999",
		NodeEnv:    "development",
		CORSOrigin: "http://localhost:3000",
		DBPath:     tempDir,
	}

	r := BuildRouter(cfg, db)

	cleanup := func() {
		db.Close()
		os.RemoveAll(tempDir)
	}

	return r, db, cleanup
}

func TestFullAPIWorkflow(t *testing.T) {
	r, _, cleanup := setupTestServer(t)
	defer cleanup()

	// 1. Health check
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("health check failed: %d", w.Code)
	}

	// 2. Initial Auth status
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/auth/status", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("status failed: %d", w.Code)
	}

	// 3. Setup owner account
	setupBody := map[string]string{
		"name":     "Super Admin",
		"email":    "owner@atlas.local",
		"password": "Password123!",
	}
	b, _ := json.Marshal(setupBody)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/auth/setup", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("setup failed: %d, %s", w.Code, w.Body.String())
	}

	authCookie := w.Result().Cookies()[0]

	// 4. Me endpoint
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/auth/me", nil)
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("me failed: %d", w.Code)
	}
	var me domain.User
	_ = json.Unmarshal(w.Body.Bytes(), &me)
	if me.Role != domain.RoleOwner {
		t.Fatalf("expected role owner, got %s", me.Role)
	}

	// 5. Create an API Key
	keyReq := map[string]string{
		"name":   "CI Key",
		"scopes": "read,write",
	}
	b, _ = json.Marshal(keyReq)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/api-keys", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("create api key failed: %d, %s", w.Code, w.Body.String())
	}
	var createdKey domain.CreatedApiKey
	_ = json.Unmarshal(w.Body.Bytes(), &createdKey)
	if createdKey.FullKey == "" {
		t.Fatalf("expected fullKey, got empty")
	}

	// 6. Test authenticating via the new API key: Bearer atl_...
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/favorites", nil)
	req.Header.Set("Authorization", "Bearer "+createdKey.FullKey)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("api key authentication failed: %d, %s", w.Code, w.Body.String())
	}

	// 7. Test Favorites CRUD
	favReq := map[string]string{
		"providerId": "p-1",
		"bucketName": "my-bucket",
	}
	b, _ = json.Marshal(favReq)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/favorites", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("add favorite failed: %d, %s", w.Code, w.Body.String())
	}

	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/favorites", nil)
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("list favorites failed: %d", w.Code)
	}
	var favs []domain.Favorite
	_ = json.Unmarshal(w.Body.Bytes(), &favs)
	if len(favs) != 1 || favs[0].BucketName != "my-bucket" {
		t.Fatalf("unexpected favorites: %v", favs)
	}

	// 8. Test Notifications preferences
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/integrations/notifications", nil)
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("notifications prefs failed: %d", w.Code)
	}
	var notif domain.NotificationPrefs
	_ = json.Unmarshal(w.Body.Bytes(), &notif)
	if !notif.EmailEnabled {
		t.Fatalf("expected default emailEnabled=true")
	}

	// 9. Test Activity log listing
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/activity", nil)
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("activity listing failed: %d", w.Code)
	}

	// 10. Test Invites creation and validation
	invReq := map[string]string{
		"role":  "admin",
		"email": "teammate@atlas.local",
	}
	b, _ = json.Marshal(invReq)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/invites", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("create invite failed: %d, %s", w.Code, w.Body.String())
	}
	var invRes struct {
		Invite domain.Invite `json:"invite"`
		URL    string        `json:"url"`
	}
	_ = json.Unmarshal(w.Body.Bytes(), &invRes)

	// Validate public invite
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/invites/public/"+invRes.Invite.Token+"/validate", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("validate invite failed: %d, %s", w.Code, w.Body.String())
	}

	// 11. Test Bucket name regex validation
	invalidBucketReq := map[string]string{
		"name":       "INVALID_UPPERCASE_BUCKET!",
		"providerId": "p-1",
	}
	b, _ = json.Marshal(invalidBucketReq)
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/buckets", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(authCookie)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for invalid bucket name, got %d", w.Code)
	}
}
