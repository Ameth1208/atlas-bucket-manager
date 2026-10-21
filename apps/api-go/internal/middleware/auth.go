package middleware

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/config"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api-go/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthUser struct {
	UserID   string          `json:"userId"`
	Email    string          `json:"email"`
	Role     domain.UserRole `json:"role"`
	ApiKeyID *string         `json:"apiKeyId,omitempty"`
	Scopes   *string         `json:"scopes,omitempty"`
}

type Claims struct {
	UserID string          `json:"userId"`
	Email  string          `json:"email"`
	Role   domain.UserRole `json:"role"`
	jwt.RegisteredClaims
}

func AuthMiddleware(cfg *config.Config, db *database.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check for Bearer token in Authorization header
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer atl_") {
			rawKey := strings.TrimPrefix(authHeader, "Bearer ")
			hashBytes := sha256.Sum256([]byte(rawKey))
			hash := hex.EncodeToString(hashBytes[:])

			var key domain.ApiKeyInfo
			var revokedAt *int64
			err := db.QueryRow(`
				SELECT id, name, prefix, scopes, user_id, bucket_filter, last_used, created_at, revoked_at
				FROM api_keys WHERE key_hash = ?
			`, hash).Scan(
				&key.ID, &key.Name, &key.Prefix, &key.Scopes, &key.UserID,
				&key.BucketFilter, &key.LastUsed, &key.CreatedAt, &revokedAt,
			)

			if err == nil && revokedAt == nil {
				now := time.Now().Unix()
				_, _ = db.Exec("UPDATE api_keys SET last_used = ? WHERE id = ?", now, key.ID)

				c.Set("user", &AuthUser{
					UserID:   key.UserID,
					Email:    "apikey",
					Role:     domain.UserRole("apikey"),
					ApiKeyID: &key.ID,
					Scopes:   &key.Scopes,
				})
				c.Next()
				return
			}

			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or revoked API key"})
			return
		}

		// Check for auth_token cookie
		tokenStr, err := c.Cookie("auth_token")
		if err != nil || tokenStr == "" {
			// Also check Bearer JWT if provided
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenStr == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		c.Set("user", &AuthUser{
			UserID: claims.UserID,
			Email:  claims.Email,
			Role:   claims.Role,
		})
		c.Next()
	}
}

func GetUser(c *gin.Context) *AuthUser {
	if val, ok := c.Get("user"); ok {
		if user, ok := val.(*AuthUser); ok {
			return user
		}
	}
	return nil
}

func RequireRoles(roles ...domain.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetUser(c)
		if user == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Owner has universal access
		if user.Role == domain.RoleOwner {
			c.Next()
			return
		}

		for _, r := range roles {
			if user.Role == r {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
	}
}
