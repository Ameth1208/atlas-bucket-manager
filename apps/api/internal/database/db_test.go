package database_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/database"
)

func TestDatabaseConnectAndMigrate(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "atlas-test-db-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	db, err := database.Connect(tempDir)
	if err != nil {
		t.Fatalf("failed to connect to db: %v", err)
	}
	defer db.Close()

	// Verify table exists
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		t.Fatalf("failed to query users table: %v", err)
	}
	if count != 0 {
		t.Errorf("expected 0 users, got %d", count)
	}

	// Verify DB file created
	dbFile := filepath.Join(tempDir, "atlas.db")
	if _, err := os.Stat(dbFile); os.IsNotExist(err) {
		t.Fatalf("expected atlas.db to exist at %s", dbFile)
	}
}
