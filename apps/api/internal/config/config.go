package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port       int
	NodeEnv    string
	JWTSecret  string
	CORSOrigin string
	DBPath     string
}

func Load() *Config {
	portStr := os.Getenv("PORT")
	port := 3001
	if portStr != "" {
		if p, err := strconv.Atoi(portStr); err == nil {
			port = p
		}
	}

	nodeEnv := os.Getenv("NODE_ENV")
	if nodeEnv == "" {
		nodeEnv = "development"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "atlas-production-fallback-secret-please-set-jwt-secret"
	}

	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:3000"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./data"
	}

	return &Config{
		Port:       port,
		NodeEnv:    nodeEnv,
		JWTSecret:  jwtSecret,
		CORSOrigin: corsOrigin,
		DBPath:     dbPath,
	}
}
