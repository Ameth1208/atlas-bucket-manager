package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/config"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/middleware"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/activity"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/apikeys"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/auth"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/buckets"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/copy"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/favorites"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/health"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/integrations"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/invites"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/objects"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/providers"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/modules/users"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/s3"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func BuildRouter(cfg *config.Config, db *database.DB) *gin.Engine {
	if cfg.NodeEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())

	// CORS
	corsConfig := cors.Config{
		AllowOrigins:     []string{cfg.CORSOrigin, "http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Disposition"},
		AllowCredentials: true,
	}
	r.Use(cors.New(corsConfig))

	// Services & Managers
	s3Mgr := s3.NewManager(db)
	authSvc := auth.NewService(db, cfg)
	userSvc := users.NewService(db)
	inviteSvc := invites.NewService(db, authSvc, cfg)
	providerSvc := providers.NewService(db, s3Mgr)
	bucketSvc := buckets.NewService(db, s3Mgr)
	objectSvc := objects.NewService(db, s3Mgr)
	copySvc := copy.NewService(db, s3Mgr)
	favSvc := favorites.NewService(db)
	apiKeySvc := apikeys.NewService(db)
	actSvc := activity.NewService(db)
	integSvc := integrations.NewService(db)

	// Handlers
	healthHandler := health.NewHandler(db)
	authHandler := auth.NewHandler(authSvc, cfg)
	userHandler := users.NewHandler(userSvc)
	inviteHandler := invites.NewHandler(inviteSvc, cfg)
	providerHandler := providers.NewHandler(providerSvc)
	bucketHandler := buckets.NewHandler(bucketSvc)
	objectHandler := objects.NewHandler(objectSvc)
	copyHandler := copy.NewHandler(copySvc)
	favHandler := favorites.NewHandler(favSvc)
	apiKeyHandler := apikeys.NewHandler(apiKeySvc)
	actHandler := activity.NewHandler(actSvc)
	integHandler := integrations.NewHandler(integSvc)
	socketioServer := copy.NewSocketIOServer(copySvc)

	// ── Top-level endpoints ─────────────────────────
	r.GET("/health", healthHandler.Check)
	r.Any("/socket.io/*any", socketioServer.Handle)

	// ── API Group ───────────────────────────────────
	api := r.Group("/api")

	// Public Auth routes
	api.GET("/auth/status", authHandler.Status)
	api.POST("/auth/setup", authHandler.Setup)
	api.POST("/auth/login", authHandler.Login)
	api.POST("/users/public/reset-password/accept", userHandler.AcceptPasswordReset)
	api.POST("/invites/public/:token/validate", inviteHandler.Validate)
	api.POST("/invites/public/:token/accept", inviteHandler.Accept)

	// Public Object share routes
	api.GET("/public/share/:providerId/:bucket/*key", objectHandler.PublicStream)

	// Protected routes
	authRequired := api.Group("")
	authRequired.Use(middleware.AuthMiddleware(cfg, db))

	// Auth & Self
	authRequired.POST("/auth/logout", authHandler.Logout)
	authRequired.GET("/auth/me", authHandler.Me)
	authRequired.POST("/auth/change-password", authHandler.ChangePassword)

	// Users (Owner / Admin)
	adminOnly := authRequired.Group("")
	adminOnly.Use(middleware.RequireRoles(domain.RoleAdmin, domain.RoleOwner))
	{
		adminOnly.GET("/users", userHandler.List)
		adminOnly.POST("/users", userHandler.Create)
		adminOnly.PUT("/users/:id", userHandler.Update)
		adminOnly.POST("/users/:id/reset-password", userHandler.ResetPassword)
		adminOnly.DELETE("/users/:id", userHandler.Delete)

		adminOnly.GET("/invites", inviteHandler.List)
		adminOnly.POST("/invites", inviteHandler.Create)
		adminOnly.DELETE("/invites/:id", inviteHandler.Delete)

		adminOnly.GET("/providers", providerHandler.List)
		adminOnly.GET("/providers/:id", providerHandler.Get)
		adminOnly.POST("/providers", providerHandler.Create)
		adminOnly.PUT("/providers/:id", providerHandler.Update)
		adminOnly.DELETE("/providers/:id", providerHandler.Remove)

		adminOnly.POST("/buckets", bucketHandler.Create)
		adminOnly.DELETE("/buckets/:providerId/:name", bucketHandler.Remove)
		adminOnly.PUT("/buckets/:providerId/:name/policy", bucketHandler.SetPolicy)
		adminOnly.PUT("/buckets/:providerId/:name/limit", bucketHandler.SetLimit)

		adminOnly.GET("/api-keys", apiKeyHandler.List)
		adminOnly.POST("/api-keys", apiKeyHandler.Create)
		adminOnly.DELETE("/api-keys/:id", apiKeyHandler.Revoke)

		adminOnly.GET("/activity", actHandler.List)

		adminOnly.GET("/integrations/webhooks", integHandler.ListWebhooks)
		adminOnly.POST("/integrations/webhooks", integHandler.CreateWebhook)
		adminOnly.DELETE("/integrations/webhooks/:id", integHandler.DeleteWebhook)
		adminOnly.POST("/integrations/webhooks/:id/test", integHandler.TestWebhook)
		adminOnly.GET("/integrations/notifications", integHandler.GetNotificationPrefs)
		adminOnly.PUT("/integrations/notifications", integHandler.UpdateNotificationPrefs)
	}

	// Users delete self
	authRequired.DELETE("/users/me", userHandler.DeleteSelf)

	// Buckets & Stats
	authRequired.GET("/buckets", bucketHandler.List)
	authRequired.GET("/buckets/stats", bucketHandler.StatsMany)
	authRequired.GET("/buckets/:providerId/:name/stats", bucketHandler.Stats)
	authRequired.GET("/buckets/:providerId/:name/public-endpoint", bucketHandler.PublicEndpoint)

	// Objects
	authRequired.GET("/buckets/:providerId/:name/objects", objectHandler.List)
	authRequired.GET("/buckets/:providerId/:name/objects/*key", objectHandler.DispatchObject)
	authRequired.GET("/buckets/:providerId/:name/zip", objectHandler.DownloadZip)
	authRequired.POST("/buckets/:providerId/:name/zip", objectHandler.DownloadZipPost)
	authRequired.POST("/buckets/:providerId/:name/folder", objectHandler.CreateFolder)
	authRequired.POST("/buckets/:providerId/:name/upload", objectHandler.Upload)
	authRequired.DELETE("/buckets/:providerId/:name/objects", objectHandler.Delete)
	authRequired.GET("/search", objectHandler.Search)
	authRequired.GET("/objects/types", objectHandler.FileTypes)

	// Copy
	authRequired.GET("/copy/jobs", copyHandler.List)
	authRequired.GET("/copy/jobs/:id", copyHandler.Get)
	authRequired.POST("/copy/start", copyHandler.Start)
	authRequired.POST("/copy/jobs/:id/cancel", copyHandler.Cancel)
	authRequired.DELETE("/copy/jobs/:id", copyHandler.Delete)

	// Favorites
	authRequired.GET("/favorites", favHandler.List)
	authRequired.POST("/favorites", favHandler.Add)
	authRequired.DELETE("/favorites/:providerId/:bucketName", favHandler.Remove)

	return r
}

func main() {
	cfg := config.Load()
	db, err := database.Connect(cfg.DBPath)
	if err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}
	defer db.Close()

	r := BuildRouter(cfg, db)

	addr := fmt.Sprintf("0.0.0.0:%d", cfg.Port)
	log.Printf("🚀 Atlas API (Go) running at http://%s", addr)
	log.Printf("🔌 WebSocket / Socket.IO enabled at /socket.io")

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("❌ Server error: %v", err)
	}
}
