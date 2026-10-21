package apikeys_test

import (
	"os"
	"testing"

	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/database"
	"github.com/ameth1208/atlas-bucket-manager/apps/api/internal/modules/apikeys"
)

func TestApiKeysCRUD(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "atlas-apikeys-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	db, err := database.Connect(tempDir)
	if err != nil {
		t.Fatalf("failed to connect db: %v", err)
	}
	defer db.Close()

	// Seed user
	_, err = db.Exec("INSERT INTO users (id, name, email, password_hash, role) VALUES ('u1', 'User', 'u@test.local', 'hash', 'owner')")
	if err != nil {
		t.Fatalf("failed to seed user: %v", err)
	}

	svc := apikeys.NewService(db)

	key, err := svc.Create("u1", "Deploy Token", "read,write", nil)
	if err != nil {
		t.Fatalf("failed to create api key: %v", err)
	}
	if key.FullKey == "" || len(key.Prefix) == 0 {
		t.Fatalf("invalid generated key: %+v", key)
	}

	list, err := svc.List("u1")
	if err != nil || len(list) != 1 {
		t.Fatalf("expected 1 key in list, got %d", len(list))
	}

	err = svc.Revoke(key.ID)
	if err != nil {
		t.Fatalf("failed to revoke key: %v", err)
	}

	listAfter, _ := svc.List("u1")
	if listAfter[0].RevokedAt == nil {
		t.Fatalf("expected key to be revoked")
	}
}
